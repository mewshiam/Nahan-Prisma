# Security policy

## Reporting a vulnerability

**Do not open a public issue for security problems.**

Use [GitHub's private vulnerability reporting](https://github.com/mewshiam/Nahan-Prisma/security/advisories/new) on this repository. If you can't use that, open a regular issue asking for a contact — one of the maintainers will respond with a channel.

Please include reproduction steps, affected versions, and impact. Reports are acknowledged within 72 hours where possible.

### Scope

- ✅ **In scope:** this repository — the compat layer, the Bun entry chain, deployment config, the dashboard adaptations
- ➖ **Upstream gateway bugs** (protocol parsing, auth logic, the dashboard proper) are reported to [itsyebekhe/nahan](https://github.com/itsyebekhe/nahan) — we can help triage and will fast-track the port once upstream fixes ship
- ➖ **Bun runtime / Prisma Compute** vulnerabilities go to their respective security channels

## Hardening checklist for operators

If you run this gateway, the first hour matters:

- [ ] Change the master key from `admin` immediately after first login
- [ ] Set a secret API route (the default `sync` path is known to scanners)
- [ ] Generate a fresh Device UUID — don't run on the seeded default
- [ ] Serve only over TLS: the Prisma Compute host provides it; self-hosters should put a reverse proxy in front (see [`docs/self-hosting.md`](docs/self-hosting.md))
- [ ] Create per-user profiles instead of sharing your main UUID
- [ ] Take dashboard JSON backups regularly — they contain secrets, store them accordingly
- [ ] Keep the deployment current: `npx prisma deploy` after watching upstream releases

## Disclosure timing

Fixed vulnerabilities are disclosed in the [CHANGELOG](CHANGELOG.md) once a patch release is out. Reporters are credited unless they prefer otherwise.
