## What this PR changes

<!-- One or two sentences. -->

## Where it lands

- [ ] `src/compat/*` — compatibility layer
- [ ] Entry chain (`index.ts` / `compute.ts` / `server.ts` / `service.ts` / `module.ts`)
- [ ] `tests/build-port.js` / `tests/patch-dashboard.js` — patch pipeline
- [ ] Docs / README
- [ ] CI / tooling
- [ ] Other:

## Checklist

- [ ] Gateway logic (`src/worker.ts`) is **not hand-edited** — any change there was regenerated via `bun tests/build-port.js`, and the patch-script diff is included in this PR
- [ ] `bun run typecheck` passes
- [ ] `bun tests/test-connect-adapter.ts` passes
- [ ] Tunnel tests pass against a local gateway (`PORT=8977 bun run src/index.ts &` then the VLESS/Trojan tests)
- [ ] Docs updated if the change affects operators
