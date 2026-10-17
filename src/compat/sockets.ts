/**
 * ──────────────────────────────────────────────────────────────────────
 * cloudflare:sockets → Bun.connect compatibility adapter
 * ──────────────────────────────────────────────────────────────────────
 *
 * PORT NOTE (Cloudflare → Prisma Compute):
 * On Cloudflare Workers, Nahan dials origin/relay TCP connections with:
 *
 *     import { connect } from "cloudflare:sockets";
 *     const sock = connect({ hostname, port });  // sync handle
 *     await sock.opened;                          // resolves when TCP is up
 *     sock.readable  // ReadableStream<Uint8Array> (downstream)
 *     sock.writable  // WritableStream<Uint8Array> (upstream)
 *     sock.close();
 *
 * `cloudflare:sockets` does not exist on Prisma Compute. Bun ships a
 * native TCP client (`Bun.connect`) with a callback/socket API. This
 * module exports a byte-compatible `connect()` that wraps `Bun.connect`
 * in the exact Cloudflare socket shape (opened / readable / writable /
 * close) the tunnel code expects, so the VLESS/Trojan data path — the
 * most battle-tested part of Nahan — is ported verbatim.
 *
 * Backpressure and lifecycle details preserved from the original:
 *  - `.opened` rejects on connect failure (feeds relay failover logic)
 *  - `.readable` ends/errors together with the TCP socket
 *  - `.writable` writes are queued by Bun internally; the upstream write
 *    path in the worker already enforces its own deadlines
 *    (writeSocketWithTimeout), so a stalled relay tears the tunnel down
 *    exactly like on Workers.
 */

import type { Socket } from "bun";

export interface CompatibleSocket {
    /** Resolves once the TCP handshake completes; rejects on failure. */
    opened: Promise<void>;
    /** Downstream byte stream (origin → client). */
    readable: ReadableStream<Uint8Array>;
    /** Upstream byte stream (client → origin). */
    writable: WritableStream<Uint8Array>;
    /** Hard-close the TCP connection. */
    close(): void;
    /** Bun socket handle (exposed for probes/diagnostics). */
    raw?: Socket | null;
}

/**
 * Cloudflare-compatible `connect({ hostname, port })` on top of Bun.connect.
 * Returns the socket handle synchronously; use `.opened` to await the
 * TCP handshake (this mirrors the Cloudflare:sockets contract).
 */
export function connect(opts: {
    hostname: string;
    port: number;
}): CompatibleSocket {
    const { hostname, port } = opts;

    let socketRef: Socket | null = null;

    let resolveOpen: () => void;
    let rejectOpen: (err: unknown) => void;
    const opened = new Promise<void>((res, rej) => {
        resolveOpen = res;
        rejectOpen = rej;
    });

    let readableController: ReadableStreamDefaultController<Uint8Array>;
    let readableClosed = false;
    const readable = new ReadableStream<Uint8Array>({
        start(controller) {
            readableController = controller;
        },
        cancel() {
            readableClosed = true;
            try {
                socketRef?.end();
            } catch {
                /* ignore */
            }
        },
    });

    const pushDown = (chunk: Uint8Array) => {
        if (readableClosed) return;
        try {
            readableController.enqueue(
                chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk),
            );
        } catch {
            /* consumer gone — drop */
        }
    };
    const finishDown = (err?: unknown) => {
        if (readableClosed) return;
        readableClosed = true;
        try {
            if (err) readableController.error(err);
            else readableController.close();
        } catch {
            /* ignore */
        }
    };

    const socketPromise: Promise<Socket> = Bun.connect({
        hostname,
        port,
        socket: {
            data(_sock, data) {
                // Bun hands us a Buffer; hand the worker a plain Uint8Array
                // so byte-level protocol parsing behaves identically.
                pushDown(new Uint8Array(data));
            },
            close() {
                finishDown();
            },
            error(_sock, err) {
                finishDown(err);
                try {
                    rejectOpen(err);
                } catch {
                    /* already settled */
                }
            },
            end(sock) {
                try {
                    sock.end();
                } catch {
                    /* ignore */
                }
                finishDown();
            },
            drain() {
                /* Bun manages the write queue internally */
            },
        },
    });

    socketPromise.then(
        (sock) => {
            socketRef = sock;
            try {
                resolveOpen();
            } catch {
                /* already settled */
            }
        },
        (err) => {
            socketRef = null;
            finishDown(err);
            try {
                rejectOpen(err);
            } catch {
                /* already settled */
            }
        },
    );

    const writable = new WritableStream<Uint8Array>({
        write(chunk) {
            if (!socketRef) {
                // The worker never writes before awaiting .opened, but keep
                // a defensive rejection to preserve CF semantics.
                return Promise.reject(new Error("socket-not-open"));
            }
            try {
                const ok = socketRef.write(chunk);
                if (ok < 0) return Promise.reject(new Error("socket-write-fail"));
            } catch (e) {
                return Promise.reject(e);
            }
            return Promise.resolve();
        },
        close() {
            try {
                socketRef?.end();
            } catch {
                /* ignore */
            }
        },
        abort() {
            try {
                socketRef?.terminate();
            } catch {
                /* ignore */
            }
        },
    });

    const compatSocket: CompatibleSocket = {
        // Await BOTH the connect promise and the open event — whoever
        // settles first with a failure rejects the combined promise, which
        // is what withDeadline()/relay-failover in the worker expects.
        opened: Promise.all([
            socketPromise.then(() => undefined),
            opened,
        ]).then(() => undefined),
        readable,
        writable,
        close() {
            try {
                socketRef?.terminate();
            } catch {
                /* ignore */
            }
            try {
                socketRef?.end();
            } catch {
                /* ignore */
            }
            finishDown();
        },
        get raw() {
            return socketRef;
        },
    };

    return compatSocket;
}
