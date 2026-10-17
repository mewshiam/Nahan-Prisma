# 📚 Nahan-Prisma documentation

Everything around the port: how it works inside, how to deploy it, how to move to it, and how to point clients at it. The gateway's own behavior is documented upstream — this hub covers the **platform layer** added by the port.

| Guide | Read it when you want to… |
|---|---|
| [`../deploy/README.md`](../deploy/README.md) | …ship the gateway to Prisma Compute, step by step |
| [`architecture.md`](architecture.md) | …understand the request lifecycle, tunnel internals and the compat layer |
| [`migration-from-cloudflare.md`](migration-from-cloudflare.md) | …move an existing upstream (Cloudflare) install to this port |
| [`client-setup.md`](client-setup.md) | …connect v2rayNG, Hiddify, sing-box, Streisand, Clash, V2RayN |
| [`self-hosting.md`](self-hosting.md) | …run the port on any other Bun host — VPS, Docker, systemd |

Also in the repo:

- [`../README.md`](../README.md) — overview, quick start, port methodology
- [`../CHANGELOG.md`](../CHANGELOG.md) — release history
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — dev setup, the patch workflow, PR guide
- [`../SECURITY.md`](../SECURITY.md) — reporting vulnerabilities, hardening checklist

## One mental model

```
your client ──wss/https──▶ Bun.serve ──▶ worker.ts (upstream Nahan v3.0.4)
                                            │
                              ┌─────────────┴─────────────┐
                              ▼                           ▼
                       compat/sockets.ts            compat/d1.ts
                       (Bun.connect TCP)        (SQLite via D1 API)
```

The worker is upstream, byte for byte except 22 tagged patches. The adapters re-create the Cloudflare primitives it expects. That's the whole port.
