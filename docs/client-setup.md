# Client setup

Point any VLESS/Trojan-over-WebSocket client at your Nahan-Prisma deployment. Everything downstream of the subscription URL behaves exactly like upstream Nahan — the port doesn't touch it.

## Get your subscription link

In the dashboard (**`/<apiRoute>/dash`**), each user profile exposes:

- **Subscription URL** — `https://<host>/<apiRoute>` (single user) or `https://<host>/<apiRoute>?sub=<user>` (multi-user installs)
- **QR code** — scan straight into a mobile client
- **Direct links** — per-protocol connection URIs if you prefer manual entry

The endpoint negotiates format automatically: base64 URI list by default, Clash YAML/JSON, sing-box JSON, or V2Ray JSON depending on the client's User-Agent. Clients that identify themselves get their native format with no extra flags.

## Per-client quick start

### v2rayNG (Android)

1. **Subscription → ⋮ → Subscription settings → +**
2. Paste your subscription URL, save
3. **⋮ → Update subscriptions**, then tap the imported profile
4. Connect. Test with the built-in latency check before assuming it works.

### Hiddify (Android / iOS / desktop)

1. **+ → Add from clipboard** (after copying the sub URL), or scan the dashboard QR
2. Hiddify auto-selects the right config from the subscription
3. Connect and pick the lowest-latency entry

### Streisand (iOS)

1. **+ → Add subscription**, paste the URL
2. Update, choose the profile, connect

### sing-box (all platforms)

1. Add the subscription as a remote profile (**Profiles → New → URL**), or
2. Copy the raw **sing-box JSON** from the dashboard into a local profile
3. Enable and route through it

### Clash / Mihomo (desktop / Android)

1. **Profiles → import from URL**, paste the subscription link — the Clash YAML flavor is served to Clash UAs
2. Select the profile, enable system proxy / TUN as you prefer

### V2RayN (Windows)

1. **Subscriptions → Subscription settings → add**, paste the URL
2. **Update subscriptions without proxy**
3. Pick the server entry and set the system proxy mode

## Multi-user installs

If you created per-user profiles (recommended for family/friends setups), each user gets their own link with `?sub=<name>`. Usage accounting, bandwidth caps and expiry are enforced per profile — one user hitting their cap doesn't affect the others.

## If something doesn't connect

| Check | Why |
|---|---|
| Client uses `wss://`, not `ws://` | The `*.prisma.app` host is TLS-only |
| Path is `/<apiRoute>` (default `sync`) | A typo'd path silently falls into camouflage or 404 |
| UUID matches the user profile | Copied an old link after the admin rotated UUIDs |
| Profile hasn't expired / hit its cap | The dashboard shows both on the user card |
| Date & time correct on the device | Bad clocks break TLS and some client checks |
| Try another clean-IP entry from the sub | A specific relay may be quarantined mid-probe |
