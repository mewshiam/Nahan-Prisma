/**
 * ──────────────────────────────────────────────────────────────────────
 * Prisma CLI configuration for the Nahan-Prisma gateway.
 * ──────────────────────────────────────────────────────────────────────
 * Follows the official Prisma Compute deployment configuration:
 *   https://www.prisma.io/docs/prisma-compute/deploy
 *
 * - prismaCloud:  connects the deploy to your Prisma Platform account
 *                  (pick the region closest to your users; default
 *                  us-east-1)
 * - nodeBuild:    bundles the TypeScript service for the Bun runtime
 * - prismaState:  tracks provisioned infrastructure in local state
 */
import { defineConfig as composer } from "@prisma/composer/config";
import { nodeBuild } from "@prisma/composer/node/control";
import {
    prismaCloud,
    prismaState,
} from "@prisma/composer-prisma-cloud/control";
import { definePrismaConfig } from "prisma/config";

export default definePrismaConfig({
    composer: composer({
        extensions: [prismaCloud({ region: "us-east-1" }), nodeBuild()],
        state: prismaState(),
    }),
});
