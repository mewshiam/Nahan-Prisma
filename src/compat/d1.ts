/**
 * ──────────────────────────────────────────────────────────────────────
 * D1 → SQLite compatibility adapter (Cloudflare Workers → Prisma Compute)
 * ──────────────────────────────────────────────────────────────────────
 *
 * PORT NOTE (Cloudflare → Prisma Compute):
 * On Cloudflare Workers, Nahan persists all of its state (sys_config,
 * sys_usage, backup_ip, sys_logs, sys_templates …) in a bound D1 SQLite
 * database exposed as `env.IOT_DB` with the fluent API:
 *
 *     await env.IOT_DB.prepare(sql).bind(...args).all()  // { results: [] }
 *     await env.IOT_DB.prepare(sql).bind(...args).run()
 *
 * Prisma Compute runs plain Bun on a microVM — there is no D1 binding and
 * no other middleware. Bun ships SQLite natively via `bun:sqlite`, so this
 * adapter implements the exact D1 surface Nahan uses (prepare/bind/all/run)
 * on top of a local SQLite file. The worker code above therefore keeps
 * calling `env.IOT_DB.prepare(...)` unchanged; only the implementation
 * behind the interface changed.
 *
 * Durability: the SQLite file lives in DATA_DIR (default ./data) on the
 * deployment's filesystem. Prisma Compute deployments are stateful for the
 * lifetime of the deployment; moving the file (or enabling backups from
 * the dashboard) preserves state across redeploys.
 */

import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export interface D1Result<T = unknown> {
    results: T[];
    success: boolean;
    meta?: Record<string, unknown>;
}

interface BoundStatement {
    all(): Promise<D1Result> | D1Result;
    run(): Promise<D1Result> | D1Result;
    first<T = unknown>(): Promise<T | null> | T | null;
}

interface PreparedStatement {
    bind(...args: unknown[]): BoundStatement;
    all(): Promise<D1Result> | D1Result;
    run(): Promise<D1Result> | D1Result;
    first<T = unknown>(): Promise<T | null> | T | null;
}

/**
 * A minimal, D1-compatible database facade backed by bun:sqlite.
 * Nahan only uses: prepare(sql) → (bind(args))? → all()/run()
 */
export class D1SqliteAdapter {
    private db: Database;
    readonly databasePath: string;

    constructor(dataDir: string, filename = "nahan.sqlite") {
        try {
            mkdirSync(dataDir, { recursive: true });
        } catch {
            /* cwd-relative fallback already handles most cases */
        }
        this.databasePath = join(dataDir, filename);
        this.db = new Database(this.databasePath, { create: true });
        // Nahan is a single long-lived Bun process (not an isolate-per-
        // request like Workers), so we can safely enable WAL for better
        // concurrent read/write performance across many tunnels.
        this.db.exec("PRAGMA journal_mode = WAL;");
        this.db.exec("PRAGMA busy_timeout = 5000;");
    }

    /** D1-compatible prepare() — returns a chainable statement. */
    prepare(sql: string): PreparedStatement {
        const makeBound = (params: unknown[]): BoundStatement => ({
            all: () => {
                try {
                    const stmt = this.db.prepare(sql);
                    const rows = stmt.all(...params) as Record<string, unknown>[];
                    return { results: rows, success: true, meta: {} };
                } catch (e) {
                    // D1 throws on SQL errors too — mirror that behaviour.
                    throw e;
                }
            },
            run: () => {
                try {
                    const stmt = this.db.prepare(sql);
                    const info = stmt.run(...(params as never[]));
                    return {
                        results: [],
                        success: true,
                        meta: {
                            changes: info.changes,
                            last_insert_rowid: Number(info.lastInsertRowid),
                        },
                    };
                } catch (e) {
                    throw e;
                }
            },
            first: () => {
                const stmt = this.db.prepare(sql);
                return (stmt.get(...(params as never[])) ?? null) as unknown;
            },
        });

        return {
            bind: (...args: unknown[]) => makeBound(args),
            all: () => makeBound([]).all(),
            run: () => makeBound([]).run(),
            first: () => makeBound([]).first(),
        };
    }

    /** D1 raw exec (used by tooling; the worker itself uses prepare()). */
    exec(sql: string) {
        return this.db.exec(sql);
    }

    /** Close the underlying SQLite handle (graceful shutdown). */
    close() {
        try {
            this.db.close();
        } catch {
            /* ignore */
        }
    }
}
