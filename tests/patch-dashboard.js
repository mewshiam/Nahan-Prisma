/**
 * patch-dashboard.js — Prisma-specific adaptations for the ported
 * dashboard.html. Light-touch: branding, help text, and the Cloudflare
 * section note. Everything else ships verbatim from upstream.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "/home/z/my-project/nahan-prisma/src/pages/dashboard.html";
let src = readFileSync(FILE, "utf8");
const patches = [];

function patch(name, find, replace, expect = 1) {
    const n = src.split(find).length - 1;
    if (n !== expect)
        throw new Error(`PATCH FAILED: ${name} expected ${expect}, found ${n}`);
    src = src.split(find).join(replace);
    patches.push(name);
}

/* 1 — title branding */
patch(
    "title branding",
    `<title>Nahan Gateway</title>`,
    `<title>Nahan-Prisma Gateway</title>`,
);

/* 2 — English help text */
patch(
    "EN help text",
    `Nahan Gateway is an advanced, high-performance, single-file subscription and proxy manager built directly for Cloudflare Workers. It acts as a gateway to securely distribute configurations (Clash, Sing-box, Trojan, VMess) to clients while concealing the main panel's backend server behind Cloudflare's global edge network.`,
    `Nahan Gateway is an advanced, high-performance, single-file subscription and proxy manager, originally built for Cloudflare Workers and now ported natively to Prisma Compute (Bun runtime). It acts as a gateway to securely distribute configurations (Clash, Sing-box, Trojan, VMess) to clients while concealing the panel behind its camouflage proxy.`,
);

/* 3 — Persian help text */
patch(
    "FA help text",
    `دروازه نهان یک سیستم مدیریت اشتراک و پروکسی پیشرفته و تک‌فایلی است که برای کلودفلر ورکرز توسعه یافته است. این سیستم به عنوان یک دروازه عمل می‌کند تا کانفیگ‌ها (Clash, Sing-box, Trojan, VMess) را به صورت امن توزیع کند و سرور اصلی شما را پشت شبکه جهانی کلودفلر پنهان کند.`,
    `دروازه نهان یک سیستم مدیریت اشتراک و پروکسی پیشرفته و تک‌فایلی است که در اصل برای کلودفلر ورکرز ساخته شده بود و اکنون به صورت بومی روی پرایسما کامپیوت (زمان اجرای Bun) پورت شده است. این سیستم به عنوان یک دروازه عمل می‌کند تا کانفیگ‌ها (Clash, Sing-box, Trojan, VMess) را به صورت امن توزیع کند و پنل اصلی شما را پشت پروکسی پنهان‌سازی خود پنهان کند.`,
);

/* 4 — Prisma note inside the Cloudflare Advanced section */
patch(
    "Cloudflare section Prisma note",
    `                                      <span class="text-sm font-bold text-slate-700 dark:text-white" data-i18n="adv_cloudflare">Cloudflare</span>`,
    `                                      <span class="text-sm font-bold text-slate-700 dark:text-white" data-i18n="adv_cloudflare">Cloudflare (legacy)</span>`,
);
{
    // Inject a note box at the top of the section content (anchored on
    // the unique cfg-cf-acc input further down for section-scoped match)
    const anchor = `<div class="space-y-3 px-5 pb-5 pt-1">
                                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div class="space-y-1">
                                              <label class="block text-sm font-bold text-slate-600 dark:text-slate-300" data-i18n="lbl_cf_acc">CF Account ID</label>`;
    const replacement = `<div class="space-y-3 px-5 pb-5 pt-1">
                                      <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs leading-relaxed" dir="ltr">
                                          <b>Prisma Compute:</b> these fields only feed the optional Cloudflare Analytics usage widget. In-panel code self-update is disabled on Prisma Compute — ship code with <code class="px-1 rounded bg-amber-100 dark:bg-amber-900/40">npx prisma deploy</code> (see the repository deploy guide).
                                      </div>
                                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div class="space-y-1">
                                              <label class="block text-sm font-bold text-slate-600 dark:text-slate-300" data-i18n="lbl_cf_acc">CF Account ID</label>`;
    patch("Cloudflare section note box", anchor, replacement);
}

writeFileSync(FILE, src);
console.log("DASHBOARD PATCHED");
patches.forEach((p) => console.log("  ✓ " + p));
