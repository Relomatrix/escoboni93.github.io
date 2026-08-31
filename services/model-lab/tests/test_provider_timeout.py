from __future__ import annotations

import time

import pytest

from providers.errors import ProviderTimeoutError
from providers.contract import ChatMessage, CompletionRequest
from providers.ollama_deepseek import OllamaDeepSeekProvider
from tests.http_helpers import LocalOllama, json_bytes


def test_complete_times_out_without_retry_storm() -> None:
    hits = {"count": 0}

    def handler(method: str, path: str, _body: bytes):
        hits["count"] += 1
        time.sleep(1.2)
        return 200, json_bytes({}), "application/json"

    with LocalOllama(handler) as server:
        provider = OllamaDeepSeekProvider(
            base_url=server.base_url,
            model="deepseek-r1:1.5b",
            timeout_s=0.2,
        )
        with pytest.raises(ProviderTimeoutError) as exc:
            provider.complete(
                CompletionRequest(messages=[ChatMessage(role="user", content="ping")])
            )
    assert exc.value.code == "provider_timeout"
    assert hits["count"] == 1


def test_health_timeout() -> None:
    def handler(method: str, path: str, _body: bytes):
        time.sleep(1.0)
        return 200, json_bytes({"version": "x"}), "application/json"

    with LocalOllama(handler) as server:
        provider = OllamaDeepSeekProvider(base_url=server.base_url, timeout_s=0.15)
        health = provider.health()
    assert health.ok is False
    assert health.detail == "provider_timeout"
