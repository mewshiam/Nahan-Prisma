/**
 * test-trojan-tunnel.ts — verifies the Trojan (beta) protocol branch of
 * parseSensorData on the ported gateway.
 *
 * Trojan handshake layout expected by the gateway:
 *   sha224hex(uuid) + CRLF | cmd(1) | addrType(1) | addr | port(2BE) | CRLF | payload
 */
import { createHash } from "node:crypto";

const GATEWAY = process.env.GATEWAY_URL || "ws://127.0.0.1:8977";
const ECHO_PORT = 9997;
const UUID = "73796e63-0000-4000-8000-000000000000";

// SHA-224 hex of the UUID — matches the gateway's getTrojanHash()
const trojanHash = createHash("sha224").update(UUID).digest("hex");
console.log("✓ sha224(uuid) =", trojanHash.slice(0, 16) + "…");

const echo = Bun.listen({
    hostname: "127.0.0.1",
    port: ECHO_PORT,
    socket: { data(sock, data) { sock.write(data); } },
});
console.log(`✓ echo server on 127.0.0.1:${ECHO_PORT}`);

const ws = new WebSocket(`${GATEWAY}/sync`);
ws.binaryType = "arraybuffer";

const enc = new TextEncoder();
const trojanFrame = new Uint8Array([
    ...enc.encode(trojanHash),
    0x0d, 0x0a, // CRLF
    0x01, // cmd: TCP
    0x01, // addrType: IPv4
    127, 0, 0, 1,
    (ECHO_PORT >> 8) & 0xff, ECHO_PORT & 0xff, // port BE
    0x0d, 0x0a, // CRLF
    ...enc.encode("TROJAN-THROUGH-NAHAN-PRISMA"),
]);

let done = false;
const t0 = Date.now();

ws.onopen = () => {
    console.log("✓ websocket connected");
    ws.send(trojanFrame);
    console.log("✓ Trojan handshake + payload sent");
};

ws.onmessage = (ev) => {
    const text = new TextDecoder().decode(new Uint8Array(ev.data as ArrayBuffer));
    if (text.includes("TROJAN-THROUGH-NAHAN-PRISMA") && !done) {
        done = true;
        console.log("✓ trojan echo received:", text.trim());
        console.log("\n🎉 TROJAN BRANCH VERIFIED");
        console.log(`  elapsed: ${Date.now() - t0}ms`);
        ws.close();
        echo.stop();
        process.exit(0);
    }
};

ws.onerror = (e) => {
    console.error("✗ ws error:", (e as ErrorEvent).message);
    process.exit(1);
};
ws.onclose = () => {
    if (!done) {
        console.error("✗ closed without echo");
        process.exit(1);
    }
};
setTimeout(() => {
    console.error("✗ timeout waiting for trojan echo");
    process.exit(1);
}, 12000);
