/**
 * ──────────────────────────────────────────────────────────────────────
 * Prisma Compute service definition for the Nahan-Prisma gateway.
 * ──────────────────────────────────────────────────────────────────────
 * Follows the official Prisma Compute pattern:
 *   https://www.prisma.io/docs/prisma-compute/deploy
 *
 * The service has no external dependencies (deps: {}) — Nahan-Prisma
 * stores its state in a local SQLite file (bun:sqlite) inside the
 * deployment, replacing the Cloudflare D1 binding. Attach a Prisma
 * Postgres here later if you outgrow single-node SQLite.
 */
import node from "@prisma/composer/node";
import { compute } from "@prisma/composer-prisma-cloud";

export default compute({
    name: "nahan-gateway",
    deps: {},
    build: node({ module: import.meta.url, entry: "../src/compute.ts" }),
});
