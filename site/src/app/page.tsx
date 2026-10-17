import Link from "next/link";
import { Github, ArrowRight, Terminal, ShieldCheck, Zap, Database } from "lucide-react";
import { CopyCommand } from "@/components/np/copy-command";

/* ──────────────────────────────────────────────────────────────────────
   Nahan-Prisma — Prisma.io-styled landing page for the port of the
   Nahan gateway (itsyebekhe/nahan v3.0.4) from Cloudflare Workers to
   Prisma Compute (Bun runtime).
   Design tokens extracted from prisma.io: #0e0e0e bg, white type,
   confetti accents (#f3c306 gold · #01d7e4 cyan · #f00e5c pink ·
   #f43531 red · #f37a03 orange), Inter.
   ────────────────────────────────────────────────────────────────────── */

const REPO_URL = "https://github.com/mewshiam/Nahan-Prisma";
const UPSTREAM_URL = "https://github.com/itsyebekhe/nahan";

/* Prisma-style segmented mark (the confetti "P" → adapted "N") */
function SegmentedMark() {
  return (
    <div className="relative h-6 w-6" aria-hidden>
      <div className="np-seg-1 absolute left-0 top-0 h-3.5 w-1.5 rounded-tl-[3px] rounded-bl-[3px]" />
      <div className="np-seg-2 absolute left-0 top-3.5 h-2.5 w-1.5 rounded-bl-[3px]" />
      <div className="np-seg-3 absolute left-1.5 top-0 h-1.5 w-3.5 rounded-tr-[3px] rounded-tl-[3px]" />
      <div className="np-seg-4 absolute left-1.5 top-1.5 h-1.5 w-2" />
      <div className="np-seg-5 absolute left-1.5 top-3 h-3 w-3.5 rounded-br-[3px] rounded-tr-[3px]" />
    </div>
  );
}

const NAV = [
  { href: "#port", label: "The port" },
  { href: "#steps", label: "Deploy" },
  { href: "#architecture", label: "Architecture" },
  { href: "#checkpoints", label: "Checkpoints" },
  { href: "#faq", label: "FAQ" },
];

/* ── announcement bar ─────────────────────────────────────────────── */
function AnnouncementBar() {
  return (
    <div className="border-b border-white/5 bg-[var(--np-surface)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--np-gold)] np-pulse" />
          <span className="font-semibold text-white">v1.0.0 shipped</span>
          Nahan v3.0.4 → Prisma Compute · 4 checkpoints pushed
        </span>
        <a
          href="#checkpoints"
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--np-gold)] hover:underline"
        >
          See the port log
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

