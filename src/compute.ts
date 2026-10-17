/**
 * ──────────────────────────────────────────────────────────────────────
 * Prisma Compute entry — bound to service.port() per the platform
 * contract (see https://www.prisma.io/docs/prisma-compute/deploy).
 * ──────────────────────────────────────────────────────────────────────
 * The platform provisions this service from module.ts → src/service.ts.
 * Everything else (routing, tunnels, storage) is shared with the
 * standalone entry in src/index.ts.
 */
import service from "./service.ts";
import { startGateway } from "./server.ts";

startGateway(service.port(), "0.0.0.0");
