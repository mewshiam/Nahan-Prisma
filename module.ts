/**
 * ──────────────────────────────────────────────────────────────────────
 * Nahan-Prisma — Prisma Compute deploy module (root entry).
 * ──────────────────────────────────────────────────────────────────────
 * Deploy with:
 *
 *   npx prisma auth login        # once
 *   bun run build                # bundle src/compute.ts → dist/
 *   npx prisma deploy module.ts
 *
 * Re-running `npx prisma deploy module.ts` applies only what changed.
 * See deploy/README.md for the full guide.
 */
import { module } from "@prisma/composer";
import webService from "./src/service.ts";

export default module("nahan-prisma", ({ provision }) => {
    provision(webService);
});
