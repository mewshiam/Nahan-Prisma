/**
 * Standalone entry — `bun run src/index.ts` (or `bun run dev`).
 *
 * On Prisma Compute the platform entry is src/compute.ts instead
 * (service.port()); this file is for local runs, Docker, VPSes, or any
 * other Bun-capable host. Behaviour is identical apart from the port
 * source.
 */
import { serverPort } from "./compat/runtime";
import { startGateway } from "./server";

startGateway(serverPort(), "0.0.0.0");
