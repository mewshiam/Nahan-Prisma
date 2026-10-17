# Deploying Nahan-Prisma to Prisma Compute

> 📚 More guides in the [`docs/`](../docs/README.md) hub: architecture deep-dive, migration from Cloudflare, client setup, self-hosting elsewhere.

This guide replaces upstream Nahan's "Step-by-Step Deployment Guide" for
Cloudflare Workers. Prisma Compute hosts TypeScript apps on Bun, on bare-metal
microVMs — no D1 bindings, no wrangler, no Cloudflare account needed.

---

## Prerequisites

- A free [Prisma Platform account](https://console.prisma.io) (Prisma Compute has a free
  tier; the ORM is free always)
- Bun ≥ 1.1 installed locally
- (Optional) A Telegram bot token, if you want bot management

## 1 — Log in to the Prisma Platform

```bash
npx prisma auth login
```

This opens a browser and stores credentials for the CLI.

## 2 — Install and build

```bash
git clone https://github.com/mewshiam/Nahan-Prisma.git
cd Nahan-Prisma
bun install          # runtime has zero deps; devDeps are the Prisma toolchain
bun run build        # bundles src/compute.ts → dist/compute.js
```

## 3 — Deploy

```bash
npx prisma deploy module.ts
```

That single command provisions the service (defined in `src/service.ts` +
`prisma.config.ts`), starts it on the platform's assigned port, and gives you a live
URL. Re-running it applies only what changed.

Prefer deploying on every git push? Connect this repository in the
[Prisma Console](https://console.prisma.io) and add the deploy workflow — the
`module.ts` / `prisma.config.ts` files in this repo are all the platform needs.

### Region

`prisma.config.ts` defaults to `us-east-1`. Change it to the region closest to your
users:

```ts
extensions: [prismaCloud({ region: "eu-central-1" }), nodeBuild()],
```

## 4 — First-time configuration

Open the deployment URL:

```
https://<your-deployment>.prisma.app/sync/dash
```

| Route | Purpose |
|---|---|
| `/sync/dash` | Dashboard (default route) |
| `/sync` | Subscription endpoint |
| `/` | Camouflage — proxies to the maintenance host |

> **Visiting `/` shows ubuntu.com or docker.com** — that's the camouflage working,
> identical to upstream. Always use `/sync/dash` (or your custom API route + `/dash`).

1. Log in with the default master key: `admin`
2. Go to **System** and:
   - Change **Master Key**
   - Change **API Route** to a secret path (bookmark the new URL!)
   - Set or auto-generate **Device UUID**
3. Click **Update Config**

State persists in a SQLite file inside the deployment (`DATA_DIR`, default `./data`).
The dashboard's built-in **Backup & Restore** (JSON export/import) works unchanged —
take a backup before reprovisioning.

## 5 — Client configuration

Everything downstream of the subscription URL is unchanged from upstream:

- Point your client (v2rayNG, Hiddify, Streisand, sing-box, Clash…) at
  `https://<host>/<apiRoute>` (or `https://<host>/<apiRoute>?sub=<user>`)
- Formats are negotiated by User-Agent / query flags exactly like upstream:
  base64 URI list (default), Clash YAML, Clash JSON, sing-box JSON, V2Ray JSON
- QR codes, per-user links, fake configs, bandwidth limits, expiry — all identical

## 6 — Updating the gateway

On Prisma Compute, code ships through the deploy pipeline (upstream could self-update
via the Cloudflare API — that path is intentionally disabled here):

```bash
git pull                # or merge upstream changes into your fork
npx prisma deploy module.ts
```

The dashboard's update tab will tell you when a newer version is available; applying
it is always a `prisma deploy`.

## 7 — Custom domains & TLS

Prisma Compute provides TLS on the provided `*.prisma.app` host. To use a custom
domain, attach it to the deployment in the Prisma Console, then update
**System → Custom Panel URL** in the dashboard so subscription links use it.

## Differences from the Cloudflare deployment

| Topic | Upstream (Workers) | This port (Prisma Compute) |
|---|---|---|
| Database setup | Create D1 + bind `IOT_DB` | None — SQLite ships inside the deployment |
| Dashboard hosting | Fetched from GitHub raw | Bundled in the deployment image (`src/pages/`) |
| Self-update | In-panel, via CF API | `npx prisma deploy` (CLI or GitHub push) |
| Cron (relay probes) | Cron triggers | Built-in 5-minute sweep timer |
| Daily request cap | 100k/day free tier | Operation-based pricing with spend limits |
| Geo in login alerts | `request.cf` country/city/ASN | "Unknown" (not available on Prisma) |

## Troubleshooting

**`WebSocket upgrade failed` in clients** — ensure the client connects over
`wss://` (TLS) to the prisma.app host, with `path=/sync` (or your custom API route).

**Forgot the master key or API route** — state lives in the SQLite file
(`data/nahan.sqlite`, key `sys_config`). Take a JSON backup regularly from the
dashboard so you can always restore.

**Want a fresh start** — set `DATA_DIR` to a new path (or delete the deployment's
`data/` directory) and restart; defaults return to `admin` / `sync`.

**Linked panels / other nodes** — work unchanged: point them at each deployment's
`/<apiRoute>` with the panel API keys.