/* ── nav ──────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[rgba(14,14,14,0.82)] backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="#" className="flex items-center gap-2.5">
          <SegmentedMark />
          <span className="text-[15px] font-semibold tracking-tight">
            Nahan-Prisma
          </span>
          <span className="hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 sm:inline">
            gateway
          </span>
        </a>
        <div className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-[13px] text-neutral-400 transition-colors hover:text-white"
            >
              {n.label}
            </a>
          ))}
        </div>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 text-[13px] font-semibold text-black transition-transform hover:-translate-y-px"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </nav>
    </header>
  );
}

/* ── hero ─────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="np-grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-[-260px] h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(1,215,228,0.35), rgba(243,195,6,0.18), transparent)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="np-rise mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-neutral-300">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--np-cyan)]" />
            VLESS + Trojan gateway · Bun runtime · zero servers
          </p>
          <h1 className="np-rise np-rise-1 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Your concealed gateway,
            <br />
            <span className="bg-gradient-to-r from-[var(--np-cyan)] via-[var(--np-gold)] to-[var(--np-pink)] bg-clip-text text-transparent">
              from Cloudflare to Prisma
            </span>
          </h1>
          <p className="np-rise np-rise-2 mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-neutral-400 sm:text-lg">
            Nahan-Prisma ports the Nahan gateway — 11,114 lines of
            battle-tested VLESS/Trojan tunnel logic — off Cloudflare
            Workers and onto{" "}
            <span className="text-white">Prisma Compute&apos;s</span> Bun
            runtime. Same dashboard, same protocols, same camouflage. One
            deploy command replaces the Workers pipeline.
          </p>
          <div className="np-rise np-rise-3 mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#steps"
              className="np-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              Deploy to Prisma Compute
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="np-btn-ghost inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              <Github className="h-4 w-4" />
              View the port
            </a>
          </div>
        </div>

        <HeroTerminal />

        <div className="np-rise np-rise-4 mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-neutral-500">
          <span>
            Upstream{" "}
            <a
              href={UPSTREAM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-300 underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              itsyebekhe/nahan
            </a>{" "}
            v3.0.4
          </span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span>3.2k stars · MIT</span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span>VLESS · Trojan · Clash · sing-box</span>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <span>SQLite state (no D1)</span>
        </div>
      </div>
    </section>
  );
}

/* ── hero terminal ────────────────────────────────────────────────── */
function HeroTerminal() {
  const lines: Array<[string, string]> = [
    ["cmd", "$ git clone https://github.com/mewshiam/Nahan-Prisma && cd Nahan-Prisma"],
    ["cmd", "$ bun install && npx prisma auth login"],
    ["cmd", "$ npx prisma deploy module.ts"],
    ["out", "  ✓ bundled 137 modules → dist/compute.js"],
    ["out", "  ✓ provisioning nahan-gateway (us-east-1)"],
    ["out", "  ✓ deployment live: https://nahan-prisma.prisma.app"],
    ["out", ""],
    ["ok", "  ███ Nahan-Prisma gateway listening on 0.0.0.0:3000"],
    ["ok", "  State (SQLite): data/nahan.sqlite"],
    ["ok", "  Dashboard:      /sync/dash   (change the route after login!)"],
    ["ok", "  Camouflage:     /            (proxies to the maintenance host)"],
    ["caret", ""],
  ];
  return (
    <div className="np-rise np-rise-3 mx-auto mt-12 max-w-3xl">
      <div className="np-card np-glow-gold overflow-hidden !rounded-xl">
        <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--np-red)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--np-gold)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--np-cyan)]" />
          <span className="ml-2 inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Terminal className="h-3 w-3" /> deploy — nahan-prisma
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-neutral-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 np-pulse" />
            Bun 1.3
          </span>
        </div>
        <div className="np-term overflow-x-auto p-4 text-[12.5px] leading-relaxed">
          {lines.map(([kind, text], i) => (
            <div key={i} className="whitespace-pre">
              {kind === "cmd" && (
                <span className="np-mono text-neutral-200">
                  <span className="text-[var(--np-cyan)]">❯</span> {text.slice(2)}
                </span>
              )}
              {kind === "out" && text && (
                <span className="np-mono text-neutral-500">{text}</span>
              )}
              {kind === "ok" && (
                <span className="np-mono text-neutral-300">{text}</span>
              )}
              {kind === "caret" && (
                <span className="np-mono text-neutral-300">
                  <span className="np-caret">▍</span>
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-4 py-2">
          <span className="text-[11px] text-neutral-600">
            one command · replaces the Cloudflare wrangler pipeline
          </span>
          <CopyCommand command="npx prisma deploy module.ts" />
        </div>
      </div>
    </div>
  );
}

/* ── section heading helper ───────────────────────────────────────── */
function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--np-gold)]">
        {kicker}
      </p>
      <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-pretty leading-relaxed text-neutral-400">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── the port: before / after ─────────────────────────────────────── */
const BEFORE_ITEMS = [
  "V8 isolate per request — Cloudflare Workers",
  "D1 SQLite binding (env.IOT_DB) for state",
  "cloudflare:sockets connect() for TCP dials",
  "WebSocketPair + Response(101) tunnels",
  "Cron triggers drive the scheduled sweep",
  "In-panel self-update via the Workers API",
  "Dashboard fetched from GitHub raw on boot",
  "100k requests/day free-tier cap",
];

const AFTER_ITEMS = [
  "One long-lived Bun process on bare-metal microVMs",
  "Local SQLite via bun:sqlite — identical prepare/bind/all/run API",
  "Bun.connect() behind a byte-compatible socket adapter",
  "server.upgrade() + the same tunnel state machine",
  "Built-in 5-minute sweep timer — same handleScheduled()",
  "Deploys with npx prisma deploy (CLI or git push)",
  "Pages bundled in the deployment image (file://)",
  "Operation-based pricing with spend limits",
];

function PortSection() {
  return (
    <section id="port" className="border-t border-white/5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          kicker="The port"
          title="What changes when your gateway moves to Prisma Compute"
          sub="Upstream Nahan is married to the Workers runtime through four APIs. This port replaces each one with a byte-compatible Bun adapter — the 11,114-line gateway core ships verbatim."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <div className="np-card p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(244,53,49,0.12)] text-[var(--np-red)]">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">Before — Cloudflare Workers</h3>
                <p className="text-xs text-neutral-500">upstream nahan v3.0.4</p>
              </div>
            </div>
            <ul className="space-y-3">
              {BEFORE_ITEMS.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-neutral-400">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--np-red)]/70" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="np-card border-[var(--np-border-strong)] p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(1,215,228,0.12)] text-[var(--np-cyan)]">
                <Database className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">After — Prisma Compute (Bun)</h3>
                <p className="text-xs text-neutral-500">mewshiam/Nahan-Prisma v1.0.0</p>
              </div>
            </div>
            <ul className="space-y-3">
              {AFTER_ITEMS.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-neutral-300">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--np-cyan)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-neutral-600">
          Everything else — dashboard, subscription formats, multi-user, limits, NAT64, clean-IP
          multiplexing, relay quarantine, Telegram bot, linked panels, kill switch — ships unchanged from upstream.
        </p>
      </div>
    </section>
  );
}

/* ── three steps ──────────────────────────────────────────────────── */
const STEPS = [
  {
    n: "1",
    color: "var(--np-cyan)",
    title: "Clone & install",
    body: "Zero runtime dependencies — Bun ships the HTTP server, WebSockets, TCP sockets, and SQLite natively. The dev toolchain is just the Prisma CLI.",
    code: [
      ["cmd", "git clone https://github.com/mewshiam/Nahan-Prisma"],
      ["cmd", "cd Nahan-Prisma && bun install"],
    ],
  },
  {
    n: "2",
    color: "var(--np-gold)",
    title: "Deploy",
    body: "Log in once, then provision the service defined in module.ts. Re-running the command applies only what changed. Or connect the repo for deploys on every push.",
    code: [
      ["cmd", "npx prisma auth login"],
      ["cmd", "npx prisma deploy module.ts"],
      ["out", "✓ deployment live: https://<you>.prisma.app"],
    ],
  },
  {
    n: "3",
    color: "var(--np-pink)",
    title: "Iterate",
    body: "Open /sync/dash, log in with the default key, then change the master key and API route. Config, users, and usage persist in SQLite inside the deployment.",
    code: [
      ["ok", "Dashboard:  /sync/dash   (key: admin — change it!)"],
      ["ok", "Clients:    /sync?sub=<user>  · Clash/sing-box/V2Ray"],
      ["ok", "Camouflage: /  → ubuntu.com/docker.com"],
    ],
  },
];

function StepCode({ lines }: { lines: Array<[string, string]> }) {
  return (
    <div className="np-mono mt-5 overflow-hidden rounded-lg border border-white/5 bg-black/50">
      <div className="np-term overflow-x-auto p-3.5 text-[11.5px] leading-relaxed">
        {lines.map(([kind, text], i) => (
          <div key={i} className="whitespace-pre">
            {kind === "cmd" && (
              <span className="text-neutral-200">
                <span className="text-[var(--np-cyan)]">$ </span>
                {text}
              </span>
            )}
            {kind === "out" && <span className="text-neutral-400">{text}</span>}
            {kind === "ok" && <span className="text-neutral-300">{text}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepsSection() {
  return (
    <section id="steps" className="border-t border-white/5 bg-[var(--np-surface)]/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          kicker="Deploy"
          title="Ship the gateway in three steps"
          sub="The Workers wizard (create D1 → bind IOT_DB → paste the worker → deploy) collapses into a single Prisma CLI flow."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="np-card flex flex-col p-6">
              <span
                className="np-mono mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                style={{
                  color: s.color,
                  background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${s.color} 25%, transparent)`,
                }}
              >
                {s.n}
              </span>
              <h3 className="text-[15px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">{s.body}</p>
              <div className="mt-auto">
                <StepCode lines={s.code} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── architecture: the compat layer ───────────────────────────────── */
function CodeBlock({
  file,
  code,
}: {
  file: string;
  code: React.ReactNode;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-white/5 bg-black/50">
      <div className="flex items-center justify-between border-b border-white/5 px-3.5 py-2">
        <span className="np-mono text-[10.5px] text-neutral-500">{file}</span>
      </div>
      <pre className="np-term np-mono overflow-x-auto p-3.5 text-[11.5px] leading-relaxed text-neutral-300">
        {code}
      </pre>
    </div>
  );
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="border-t border-white/5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          kicker="Architecture"
          title="Three adapters replace the Workers runtime"
          sub="The port keeps upstream's tunnel logic byte-for-byte and swaps the platform beneath it — every adapter carries a PORT NOTE in source explaining the mapping."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <div className="np-card p-6">
            <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(1,215,228,0.25)] bg-[rgba(1,215,228,0.12)] text-[var(--np-cyan)]">
              <Database className="h-4 w-4" />
            </span>
            <h3 className="text-[15px] font-semibold">D1 → SQLite store</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
              A D1-compatible facade over <code className="rounded bg-white/5 px-1 py-0.5 text-[11px]">bun:sqlite</code> —
              same <span className="text-neutral-200">prepare().bind().all()/run()</span> surface, so all 33
              persistence call sites in the worker run untouched. WAL mode for concurrent tunnels.
            </p>
            <CodeBlock
              file="src/compat/d1.ts"
              code={
                <>
                  <span className="text-neutral-500">{"// D1 shape, SQLite engine"}</span>{"\n"}
                  <span className="text-[var(--np-cyan)]">const</span> rows = <span className="text-neutral-200">await</span> env.IOT_DB{"\n"}
                  {"  "}.<span className="text-[var(--np-gold)]">prepare</span>(<span className="text-emerald-300">&quot;SELECT value FROM kv_store…&quot;</span>){"\n"}
                  {"  "}.<span className="text-[var(--np-gold)]">bind</span>(key).<span className="text-[var(--np-gold)]">all</span>();{"\n"}
                  {"rows.results"} <span className="text-neutral-500">{"// identical contract"}</span>
                </>
              }
            />
          </div>
          <div className="np-card p-6">
            <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(243,195,6,0.25)] bg-[rgba(243,195,6,0.12)] text-[var(--np-gold)]">
              <Zap className="h-4 w-4" />
            </span>
            <h3 className="text-[15px] font-semibold">Sockets → Bun.connect</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
              <code className="rounded bg-white/5 px-1 py-0.5 text-[11px]">cloudflare:sockets</code> doesn&apos;t
              exist on Bun. The adapter returns the exact CF socket shape —{" "}
              <span className="text-neutral-200">.opened / .readable / .writable / .close()</span> — so the
              VLESS/Trojan dial path, failover and relay-quarantine logic port verbatim.
            </p>
            <CodeBlock
              file="src/compat/sockets.ts"
              code={
                <>
                  <span className="text-neutral-500">{"// CF contract over Bun.connect"}</span>{"\n"}
                  <span className="text-[var(--np-cyan)]">const</span> sock = <span className="text-[var(--np-gold)]">connect</span>({"{"} hostname, port {"}"});{"\n"}
                  <span className="text-neutral-200">await</span> sock.<span className="text-[var(--np-gold)]">opened</span>;{"\n"}
                  sock.readable.<span className="text-[var(--np-gold)]">pipeTo</span>(wsWritable);{"\n"}
                  sock.writable.<span className="text-[var(--np-gold)]">getWriter</span>().<span className="text-[var(--np-gold)]">write</span>(chunk);
                </>
              }
            />
          </div>
          <div className="np-card p-6">
            <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(240,14,92,0.25)] bg-[rgba(240,14,92,0.12)] text-[var(--np-pink)]">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="text-[15px] font-semibold">WebSocket tunnels</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">
              Cloudflare&apos;s <span className="text-neutral-200">WebSocketPair + Response(101)</span> becomes{" "}
              <span className="text-neutral-200">server.upgrade()</span> with the tunnel state machine driven
              by Bun WS events. Frames are normalized to ArrayBuffer to keep Cloudflare&apos;s binaryType
              semantics exact.
            </p>
            <CodeBlock
              file="src/server.ts"
              code={
                <>
                  websocket: {"{"}{"\n"}
                  {"  "}open(ws)   {"{"} d.tunnel = <span className="text-[var(--np-gold)]">createTunnel</span>(ws, …) {"}"},{"\n"}
                  {"  "}message(ws, m) {"{"} d.tunnel.<span className="text-[var(--np-gold)]">onMessage</span>(toArrayBuffer(m)) {"}"},{"\n"}
                  {"  "}close(ws)  {"{"} d.tunnel.<span className="text-[var(--np-gold)]">onClose</span>() {"}"},{"\n"}
                  {"}"}
                </>
              }
            />
          </div>
        </div>
        <div className="np-card mt-4 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
          <Terminal className="h-4 w-4 shrink-0 text-neutral-500" />
          <p className="text-[12.5px] leading-relaxed text-neutral-400">
            <span className="font-medium text-neutral-200">Verbatim port discipline:</span> src/worker.ts is
            regenerated from upstream _worker.js by{" "}
            <span className="np-mono text-neutral-300">tests/build-port.js</span> — 22 assertive patches, each
            tagged <span className="np-mono text-[var(--np-gold)]">PORT NOTE</span> in source. The script
            fails loudly if upstream drifts, so future merges stay mechanical.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── stats band ───────────────────────────────────────────────────── */
const STATS = [
  { v: "11,114", l: "lines ported verbatim", c: "var(--np-cyan)" },
  { v: "22", l: "tagged PORT NOTE patches", c: "var(--np-gold)" },
  { v: "2", l: "protocol tunnels e2e-verified", c: "var(--np-pink)" },
  { v: "4", l: "checkpoints pushed to GitHub", c: "var(--np-orange)" },
];

function StatsSection() {
  return (
    <section className="border-t border-white/5 bg-[var(--np-surface)]/40 py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.l} className="text-center">
            <div
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: s.c }}
            >
              {s.v}
            </div>
            <div className="mt-1.5 text-xs leading-snug text-neutral-500">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── checkpoint timeline ──────────────────────────────────────────── */
const COMMITS = [
  {
    hash: "bf4522c",
    tag: "checkpoint 1",
    title: "Project scaffold",
    body: "Bun package manifest (zero runtime deps), tsconfig, .gitignore, MIT license, env template, directory layout for the compat layer.",
    color: "var(--np-cyan)",
  },
  {
    hash: "c9e19f2",
    tag: "checkpoint 2+3",
    title: "Core port — compat layer, worker, tunnels",
    body: "d1/sockets/runtime adapters, the 11,114-line worker with 22 tagged patches, Bun.serve entry, and the VLESS + Trojan e2e test suite (both green).",
    color: "var(--np-gold)",
  },
  {
    hash: "59e205c",
    tag: "checkpoint 4",
    title: "Dashboard + subscription pages",
    body: "Upstream pages with five Prisma adaptations — branding, EN/FA help text, legacy-marked Cloudflare section with the prisma deploy note.",
    color: "var(--np-pink)",
  },
  {
    hash: "8167295",
    tag: "checkpoint 5",
    title: "Prisma Compute deployment + docs",
    body: "module.ts, prisma.config.ts, service definition, dual entries (standalone / service.port()), build pipeline (137 modules → dist/compute.js), README + deploy guide + changelog.",
    color: "var(--np-orange)",
  },
];

function CheckpointsSection() {
  return (
    <section id="checkpoints" className="border-t border-white/5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          kicker="Checkpoints"
          title="The port, committed as it happened"
          sub="Every milestone is a checkpoint on GitHub — browse the exact diff at each stage of the Cloudflare → Prisma migration."
        />
        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/20" aria-hidden />
          <div className="space-y-8">
            {COMMITS.map((c) => (
              <div key={c.hash} className="relative pl-8">
                <span
                  className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2"
                  style={{
                    borderColor: c.color,
                    background: "var(--np-bg)",
                    boxShadow: `0 0 12px -2px ${c.color}`,
                  }}
                />
                <div className="np-card p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span
                      className="rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider"
                      style={{
                        color: c.color,
                        background: `color-mix(in srgb, ${c.color} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${c.color} 25%, transparent)`,
                      }}
                    >
                      {c.tag}
                    </span>
                    <span className="np-mono text-xs text-neutral-400">{c.hash}</span>
                    <a
                      href={`${REPO_URL}/commit/${c.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-[11px] text-neutral-500 hover:text-white"
                    >
                      diff →
                    </a>
                  </div>
                  <h3 className="mt-2.5 text-[14.5px] font-semibold">{c.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-400">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Is this a rewrite of Nahan?",
    a: "No — it is a disciplined port. The gateway core (src/worker.ts) is upstream _worker.js v3.0.4 shipped verbatim, regenerated by an assertive patch script. Only the platform bindings changed: the four Cloudflare APIs (D1, cloudflare:sockets, WebSocketPair, cron triggers) are replaced by Bun adapters, each tagged with a PORT NOTE comment in source. Feature parity with upstream is the whole point.",
  },
  {
    q: "What happens to my D1 data when migrating?",
    a: "Nahan-Prisma stores state in a local SQLite file with the same key/value schema upstream used in D1 (kv_store). New installs need nothing. For moving an existing install, use the dashboard's built-in Backup & Restore (JSON export/import) — it works unchanged and carries config, users, limits, and logs.",
  },
  {
    q: "Why is in-panel self-update disabled?",
    a: "On Cloudflare, Nahan redeploys itself through the Workers API. Prisma Compute has no equivalent runtime deploy API — code ships through the Prisma CLI (npx prisma deploy) or a connected GitHub repository. The dashboard still reports when a new version is available; applying it is a deploy, not a click.",
  },
  {
    q: "Do VLESS and Trojan clients work the same?",
    a: "Yes. Both protocols are e2e-verified by the test suite: WebSocket upgrade, header parsing, UUID/sha224 auth, TCP dialing, relay failover, and bidirectional piping all behave as upstream. Subscription formats (base64 URI list, Clash YAML/JSON, sing-box, V2Ray) negotiate by User-Agent exactly like before.",
  },
  {
    q: "Does the camouflage still work?",
    a: "Yes. Visiting the root path proxies to your configured maintenance host (ubuntu.com / docker.com by default), identical to upstream — unauthorized scanners see a regular website. The dashboard lives at /sync/dash (or your custom API route + /dash).",
  },
  {
    q: "What about the Cloudflare-specific extras?",
    a: "Cloudflare Analytics usage monitoring still works if you fill the legacy CF API fields (it is optional). request.cf geo enrichment (country/city/ASN in login alerts) is Cloudflare-only and renders as Unknown. Everything platform-neutral — Telegram bot, linked panels, clean IPs, NAT64, kill switch — works unchanged.",
  },
];

function FaqSection() {
  return (
    <section id="faq" className="border-t border-white/5 bg-[var(--np-surface)]/40 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading kicker="FAQ" title="Frequently asked questions" />
        <div className="mt-10 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="np-card group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-white">
                {f.q}
                <span className="shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-45">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-[13.5px] leading-relaxed text-neutral-400">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── final CTA ────────────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(243,195,6,0.5), rgba(240,14,92,0.25), transparent)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to run Nahan without Cloudflare?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-400">
          Clone the repo, run one deploy command, and your gateway is live on
          Prisma Compute — same dashboard, same protocols, same camouflage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="np-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
          >
            <Github className="h-4 w-4" />
            Get the port
          </a>
          <div className="np-mono inline-flex items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-[12.5px]">
            <span className="text-[var(--np-cyan)]">$</span>
            <span className="text-neutral-200">npx prisma deploy module.ts</span>
            <CopyCommand command="npx prisma deploy module.ts" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── footer ───────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <SegmentedMark />
              <span className="text-[15px] font-semibold">Nahan-Prisma</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-neutral-500">
              The Nahan gateway ported from Cloudflare Workers to Prisma
              Compute. MIT licensed, like upstream.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-14 gap-y-2 text-[13px] sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Repo</span>
              <a href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-white">README</a>
              <a href={`${REPO_URL}/tree/main/deploy`} target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-white">Deploy guide</a>
              <a href={`${REPO_URL}/tree/main/tests`} target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-white">Tests</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Platform</span>
              <a href="https://www.prisma.io/compute" target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-white">Prisma Compute</a>
              <a href="https://www.prisma.io/docs/prisma-compute/deploy" target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-white">Deploy docs</a>
              <a href="https://console.prisma.io" target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-white">Console</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Upstream</span>
              <a href={UPSTREAM_URL} target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-white">itsyebekhe/nahan</a>
              <a href="https://github.com/ImLTHQ/edgetunnel" target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-white">edgetunnel</a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-[11.5px] text-neutral-600 sm:flex-row sm:items-center">
          <span>Nahan-Prisma · ported from Nahan v3.0.4 · MIT</span>
          <span>
            Gateways are for privacy-preserving, lawful use. Respect your
            jurisdiction.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <div className="np-page min-h-screen">
      <AnnouncementBar />
      <Nav />
      <Hero />
      <main>
        <PortSection />
        <StepsSection />
        <ArchitectureSection />
        <StatsSection />
        <CheckpointsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
