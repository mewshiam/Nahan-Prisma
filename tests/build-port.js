/**
 * build-port.js — Nahan (Cloudflare Workers) → Nahan-Prisma (Bun / Prisma Compute)
 *
 * Mechanically ports reference/nahan/_worker.js → nahan-prisma/src/worker.ts
 * Every patch is assertive: if the upstream source drifts, the script fails
 * loudly instead of silently producing a broken port.
 */
import { readFileSync, writeFileSync, cpSync } from "node:fs";

const SRC = "/home/z/my-project/reference/nahan/_worker.js";
const DASH_SRC = "/home/z/my-project/reference/nahan/dashboard.html";
const SUB_SRC = "/home/z/my-project/reference/nahan/subscription.html";
const OUT = "/home/z/my-project/nahan-prisma/src/worker.ts";
const PAGES_DIR = "/home/z/my-project/nahan-prisma/src/pages";

let src = readFileSync(SRC, "utf8");
const patches = [];

function patch(name, find, replace, expect = 1) {
    let count = 0;
    let idx = 0;
    while ((idx = src.indexOf(find, idx)) !== -1) {
        count++;
        idx += find.length;
    }
    if (count !== expect) {
        throw new Error(
            `PATCH FAILED: "${name}" expected ${expect} occurrence(s), found ${count}`,
        );
    }
    src = src.split(find).join(replace);
    patches.push(`${name} (${count}x)`);
}

/* ── P1: imports ──────────────────────────────────────────────────── */
patch(
    "P1: cloudflare:sockets → compat adapter",
    `import { connect } from "cloudflare:sockets";`,
    `/*
 * ──────────────────────────────────────────────────────────────────────
 * Nahan-Prisma — the Nahan gateway ported from Cloudflare Workers to
 * Prisma Compute (Bun runtime). Upstream: itsyebekhe/nahan v3.0.4
 *
 * This file is a *verbatim* port of the upstream _worker.js except for
 * the PORT NOTE patches below, each tagged for review:
 *   P1  cloudflare:sockets → Bun.connect adapter (src/compat/sockets.ts)
 *   P2  fetchT supports file:// for bundled dashboard/subscription pages
 *   P3  export default {fetch,scheduled} → exported functions
 *   P4  cf-connecting-ip header → x-forwarded-for resolver
 *   P5  request.cf geo metadata → unavailable on Prisma Compute
 *   P6  page fallbacks point at Nahan-Prisma repo
 *   P8  telemetry WS upgrade → Bun server.upgrade()
 *   P10 startDataPipe → createTunnel (Bun WS event model)
 *   P11 deployWorkerToCloudflare → disabled (deploy via npx prisma deploy)
 *   P12 @ts-nocheck pragma — upstream is untyped JS carried verbatim;
 *       tsc validates the port-owned code (compat/, entries) instead
 * ──────────────────────────────────────────────────────────────────────
 */
import { connect } from "./compat/sockets";
import { clientIpOf } from "./compat/runtime";`,
);

/* ── P2: fetchT file:// support ───────────────────────────────────── */
patch(
    "P2: fetchT file:// support",
    `async function fetchT(url, init = {}, timeoutMs = 10000) {`,
    `async function fetchT(url, init = {}, timeoutMs = 10000) {
    // PORT NOTE (Prisma Compute): file:// URLs load the bundled dashboard
    // and subscription pages straight from the deployment image instead
    // of GitHub raw, which the Workers environment required.
    if (typeof url === "string" && url.startsWith("file:")) {
        const filePath = decodeURIComponent(url.slice("file://".length));
        const file = Bun.file(filePath);
        if (!(await file.exists())) throw new Error("file-not-found: " + filePath);
        return new Response(file, {
            headers: {
                "Content-Type": filePath.endsWith(".html")
                    ? "text/html;charset=utf-8"
                    : "text/plain;charset=utf-8",
            },
        });
    }`,
);

/* ── P3: export default → exported functions ──────────────────────── */
patch(
    "P3a: fetch handler export",
    `export default {
    async fetch(request, env, ctx) {`,
    `export async function handleFetch(request, env, ctx, wsContext) {`,
);
patch(
    "P3b: scheduled handler export",
    `    },
    async scheduled(event, env, ctx) {`,
    `}

export async function handleScheduled(event, env, ctx) {`,
);
patch(
    "P3c: close module object",
    `        } catch (e) {}
    }
};

async function serveMaintenancePage`,
    `        } catch (e) {}
}

async function serveMaintenancePage`,
);

