# Nahan-Prisma test suite

Bun-native tests. Start the gateway first, then run each test:

```bash
# terminal 1 — gateway on :8977
PORT=8977 bun run src/index.ts

# terminal 2 — tests
bun tests/test-connect-adapter.ts   # unit: CF-compatible connect() adapter
bun tests/test-vless-tunnel.ts      # e2e: VLESS tunnel round-trip
bun tests/test-trojan-tunnel.ts     # e2e: Trojan tunnel round-trip
```

`build-port.js` is the mechanical port script that regenerates
`src/worker.ts` from the upstream `_worker.js` (see README "Porting
methodology"). Keep it in sync with any upstream merge.
