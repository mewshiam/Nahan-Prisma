/**
 * ──────────────────────────────────────────────────────────────────────
 * Nahan-Prisma — server entry (Bun / Prisma Compute)
 * ──────────────────────────────────────────────────────────────────────
 * Replaces the Cloudflare Workers runtime entry (`export default` in
 * _worker.js) with a long-lived Bun HTTP + WebSocket server.
 *
 *   Cloudflare Workers              Prisma Compute (this file)
 *   ─────────────────────           ──────────────────────────────
 *   export default { fetch }   →    Bun.serve({ fetch })
 *   WebSocketPair + 101        →    server.upgrade() + handlers
 *   D1 binding (IOT_DB)        →    bun:sqlite via src/compat/d1.ts
 *   cloudflare:sockets         →    Bun.connect via src/compat/sockets.ts
 *   cron triggers (scheduled)  →    setInterval → handleScheduled()
 *   ctx.waitUntil              →    plain promise (process outlives req)
 */

import { getEnv, getCtx, serverPort } from "./compat/runtime";
import { handleFetch, handleScheduled, createTunnel } from "./worker";

// ── runtime bindings (built once, shared by every request) ──────────
const env = getEnv();
const ctx = getCtx();

// ── scheduled sweep: Workers cron triggers ran the `scheduled` handler
//    for relay health probes + auto-update checks. On Prisma Compute we
//    run the same handler from a timer (default: every 5 minutes).
const SWEEP_INTERVAL_MS =
    Number(process.env.SWEEP_INTERVAL_MS) || 5 * 60 * 1000;
let sweepRunning = false;
async function runScheduledSweep() {
    if (sweepRunning) return;
    sweepRunning = true;
    try {
        await handleScheduled(
            { cron: "nahan-prisma-timer", scheduledTime: Date.now() },
            env,
            ctx,
        );
    } catch {
        /* never crash the timer loop */
    } finally {
        sweepRunning = false;
    }
}
setInterval(runScheduledSweep, SWEEP_INTERVAL_MS);

// ── the server ──────────────────────────────────────────────────────
const server = Bun.serve({
    port: serverPort(),
    maxRequestBodySize: 1024 * 1024 * 128, // 128 MB — dashboard sync payloads
    idleTimeout: 60, // seconds — tunnels keep alive via protocol pings

    fetch(request: Request): Response | undefined | Promise<Response | undefined> {
        // Client IP resolution (Cloudflare's cf-connecting-ip equivalent)
        // happens inside the worker via clientIpOf(): x-forwarded-for is
        // injected by the Prisma Compute edge proxy, falling back to the
        // raw socket address below — so plain requests need no cloning.
        const wsContext = {
            tryUpgrade(
                req: Request,
                envBinding: unknown,
                ctxShim: unknown,
                wsRelayIdx: number,
            ) {
                try {
                    return server.upgrade(req, {
                        data: {
                            env: envBinding,
                            ctx: ctxShim,
                            wsRelayIdx,
                            tunnel: null as ReturnType<
                                typeof createTunnel
                            > | null,
                        },
                    });
                } catch {
                    return false;
                }
            },
        };

        return handleFetch(request, env, ctx, wsContext);
    },

    websocket: {
        // Connection accepted: spin up the tunnel state machine (the
        // port of startDataPipe). All protocol logic stays in worker.ts.
        open(ws) {
            try {
                const d = ws.data as {
                    env: unknown;
                    ctx: unknown;
                    wsRelayIdx: number;
                    tunnel: ReturnType<typeof createTunnel> | null;
                };
                d.tunnel = createTunnel(ws, d.env, d.ctx, d.wsRelayIdx ?? -1);
            } catch {
                try {
                    ws.close();
                } catch {
                    /* ignore */
                }
            }
        },

        // Client bytes: VLESS/Trojan header on first frame, raw TCP after.
        // PORT NOTE: Cloudflare's WebSocketPair with binaryType
        // "arraybuffer" delivered event.data as an ArrayBuffer; Bun's
        // server WebSocket delivers a Buffer (Uint8Array view). The
        // protocol parser slices the message and wraps it in DataView,
        // which requires a genuine ArrayBuffer — so normalize here,
        // preserving the exact upstream byte semantics.
        message(ws, message) {
            const d = ws.data as {
                tunnel: ReturnType<typeof createTunnel> | null;
            };
            try {
                let data: ArrayBuffer | Uint8Array = message as
                    | ArrayBuffer
                    | Uint8Array;
                if (!(data instanceof ArrayBuffer) && data?.byteLength !== undefined) {
                    const ab = new ArrayBuffer((data as Uint8Array).byteLength);
                    new Uint8Array(ab).set(data as Uint8Array);
                    data = ab;
                }
                d?.tunnel?.onMessage(data);
            } catch {
                try {
                    ws.close();
                } catch {
                    /* ignore */
                }
            }
        },

        // Tear down: usage accounting + relay health bookkeeping.
        close(ws) {
            const d = ws.data as {
                tunnel: ReturnType<typeof createTunnel> | null;
            };
            try {
                d?.tunnel?.onClose();
            } catch {
                /* ignore */
            }
        },
    },
});

console.log(
    [
        "",
        "  ███╗   ██╗ █████╗ ██╗   ██╗██████╗  █████╗ ",
        "  ████╗  ██║██╔══██╗██║   ██║██╔══██╗██╔══██╗",
        "  ██╔██╗ ██║███████║██║   ██║██████╔╝███████║",
        "  ██║╚██╗██║██╔══██║██║   ██║██╔══██╗██╔══██║",
        "  ██║ ╚████║██║  ██║╚██████╔╝██║  ██║██║  ██║",
        "  ╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝",
        "",
        `  Nahan-Prisma gateway listening on :${server.port}`,
        `  State (SQLite): ${(env.IOT_DB as { databasePath: string }).databasePath}`,
        "  Dashboard:      /sync/dash  (default route — change it after login!)",
        "  Subscription:   /sync       (add ?sub=<user> for multi-user)",
        "  Camouflage:     /           (proxies to the maintenance host)",
        "",
    ].join("\n"),
);

// ── graceful shutdown ───────────────────────────────────────────────
process.on("SIGTERM", () => {
    console.log("[nahan-prisma] SIGTERM — shutting down");
    try {
        (env.IOT_DB as { close(): void }).close();
    } catch {
        /* ignore */
    }
    server.stop(true);
    process.exit(0);
});
process.on("SIGINT", () => {
    process.exit(0);
});