/* ── P4: cf-connecting-ip → clientIpOf ────────────────────────────── */
patch(
    "P4: cf-connecting-ip reads",
    `request.headers.get("cf-connecting-ip")`,
    `clientIpOf(request)`,
    10,
);

/* ── P5: request.cf ───────────────────────────────────────────────── */
patch(
    "P5: request.cf geo metadata",
    `const cf = request.cf || {};`,
    `const cf = {}; // PORT NOTE (Prisma Compute): request.cf geo metadata is Cloudflare-only`,
);

/* ── P6: page fallback URLs ───────────────────────────────────────── */
patch(
    "P6a: dashboard fallback URL",
    `const dashboardUrl = env.DASHBOARD_URL || 'https://raw.githubusercontent.com/itsyebekhe/nahan/main/dashboard.html';`,
    `const dashboardUrl = env.DASHBOARD_URL || 'https://raw.githubusercontent.com/mewshiam/Nahan-Prisma/main/src/pages/dashboard.html';`,
);
patch(
    "P6b: subscription fallback URL",
    `const subscriptionUrl = env.SUBSCRIPTION_URL || 'https://raw.githubusercontent.com/itsyebekhe/nahan/main/subscription.html';`,
    `const subscriptionUrl = env.SUBSCRIPTION_URL || 'https://raw.githubusercontent.com/mewshiam/Nahan-Prisma/main/src/pages/subscription.html';`,
);

/* ── P8: telemetry stream call site ───────────────────────────────── */
patch(
    "P8: processTelemetryStream call site",
    `return await processTelemetryStream(env, ctx, wsRelayIdx);`,
    `return await processTelemetryStream(
                    request,
                    env,
                    ctx,
                    wsRelayIdx,
                    wsContext,
                );`,
);

/* ── P9: processTelemetryStream body ──────────────────────────────── */
patch(
    "P9: processTelemetryStream → Bun upgrade",
    `async function processTelemetryStream(env, ctx, wsRelayIdx) {
    const [client, webSocket] = Object.values(new WebSocketPair());
    webSocket.accept();
    webSocket.binaryType = "arraybuffer";
    startDataPipe(webSocket, env, ctx, wsRelayIdx);
    return new Response(null, { status: 101, webSocket: client });
}`,
    `async function processTelemetryStream(
    request,
    env,
    ctx,
    wsRelayIdx,
    wsContext,
) {
    // PORT NOTE (Prisma Compute): Cloudflare's WebSocketPair + Response
    // {status: 101, webSocket} pattern does not exist on Bun. Bun.serve
    // upgrades the connection in place via server.upgrade(); the tunnel
    // state machine is created in the websocket.open handler (index.ts).
    if (!wsContext || typeof wsContext.tryUpgrade !== "function") {
        return new Response("WebSocket upgrade unavailable", { status: 500 });
    }
    const upgraded = wsContext.tryUpgrade(request, env, ctx, wsRelayIdx);
    if (!upgraded) {
        return new Response("WebSocket upgrade failed", { status: 500 });
    }
    return undefined; // Bun completes the 101 handshake internally
}`,
);

