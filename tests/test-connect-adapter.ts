/**
 * test-connect-adapter.ts — unit test for the CF-compatible connect()
 * adapter (src/compat/sockets.ts) against a local echo server.
 */
import { connect } from "../src/compat/sockets";

const ECHO_PORT = 9998;

const echo = Bun.listen({
    hostname: "127.0.0.1",
    port: ECHO_PORT,
    socket: {
        data(sock, data) {
            sock.write(data);
        },
    },
});
console.log("✓ echo server on 9998");

// 1. connect
const sock = connect({ hostname: "127.0.0.1", port: ECHO_PORT });
console.log("✓ connect() returned handle synchronously");

// 2. opened resolves
await sock.opened;
console.log("✓ .opened resolved");

// 3. upstream write
const writer = sock.writable.getWriter();
await writer.write(new TextEncoder().encode("ADAPTER-HELLO"));
console.log("✓ writable.getWriter().write() ok");

// 4. downstream read
const reader = sock.readable.getReader();
const { value } = await reader.read();
const text = new TextDecoder().decode(value as Uint8Array);
console.log("✓ readable read:", text.trim());

if (text.trim() !== "ADAPTER-HELLO") {
    console.error("✗ echo mismatch");
    process.exit(1);
}

// 5. close
sock.close();
console.log("✓ close() ok");
echo.stop();
console.log("\n🎉 CONNECT ADAPTER VERIFIED");
process.exit(0);
