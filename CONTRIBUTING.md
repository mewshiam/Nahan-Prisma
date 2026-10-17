# Contributing to Nahan-Prisma

Thanks for wanting to help. This repo has a specific shape — a **platform port** of an upstream project — and the contribution rules flow from that.

## The one rule

> `src/worker.ts` is upstream Nahan, carried verbatim. Gateway logic changes belong **upstream** ([itsyebekhe/nahan](https://github.com/itsyebekhe/nahan)), not here.

What belongs **here**:

- The compat layer (`src/compat/*`) — adapters, their tests, their fidelity to the Cloudflare APIs
- The entry chain (`src/index.ts`, `src/compute.ts`, `src/server.ts`, `src/service.ts`, `module.ts`, `prisma.config.ts`)
- Deployment, docs, CI, tooling

If your idea is a *feature for the gateway* (new protocol knob, dashboard behavior, subscription format), open it upstream first. When upstream ships it, the port inherits it through the patch pipeline — that's the whole point of the design.

## Development setup

```bash
git clone https://github.com/mewshiam/Nahan-Prisma.git
cd Nahan-Prisma
bun install
bun run dev          # hot-reloading dev server on :3000
bun run typecheck    # tsc --noEmit
bun run build        # bundles src/compute.ts → dist/
```

### Running the tests

```bash
bun tests/test-connect-adapter.ts          # standalone

PORT=8977 bun run src/index.ts &          # tunnel tests dial into this
bun tests/test-vless-tunnel.ts
bun tests/test-trojan-tunnel.ts
```

All of this runs on every push via CI (`.github/workflows/ci.yml`) — if it's red locally, it'll be red on GitHub.

## The patch pipeline (port changes)

Patches to `src/worker.ts` are **never hand-edited**. They live in `tests/build-port.js` as numbered, tagged operations (P1…P12) so the file can be regenerated from any upstream version:

```bash
git clone https://github.com/itsyebekhe/nahan reference/nahan
bun tests/build-port.js        # regenerates src/worker.ts; fails loudly on drift
```

To change how the port patches upstream:

1. Edit `tests/build-port.js` — add/modify the patch, keep the `PORT NOTE` tagging convention
2. Re-run it against the pinned upstream tag (v3.0.4)
3. Run the full test suite
4. Open a PR with: the patch-script diff (small, reviewable) and the regenerated `worker.ts` diff (big, mechanical)

Dashboard adaptations follow the same pattern via `tests/patch-dashboard.js`.

## Commit style

This repo was built in numbered checkpoints and that convention continues — short imperative subjects, e.g.:

```
checkpoint 12: CI — boot gateway for tunnel tests
docs: expand self-hosting with nginx WS snippet
```

## Pull requests

- Keep PRs atomic — one concern each
- `bun run typecheck` and the full test suite must pass (CI enforces it)
- New platform seams need a test in `tests/` and a row in the docs
- Docs changes are PRs too — typos included

## Reporting issues

Use the issue templates: **bug reports** want your Bun version, deploy target (Prisma Compute / self-hosted), and logs; **feature requests** should check whether they're upstream concerns first (see the one rule above).