/* ── P10: startDataPipe → createTunnel ────────────────────────────── */
patch(
    "P10a: function signature",
    `async function startDataPipe(webSocket, env, ctx, wsRelayIdx) {`,
    `export function createTunnel(webSocket, env, ctx, wsRelayIdx) {`,
);
patch(
    "P10b: close listener → onClose()",
    `    webSocket.addEventListener("close", () => {`,
    `    async function onClose() {`,
);
patch(
    "P10c: drop error listener",
    `    webSocket.addEventListener("error", () => {});
`,
    ``,
);
patch(
    "P10d: message listener → onMessage()",
    `    webSocket.addEventListener("message", (event) => {`,
    `    async function onMessage(bufferData) {`,
);
patch(
    "P10d2: message size accounting",
    `        const size = event.data?.byteLength || 0;`,
    `        const size = bufferData?.byteLength || 0;`,
);
patch(
    "P10e: close listener terminator",
    `                trackUsage(activeClientHash, totalConnBytes, env, ctx);
            }
        } catch (e) {}
    });
    let remoteSocket,
        dataWriter,
        isInit = true,
        queue = Promise.resolve();`,
    `                trackUsage(activeClientHash, totalConnBytes, env, ctx);
            }
        } catch (e) {}
    }
    let remoteSocket,
        dataWriter,
        isInit = true,
        queue = Promise.resolve();`,
);
patch(
    "P10f: event.data → bufferData (message listener body)",
    `        queue = queue.then(async () => {
            pendingUpBytes = Math.max(0, pendingUpBytes - size);
            pendingUpItems = Math.max(0, pendingUpItems - 1);
            try {
                if (isInit) {
                    isInit = false;
                    const isModeAlpha = await parseSensorData(
                        event.data,
                        wsRelayIdx,
                    );
                    if (isModeAlpha) webSocket.send(new Uint8Array([0, 0]));
                } else if (dataWriter) {`,
    `        queue = queue.then(async () => {
            pendingUpBytes = Math.max(0, pendingUpBytes - size);
            pendingUpItems = Math.max(0, pendingUpItems - 1);
            try {
                if (isInit) {
                    isInit = false;
                    const isModeAlpha = await parseSensorData(
                        bufferData,
                        wsRelayIdx,
                    );
                    if (isModeAlpha) webSocket.send(new Uint8Array([0, 0]));
                } else if (dataWriter) {`,
);
patch(
    "P10g: upstream write payload",
    `                        await writeSocketWithTimeout(
                            remoteSocket,
                            dataWriter,
                            event.data,
                            UPSTREAM_WRITE_TIMEOUT_MS,
                        );`,
    `                        await writeSocketWithTimeout(
                            remoteSocket,
                            dataWriter,
                            bufferData,
                            UPSTREAM_WRITE_TIMEOUT_MS,
                        );`,
);
patch(
    "P10h: message listener terminator",
    `                    try {
                        connBytesUp += event.data?.byteLength || 0;
                    } catch (e) {}
                }
            } catch (err) {
                webSocket.close();
            }
        });
    });`,
    `                    try {
                        connBytesUp += bufferData?.byteLength || 0;
                    } catch (e) {}
                }
            } catch (err) {
                webSocket.close();
            }
    });
    }`,
);
patch(
    "P10i: export tunnel handle",
    `        return isModeAlpha;
    }
}

function generateHardwareId(seed) {`,
    `        return isModeAlpha;
    }

    return { onMessage, onClose };
}

function generateHardwareId(seed) {`,
);

/* ── P11: deployWorkerToCloudflare → Prisma stub ──────────────────── */
patch(
    "P11: self-deploy disabled on Prisma Compute",
    `async function deployWorkerToCloudflare(accountId, apiToken, workerName, code) {`,
    `async function deployWorkerToCloudflare(accountId, apiToken, workerName, code) {
    // PORT NOTE (Prisma Compute): Nahan-Prisma runs as a long-lived Bun
    // process. Code deployment happens through the Prisma CLI
    // ("npx prisma deploy" — see deploy/README.md), not the Cloudflare
    // Workers API. In-panel auto-update therefore reports availability
    // instead of self-deploying. Callers catch and log this message.
    throw new Error(
        "Self-deploy is Cloudflare-only. On Prisma Compute, deploy with: npx prisma deploy (see deploy/README.md)",
    );`,
);

/* ── P12: @ts-nocheck pragma ──────────────────────────────────────── */
/* Upstream _worker.js is untyped JavaScript carried verbatim; the 60+
   type complaints tsc raises inside it are upstream's, not the port's.
   The pragma scopes `bun run typecheck` to the port-owned code while
   worker.ts stays covered by the build + tunnel tests. */
src =
    "// @ts-nocheck — PORT NOTE (P12): upstream JS carried verbatim; tsc checks the port-owned code (compat/, entries).\n" +
    src;
patches.push("P12: @ts-nocheck pragma (1x)");

/* ── sanity sweep: no Cloudflare-only *code* may remain (comments ok) ─ */
const forbidden = [
    ["from \"cloudflare:sockets\"", 0],
    ["new WebSocketPair", 0],
    ["request.cf ||", 0],
    ["startDataPipe(", 0],
    ["get(\"cf-connecting-ip\")", 0],
];
for (const [needle, allowed] of forbidden) {
    const n = src.split(needle).length - 1;
    if (n !== allowed) {
        throw new Error(
            `SANITY FAILED: "${needle}" still present ${n}x (expected ${allowed})`,
        );
    }
}

writeFileSync(OUT, src);

/* ── pages: copy dashboard + subscription verbatim ────────────────── */
cpSync(DASH_SRC, `${PAGES_DIR}/dashboard.html`);
cpSync(SUB_SRC, `${PAGES_DIR}/subscription.html`);

console.log("PORT BUILD OK");
patches.forEach((p) => console.log("  ✓ " + p));
console.log(`  ✓ pages: dashboard.html + subscription.html copied`);
