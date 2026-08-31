#!/usr/bin/env python3
"""Development-only OpenAI-compatible localhost bridge.

MUST NOT be exposed to the Internet.
Binds 127.0.0.1 only. No authentication suitable for public deployment.
"""

from __future__ import annotations

import json
import os
import sys
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from providers.contract import ChatMessage, CompletionRequest  # noqa: E402
from providers.errors import ModelLabError, UnsafeBindError  # noqa: E402
from providers.localhost import assert_dev_bind_host  # noqa: E402
from providers.logging_policy import operational_logger, safe_event  # noqa: E402
from providers.ollama_deepseek import OllamaDeepSeekProvider  # noqa: E402

_LOG = operational_logger("model_lab.bridge")
WARNING = (
    "WARNING: This Model Lab bridge is DEVELOPMENT-ONLY and MUST NOT be "
    "exposed to the Internet. It binds localhost only and has no public auth."
)


def _json_bytes(payload: dict[str, Any], status: int = 200) -> tuple[int, bytes]:
    return status, json.dumps(payload).encode("utf-8")


class BridgeHandler(BaseHTTPRequestHandler):
    server_version = "ModelLabDevBridge/0.1"
    provider: OllamaDeepSeekProvider

    def log_message(self, fmt: str, *args: object) -> None:
        # Operational only: path + status. Never request bodies.
        path = urlparse(self.path).path
        safe_event(_LOG, "http", path=path, method=self.command)

    def _send(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length") or "0")
        raw = self.rfile.read(length) if length else b"{}"
        try:
            parsed = json.loads(raw.decode("utf-8") or "{}")
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError("malformed JSON body") from exc
        if not isinstance(parsed, dict):
            raise ValueError("JSON body must be an object")
        return parsed

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        meta = self.provider.metadata()
        if path in {"/health", "/v1/health"}:
            health = self.provider.health()
            self._send(
                200 if health.ok else 503,
                {
                    "status": "ok" if health.ok else "unavailable",
                    "development_only": True,
                    "localhost_only": True,
                    "warning": WARNING,
                    "provider": health.provider,
                    "endpoint": health.endpoint,
                    "detail": health.detail,
                    "model_present": health.model_present,
                    "latency_ms": health.latency_ms,
                },
            )
            return
        if path in {"/metadata", "/v1/models", "/v1/metadata"}:
            self._send(
                200,
                {
                    "object": "list",
                    "warning": WARNING,
                    "development_only": True,
                    "localhost_only": True,
                    "data": [
                        {
                            "id": meta.model,
                            "object": "model",
                            "owned_by": "local_ollama",
                            "provider": meta.provider,
                            "runtime": meta.runtime,
                            "endpoint": meta.endpoint,
                        }
                    ],
                    "provider": {
                        "provider": meta.provider,
                        "model": meta.model,
                        "endpoint": meta.endpoint,
                        "runtime": meta.runtime,
                        "localhost_only": meta.localhost_only,
                        "development_only": meta.development_only,
                    },
                },
            )
            return
        self._send(404, {"error": {"message": "not found", "type": "not_found"}})

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path != "/v1/chat/completions":
            self._send(404, {"error": {"message": "not found", "type": "not_found"}})
            return
        try:
            body = self._read_json()
        except ValueError:
            self._send(400, {"error": {"message": "malformed JSON", "type": "invalid_request"}})
            return

        messages_raw = body.get("messages")
        if not isinstance(messages_raw, list) or not messages_raw:
            self._send(400, {"error": {"message": "messages required", "type": "invalid_request"}})
            return

        messages: list[ChatMessage] = []
        for item in messages_raw:
            if not isinstance(item, dict):
                self._send(400, {"error": {"message": "invalid message", "type": "invalid_request"}})
                return
            role = str(item.get("role") or "user")
            content = item.get("content")
            if not isinstance(content, str):
                self._send(400, {"error": {"message": "invalid message content", "type": "invalid_request"}})
                return
            messages.append(ChatMessage(role=role, content=content))

        temperature = float(body.get("temperature") or 0.0)
        max_tokens = int(body.get("max_tokens") or 1024)
        json_mode = False
        json_schema = None
        response_format = body.get("response_format") or {}
        if isinstance(response_format, dict) and response_format.get("type") in {"json_object", "json_schema"}:
            json_mode = True
            schema = response_format.get("json_schema") or response_format.get("schema")
            if isinstance(schema, dict):
                json_schema = schema

        try:
            result = self.provider.complete(
                CompletionRequest(
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    json_mode=json_mode,
                    json_schema=json_schema,
                )
            )
        except ModelLabError as exc:
            safe_event(_LOG, "complete_fail", error_code=exc.code, provider="local_ollama")
            self._send(502, {"error": {"message": exc.message, "type": exc.code}})
            return

        created = int(time.time())
        self._send(
            200,
            {
                "id": f"chatcmpl-{uuid.uuid4().hex[:24]}",
                "object": "chat.completion",
                "created": created,
                "model": result.model,
                "choices": [
                    {
                        "index": 0,
                        "message": {"role": "assistant", "content": result.content},
                        "finish_reason": result.finish_reason,
                    }
                ],
                "usage": {
                    "prompt_tokens": result.input_tokens or 0,
                    "completion_tokens": result.output_tokens or 0,
                    "total_tokens": (result.input_tokens or 0) + (result.output_tokens or 0),
                },
                "model_lab": {
                    **result.safe_metadata(),
                    "development_only": True,
                    "localhost_only": True,
                },
            },
        )


def run(host: str | None = None, port: int | None = None) -> None:
    bind_host = host or os.environ.get("MODEL_LAB_HOST") or "127.0.0.1"
    bind_port = int(port or os.environ.get("MODEL_LAB_PORT") or 8077)
    try:
        assert_dev_bind_host(bind_host)
    except UnsafeBindError as exc:
        print(exc.message, file=sys.stderr)
        raise SystemExit(2) from exc

    provider = OllamaDeepSeekProvider()
    BridgeHandler.provider = provider

    print(WARNING)
    print(f"listening on http://{bind_host}:{bind_port}")
    print("endpoints: GET /health  GET /metadata  POST /v1/chat/completions")

    server = ThreadingHTTPServer((bind_host, bind_port), BridgeHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopping")
        server.shutdown()


if __name__ == "__main__":
    run()
