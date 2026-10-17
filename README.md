# Nahan-Prisma (نهان)

**The Nahan gateway, ported from Cloudflare Workers to [Prisma Compute](https://www.prisma.io/compute).**

Nahan (Persian for *hidden/concealed*) is a secure, lightweight, highly customizable reverse
proxy gateway with VLESS / Trojan protocols and a self-contained web dashboard. Upstream
runs entirely on Cloudflare Workers. This port replaces Cloudflare with **Prisma Compute** —
Prisma's Bun-on-bare-metal TypeScript app hosting — as the runtime platform. No VPS, no
server maintenance: deploy with one command, `npx prisma deploy module.ts`.

> Upstream project: [itsyebekhe/nahan](https://github.com/itsyebekhe/nahan) v3.0.4 (MIT) —
> all credit for the gateway itself belongs to the Nahan open source community.
> This repository contains the platform port: Bun runtime adapters, Prisma Compute
> deployment, and platform-aware docs. See **Port methodology** below.

---

## Why this port exists

| | Cloudflare Workers (upstream) | Prisma Compute (this port) |
|---|---|---|
| Runtime | V8 isolates, per-request lifecycle | Long-lived Bun process on bare-metal microVMs |
| Entry point | `export default { fetch }` | `Bun.serve()` HTTP + WebSocket server |
| TCP dialing | `cloudflare:sockets` `connect()` | `Bun.connect()` via a byte-compatible adapter |
| WebSocket tunnels | `WebSocketPair` + `Response(101)` | `server.upgrade()` + tunnel state machine |
| Persistent state | D1 SQLite binding (`env.IOT_DB`) | Local SQLite file via `bun:sqlite` (D1-compatible API) |
| Scheduled jobs | Cron triggers → `scheduled()` | `setInterval` → same `handleScheduled()` |
| Code deploys | In-panel self-update via CF API | `npx prisma deploy module.ts` (CLI / GitHub push) |
| Camouflage | Proxy to ubuntu.com / docker.com | Identical (outbound `fetch` works the same) |

Everything else — VLESS/Trojan protocol parsing, the dashboard, subscription generation
(URI / Clash / sing-box / V2Ray formats), multi-user profiles, per-user bandwidth limits,
NAT64, clean-IP multiplexing, relay health/quarantine, Telegram bot, linked panels,
kill switch, activity logs, backup/restore — ships **verbatim** from upstream v3.0.4.

## Quick start (local, any Bun host)

```bash
git clone https://github.com/mewshiam/Nahan-Prisma.git
cd Nahan-Prisma
bun install
bun run start          # listens on :3000 (or $PORT)
```

Then open:

| URL | What |
|---|---|
| `http://localhost:3000/sync/dash` | Dashboard (default route — **change it after first login**) |
| `http://localhost:3000/sync` | Subscription endpoint (`?sub=<user>` for multi-user) |
| `http://localhost:3000/` | Camouflage — proxies to the maintenance host |

First login uses the default master key `admin`. **Immediately** go to the **System** tab,
change the master key, and set a secret API route.

## Deploy to Prisma Compute

Full walkthrough in [`deploy/README.md`](deploy/README.md). Short version:

```bash
npx prisma auth login                 # once — opens a browser
bun install
bun run deploy                        # build + provision via module.ts
# or, explicitly:
bun run build && npx prisma deploy module.ts
```

State (config, users, usage, logs) persists in a SQLite file inside the deployment
(`DATA_DIR`, default `./data`). Export a `.json` backup from the dashboard before
reprovisioning if you want to be extra safe — the built-in backup/restore works unchanged.

## Repository layout

```
├── module.ts               # Prisma Compute deploy module (root entry)
├── prisma.config.ts        # Prisma CLI config: composer + prismaCloud + nodeBuild
├── src/
│   ├── index.ts            # standalone entry (bun run start)
│   ├── compute.ts          # Prisma Compute entry (service.port())
│   ├── service.ts          # Prisma Compute service definition
│   ├── server.ts           # Bun.serve wiring: HTTP fetch + WS tunnel handlers
│   ├── worker.ts           # THE PORT — upstream _worker.js v3.0.4, 22 tagged patches
│   ├── compat/
│   │   ├── d1.ts           # D1 → bun:sqlite adapter (identical prepare/bind/all/run API)
│   │   ├── sockets.ts      # cloudflare:sockets → Bun.connect (opened/readable/writable/close)
│   │   └── runtime.ts      # env/ctx shims, page asset resolution, client IP mapping
│   └── pages/
│       ├── dashboard.html  # upstream dashboard + 5 Prisma adaptations
│       └── subscription.html
├── tests/
│   ├── build-port.js       # regenerates src/worker.ts from upstream _worker.js
│   ├── patch-dashboard.js  # re-applies the dashboard adaptations
│   ├── test-connect-adapter.ts
│   ├── test-vless-tunnel.ts
│   └── test-trojan-tunnel.ts
└── deploy/README.md        # step-by-step Prisma Compute deployment guide
```

## Port methodology

`src/worker.ts` is a **verbatim mechanical port** of the upstream `_worker.js` — 11,114
lines of battle-tested gateway logic, intentionally kept as a single file so diffs against
upstream stay reviewable and future upstream merges stay mechanical.

`tests/build-port.js` regenerates it from a checkout of upstream:

```bash
git clone https://github.com/itsyebekhe/nahan reference/nahan
bun tests/build-port.js     # applies 22 assertive patches, fails loudly on drift
```

Every patch is tagged with a `PORT NOTE` comment in the source and is one of:

1. **P1** — `cloudflare:sockets` import → `src/compat/sockets.ts` (Bun.connect)
2. **P2** — `fetchT` learned `file://` so bundled pages load from the deployment image
3. **P3** — `export default {fetch, scheduled}` → exported `handleFetch` / `handleScheduled`
4. **P4** — `cf-connecting-ip` header reads → `clientIpOf()` (x-forwarded-for / socket addr)
5. **P5** — `request.cf` geo metadata → dropped (Cloudflare-only)
6. **P6** — dashboard/subscription fallback URLs → this repository
7. **P8/P9** — `WebSocketPair` + `Response(101)` → `server.upgrade()`
8. **P10** — `startDataPipe` → `createTunnel()` with `onMessage`/`onClose` (Bun WS events)
9. **P11** — `deployWorkerToCloudflare` throws a descriptive error: on Prisma Compute
   you ship code with `npx prisma deploy`, not the Workers API

The byte-level WS semantics are preserved exactly: Cloudflare delivered tunnel frames as
`ArrayBuffer` (`binaryType="arraybuffer"`), so the Bun entry point normalizes each frame
to a real `ArrayBuffer` before it reaches the protocol parser.

### Verified by tests (Bun 1.3.14)

- `test-connect-adapter.ts` — TCP adapter unit test (echo round-trip)
- `test-vless-tunnel.ts` — full VLESS path: WS upgrade → header parse → UUID lookup →
  TCP connect → bidirectional piping → multi-frame streaming
- `test-trojan-tunnel.ts` — Trojan branch: sha224 handshake → CRLF framing → echo
- Manual: master-key rotation + multi-user profiles persisted in SQLite across restarts;
  camouflage proxy; subscription formats (base64 URI list, browser info page)

## Platform differences to know

- **In-panel self-update is disabled.** Code deploys go through the Prisma CLI
  (`npx prisma deploy`) or a connected GitHub repo. The dashboard's update tab will
  report availability; applying it is a deploy, not a click.
- **`request.cf` geo fields** (country/city/ASN in login alerts) are Cloudflare-only and
  render as "Unknown" on Prisma Compute.
- **Cloudflare Analytics usage widget** still works if you fill the (legacy) Cloudflare
  API fields — otherwise ignore that section.
- **D1 → SQLite**: same schema (`kv_store` key/value), zero migration needed for new
  installs. Nahan's built-in JSON backup/restore moves state between installs.
- **No daily request cap** like the Workers free plan's 100k/day — Prisma Compute pricing
  is operation-based with spend limits.

## License

MIT — same as upstream Nahan. See [LICENSE](LICENSE).

## Credits

- [itsyebekhe/nahan](https://github.com/itsyebekhe/nahan) — the gateway itself
- [ImLTHQ/edgetunnel](https://github.com/ImLTHQ/edgetunnel) — the lineage Nahan forked from
- [Prisma](https://www.prisma.io/) — the Compute platform this port targets
