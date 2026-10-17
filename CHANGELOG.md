# Changelog

## 1.1.0 — repo & documentation overhaul

### Added
- Brand system: segmented-N logo, hero banner, social preview (`docs/assets/`)
- Styled README: hero, badges, highlights grid, mermaid architecture, FAQ, Persian tagline
- Documentation hub (`docs/`) with four new guides:
  - `architecture.md` — request lifecycle, tunnel sequence diagrams, compat-layer API tables
  - `migration-from-cloudflare.md` — move an existing upstream install over, step by step
  - `client-setup.md` — v2rayNG, Hiddify, sing-box, Streisand, Clash, V2RayN quick starts
  - `self-hosting.md` — VPS, systemd, Docker, Caddy/nginx TLS, backups, hardening checklist
- Community files: `CONTRIBUTING.md` (incl. the patch-pipeline rules), `SECURITY.md`, `CODE_OF_CONDUCT.md`
- GitHub templates: bug report, platform improvement, PR checklist, contact links
- CI (`.github/workflows/ci.yml`): typecheck + build + adapter test + live-gateway VLESS/Trojan tunnel tests on every push
- Dependabot: weekly Actions updates, monthly npm (dev toolchain only)

### Changed
- Version bumped to 1.1.0; `deploy/README.md` cross-linked to the docs hub

### Fixed
- `bun run typecheck` now passes: `@types/bun` added to devDependencies, three type errors fixed in the port-owned code (`compat/d1.ts` ×2, `server.ts` ×1), and new patch **P12** prepends `// @ts-nocheck` to the generated `worker.ts` (upstream JS is validated by the build + tunnel tests, not by tsc) — patch count is now 23
- Verified locally on Bun 1.3.14: typecheck, build, adapter test, and live-gateway VLESS + Trojan tunnel tests all green

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
