# Migrating from Cloudflare to Prisma Compute

You already run Nahan on Cloudflare Workers and want to move to this port. The gateway's built-in JSON backup/restore carries **everything** — users, UUIDs, volume keys, settings, usage — and the port's SQLite layer uses the same `kv_store` layout, so nothing is re-keyed or translated. Budget fifteen minutes.

## What carries over — and what changes

| Item | Comes across? | Notes |
|---|---|---|
| Users, UUIDs, passwords | ✅ | Restored byte-for-byte from the backup |
| Volume keys / profiles | ✅ | Including bandwidth caps and expiry |
| Settings (API route, master key) | ✅ | Camouflage host, NAT64, relay config — all of it |
| Usage counters & logs | ✅ | Part of the same JSON backup |
| `request.cf` geo in login alerts | ⚠️ | Becomes “Unknown” — Cloudflare-only metadata |
| Cloudflare Analytics widget | ⚠️ | Still renders if you keep the API fields; effectively legacy |
| In-panel self-update | ❌ | Replaced by `npx prisma deploy` / GitHub-push deploys |
| Your `*.workers.dev` URL | ❌ | Clients must repoint to the new `*.prisma.app` URL — see step 6 |

## Step 1 — Export a backup from your current install

In your existing Nahan dashboard: **System → Backup & Restore → Export**. Save the JSON somewhere safe. If your install predates the backup feature, update the worker first (on Cloudflare) and export after.

> The export is a plain JSON document. Treat it as a secret — it contains user tokens and volume keys.

## Step 2 — Deploy the port

Follow [`../deploy/README.md`](../deploy/README.md) — the short version:

```bash
git clone https://github.com/mewshiam/Nahan-Prisma.git
cd Nahan-Prisma
npx prisma auth login
bun install
bun run deploy
```

This gives you a fresh gateway on a `*.prisma.app` URL with TLS.

## Step 3 — Restore the backup

Open `https://<your-deployment>.prisma.app/<apiRoute>/dash` (fresh installs use the default `sync` route), log in — the port is new, so the master key is the default `admin` — then **System → Backup & Restore → Import** and upload the JSON from step 1.

After the restore, your real master key, API route, and user list take effect immediately. **Log in again with your real master key.** If your API route was custom, the dashboard URL changes accordingly — that's expected.

## Step 4 — Verify before you cut over

- Log in with the **old** master key (proves the restore took)
- Users tab: every profile present, UUIDs unchanged
- Fetch a subscription: `https://<new-host>/<apiRoute>?sub=<user>` — compare with the old export if you're thorough
- One client on a test profile: connect and pass traffic
- Camouflage: the root path still shows the proxied site

## Step 5 — Repoint your clients

Every client (and every linked panel) references the old Cloudflare URL. Two options:

1. **Update subscriptions** — clients re-import the sub URL with the new host. QR codes in the dashboard make this quick for phone clients.
2. **Custom domain** — if you own the domain in front of the old worker, attach it to the Prisma deployment (Console → deployment → domains) and set **System → Custom Panel URL**. Clients keep working with zero changes.

Linked panels should be repointed at each new deployment's `/<apiRoute>` with the same panel API keys.

## Step 6 — Decommission the Cloudflare side

Keep the old worker alive until step 4 has been green for a day or two — it's your rollback. Then: export one final backup from it for the archive, delete the worker, and (optionally) remove D1 after confirming the new install holds its own backups.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Restore reports a version mismatch | You exported from a much older upstream. Update the **Cloudflare** worker first, re-export, restore again. |
| Can't log in after restore with the old key | The restore didn't apply — check the dashboard toast, retry the import; confirm you're on `/<apiRoute>/dash`, not the default route. |
| Clients connect but nothing loads | Subscription URL host changed — re-import the sub or attach the custom domain (step 5). |
| WS upgrade fails behind your own proxy | Your proxy must forward `Upgrade`/`Connection` headers — see [`self-hosting.md`](self-hosting.md) for snippets. |
