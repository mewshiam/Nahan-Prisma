/**
 * ──────────────────────────────────────────────────────────────────────
 * Runtime shim: Cloudflare `env` / `ctx` → Prisma Compute process env
 * ──────────────────────────────────────────────────────────────────────
 *
 * PORT NOTE (Cloudflare → Prisma Compute):
 * Cloudflare Workers receive per-request bindings (`env`) and a request
 * lifetime context (`ctx.waitUntil`). Prisma Compute runs one long-lived
 * Bun process, so:
 *
 *   env.IOT_DB          → D1SqliteAdapter over a local SQLite file
 *   env.DASHBOARD_URL   → file:// URL of the bundled dashboard.html
 *   env.SUBSCRIPTION_URL→ file:// URL of the bundled subscription.html
 *   ctx.waitUntil(p)    → just run the promise (no isolate eviction to
 *                         race against; the process outlives requests)
 *   cf-connecting-ip    → derived from x-forwarded-for / socket address
 *
 * Everything the worker reads from `env` keeps working; only the source
 * of the values changed.
 */

import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { D1SqliteAdapter } from "./d1";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Resolve a bundled page asset across run layouts:
 *  - source layout (bun run src/index.ts)   → src/pages/*
 *  - repo-root cwd (Prisma Compute service) → <cwd>/src/pages/*
 *  - bundled layout (dist/compute.js)       → <dist>/../src/pages/*
 * Falls back to undefined → the worker then uses its GitHub raw fallback.
 */
function resolvePage(file: string): string | undefined {
    const candidates = [
        join(__dirname, "..", "pages", file), // src/compat → src/pages
        join(process.cwd(), "src", "pages", file),
        join(__dirname, "..", "src", "pages", file), // dist → src/pages
        join(__dirname, "pages", file),
    ];
    for (const c of candidates) {
        try {
            if (existsSync(c)) return c;
        } catch {
            /* try next */
        }
    }
    return undefined;
}

export interface EnvBindings {
    IOT_DB: D1SqliteAdapter;
    IOT_DB_INITIALIZED?: boolean;
    DASHBOARD_URL?: string;
    SUBSCRIPTION_URL?: string;
    [key: string]: unknown;
}

export interface CtxShim {
    waitUntil(promise: Promise<unknown>): void;
    props?: Record<string, unknown>;
}

let cachedEnv: EnvBindings | null = null;

/** Build (once) the Cloudflare-shaped env object for the Bun process. */
export function getEnv(): EnvBindings {
    if (cachedEnv) return cachedEnv;

    const dataDir =
        process.env.DATA_DIR && process.env.DATA_DIR.trim().length > 0
            ? process.env.DATA_DIR.trim()
            : join(process.cwd(), "data");

    const iotDb = new D1SqliteAdapter(dataDir, "nahan.sqlite");

    const dashboardPath = resolvePage("dashboard.html");
    const subscriptionPath = resolvePage("subscription.html");

    const env: EnvBindings = {
        IOT_DB: iotDb,
        DASHBOARD_URL:
            process.env.DASHBOARD_URL && process.env.DASHBOARD_URL.trim().length > 0
                ? process.env.DASHBOARD_URL.trim()
                : existsSync(dashboardPath)
                  ? `file://${dashboardPath}`
                  : undefined,
        SUBSCRIPTION_URL:
            process.env.SUBSCRIPTION_URL &&
            process.env.SUBSCRIPTION_URL.trim().length > 0
                ? process.env.SUBSCRIPTION_URL.trim()
                : existsSync(subscriptionPath)
                  ? `file://${subscriptionPath}`
                  : undefined,
    };

    cachedEnv = env;
    return env;
}

/**
 * Cloudflare's `ctx.waitUntil` keeps a promise alive past the response.
 * In a long-lived Bun process there is nothing to race — running the
 * promise is enough. Rejections are swallowed to match Workers.
 */
export function getCtx(): CtxShim {
    return {
        waitUntil(promise: Promise<unknown>) {
            try {
                Promise.resolve(promise).catch(() => {});
            } catch {
                /* ignore */
            }
        },
    };
}

/**
 * Cloudflare injects `cf-connecting-ip` on every request; Prisma Compute
 * sits behind an edge proxy that provides `x-forwarded-for`. The worker's
 * rate limiters / logs read the CF header — resolve it from the headers
 * we actually have, falling back to the raw socket address.
 */
export function clientIpOf(request: Request, server?: unknown): string {
    const xf = request.headers.get("x-forwarded-for");
    if (xf && xf.trim().length > 0) {
        return xf.split(",")[0].trim();
    }
    const xri = request.headers.get("x-real-ip");
    if (xri && xri.trim().length > 0) return xri.trim();
    try {
        const anyServer = server as { requestIP?: (r: Request) => { address: string; family: string } | null } | undefined;
        if (anyServer && typeof anyServer.requestIP === "function") {
            const addr = anyServer.requestIP(request);
            if (addr && addr.address) return addr.address;
        }
    } catch {
        /* ignore */
    }
    return "127.0.0.1";
}

/** Normalized port (Prisma Compute injects PORT; local default 3000). */
export function serverPort(): number {
    const p = Number(process.env.PORT);
    return Number.isFinite(p) && p > 0 ? p : 3000;
}
