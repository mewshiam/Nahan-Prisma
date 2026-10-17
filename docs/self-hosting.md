# Self-hosting on any Bun host

Prisma Compute is the flagship target, but the port is just a Bun app — it runs on any machine with Bun ≥ 1.1: a VPS, a home server, Docker, even a laptop for testing. This guide covers the non-Prisma paths.

## Configuration

All environment variables are optional — the server runs with zero configuration:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Listen port (Prisma Compute injects this automatically) |
| `DATA_DIR` | `./data` | Directory for the SQLite state file |
| `DASHBOARD_URL` | bundled | Serve the dashboard from a custom URL instead of `src/pages/` |
| `SUBSCRIPTION_URL` | bundled | Same, for the subscription info page |
| `LOG_LEVEL` | — | Enable request logging to stdout |

## Bare metal / VPS

```bash
# install Bun (as root or via your user manager)
curl -fsSL https://bun.sh/install | bash

git clone https://github.com/mewshiam/Nahan-Prisma.git
cd Nahan-Prisma
bun install
PORT=3000 DATA_DIR=/var/lib/nahan bun run src/index.ts
```

### systemd unit

```ini
# /etc/systemd/system/nahan.service
[Unit]
Description=Nahan-Prisma gateway
After=network-online.target
Wants=network-online.target

[Service]
User=nahan
Group=nahan
WorkingDirectory=/opt/nahan-prisma
Environment=PORT=3000
Environment=DATA_DIR=/var/lib/nahan
ExecStart=/home/nahan/.bun/bin/bun run src/index.ts
Restart=on-failure
RestartSec=5

# hardening — the gateway needs no special privileges
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/lib/nahan
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now nahan
```

## Docker

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ENV PORT=3000 DATA_DIR=/data
VOLUME /data
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

```bash
docker build -t nahan-prisma .
docker run -d --name nahan -p 3000:3000 -v nahan-data:/data nahan-prisma
```

The named volume keeps the SQLite state across container rebuilds. Still take JSON backups from the dashboard — the volume protects against container loss, not against your own mistakes.

## TLS & reverse proxy

Never expose the raw port to the internet — the subscription endpoint and dashboard should sit behind TLS. Both proxies below terminate TLS and forward WebSockets correctly:

### Caddy (automatic certificates)

```caddyfile
nahan.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

Caddy upgrades WebSocket connections by default — nothing else needed.

### nginx

```nginx
server {
    listen 443 ssl http2;
    server_name nahan.example.com;
    ssl_certificate     /etc/letsencrypt/live/nahan.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nahan.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;      # WebSocket tunnels
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300s;                     # long-lived tunnels
        proxy_send_timeout 300s;
    }
}
```

The port's `clientIpOf()` shim reads `x-forwarded-for`, so per-user IP logging works correctly behind either proxy.

## Data safety

The only stateful artifact is `$DATA_DIR/nahan.sqlite`. Protect it like a database, because it is one:

```bash
# /etc/cron.daily/nahan-backup
#!/bin/sh
install -d -m 700 /var/backups/nahan
sqlite3 /var/lib/nahan/nahan.sqlite ".backup /var/backups/nahan/nahan-$(date +%F).sqlite"
find /var/backups/nahan -mtime +14 -delete
```

Plus a periodic **JSON export from the dashboard** — that's the portable format that restores onto any other install (including a future move back to Prisma Compute or elsewhere).

## Hardening checklist

- [ ] Master key rotated away from `admin`
- [ ] API route changed from the default `sync`
- [ ] Device UUID generated (don't ship the seeded default)
- [ ] Service listens on `127.0.0.1` behind the TLS proxy, not `0.0.0.0` bare
- [ ] Dashboard not indexed: leave the camouflage host in place
- [ ] Firewall: only 80/443 open; nothing answers on the raw port from outside
- [ ] Backups scheduled (SQLite dump **and** dashboard JSON export)
