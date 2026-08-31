from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Callable


class _Router(BaseHTTPRequestHandler):
    router: "LocalOllama"

    def log_message(self, fmt: str, *args: object) -> None:
        return

    def _read(self) -> bytes:
        length = int(self.headers.get("Content-Length") or "0")
        return self.rfile.read(length) if length else b""

    def do_GET(self) -> None:  # noqa: N802
        self.router.handle(self, "GET")

    def do_POST(self) -> None:  # noqa: N802
        self.router.handle(self, "POST")


class LocalOllama:
    def __init__(self, handler: Callable[[str, str, bytes], tuple[int, bytes, str]]) -> None:
        self._handler = handler
        _Router.router = self
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), _Router)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)

    @property
    def base_url(self) -> str:
        host, port = self.server.server_address[:2]
        return f"http://{host}:{port}"

    def handle(self, request: BaseHTTPRequestHandler, method: str) -> None:
        status, body, content_type = self._handler(method, request.path, request._read())
        request.send_response(status)
        request.send_header("Content-Type", content_type)
        request.send_header("Content-Length", str(len(body)))
        request.end_headers()
        request.wfile.write(body)

    def __enter__(self) -> "LocalOllama":
        self.thread.start()
        return self

    def __exit__(self, *args: object) -> None:
        self.server.shutdown()
        self.server.server_close()


def json_bytes(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload).encode("utf-8")
