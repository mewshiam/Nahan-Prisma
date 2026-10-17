# Changelog

## 1.0.0 — Prisma Compute port (upstream base: Nahan v3.0.4)

Port of the Nahan gateway from Cloudflare Workers to Prisma Compute (Bun).

### Added
- `src/compat/d1.ts` — D1-compatible adapter over `bun:sqlite`
- `src/compat/sockets.ts` — `cloudflare:sockets connect()` adapter over `Bun.connect`
- `src/compat/runtime.ts` — env/ctx shims, page asset resolution, client IP mapping
- `src/index.ts` / `src/compute.ts` — standalone and Prisma Compute entries
- `src/service.ts`, `module.ts`, `prisma.config.ts` — Prisma Compute deployment
- `tests/` — port regeneration scripts + tunnel test suite (VLESS, Trojan, adapter)

### Changed (vs upstream, all tagged PORT NOTE in source)
- WebSocket tunnels driven by Bun `server.upgrade()` instead of `WebSocketPair`
- Tunnel frames normalized to `ArrayBuffer` (Cloudflare binaryType parity)
- Dashboard/subscription pages served from the deployment image (`file://`)
- `cf-connecting-ip` resolved from `x-forwarded-for` / socket address
- Dashboard: title, EN/FA help text, Cloudflare section marked legacy

### Disabled
- In-panel self-update via Cloudflare API → deploy with `npx prisma deploy`

### Verified
- VLESS + Trojan end-to-end tunnels (WS → parse → TCP → bidirectional piping)
- SQLite persistence across restarts (master key rotation, multi-user)
- Subscription formats, camouflage proxy, scheduled sweep timer
