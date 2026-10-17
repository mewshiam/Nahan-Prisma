# Nahan-Prisma — showcase site (source)

This is the source of the marketing/showcase landing page for the port —
a single-page Next.js 16 + Tailwind CSS 4 site styled after prisma.io
(dark #0e0e0e, confetti accents, Inter, terminal cards).

It is **not part of the gateway deployment** (the gateway is the Bun app
at the repository root). The page was built and verified in a sandboxed
Next.js scaffold; to run it inside your own Next.js project:

1. copy `src/app/page.tsx`, `src/app/layout.tsx`,
   `src/components/np/copy-command.tsx` into the same paths of a
   Next.js 16 + Tailwind 4 + shadcn/ui project,
2. append the `Nahan-Prisma` token block from `src/app/globals.css.snippet`
   to your global stylesheet (tokens: `--np-bg`, `--np-gold`, …),
3. `bun run dev` — the page is the `/` route and needs no data or APIs.

Sections: hero + deploy terminal, before/after port matrix, three-step
deploy, architecture cards (D1→SQLite, sockets→Bun.connect, WS tunnels),
stats band, checkpoint timeline linking to the actual commits, FAQ, CTA.
