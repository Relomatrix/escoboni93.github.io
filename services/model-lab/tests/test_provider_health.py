from __future__ import annotations

from providers.ollama_deepseek import OllamaDeepSeekProvider
from tests.http_helpers import LocalOllama, json_bytes


def test_health_ok_and_model_present() -> None:
    def handler(method: str, path: str, _body: bytes):
        if path == "/api/version":
            return 200, json_bytes({"version": "0.9.0-test"}), "application/json"
        if path == "/api/tags":
            return 200, json_bytes({"models": [{"name": "deepseek-r1:1.5b"}]}), "application/json"
        return 404, b"{}", "application/json"

    with LocalOllama(handler) as server:
        provider = OllamaDeepSeekProvider(base_url=server.base_url, model="deepseek-r1:1.5b")
        health = provider.health()
    assert health.ok is True
    assert health.model_present is True
    assert health.provider == "local_ollama"
    assert "0.9.0-test" in health.detail


def test_health_ok_but_model_missing() -> None:
    def handler(method: str, path: str, _body: bytes):
        if path == "/api/version":
            return 200, json_bytes({"version": "0.9.0-test"}), "application/json"
        if path == "/api/tags":
            return 200, json_bytes({"models": []}), "application/json"
        return 404, b"{}", "application/json"

    with LocalOllama(handler) as server:
        provider = OllamaDeepSeekProvider(base_url=server.base_url, model="deepseek-r1:1.5b")
        health = provider.health()
    assert health.ok is True
    assert health.model_present is False


def test_health_unreachable() -> None:
    provider = OllamaDeepSeekProvider(base_url="http://127.0.0.1:1", timeout_s=0.2)
    health = provider.health()
    assert health.ok is False
    assert health.detail in {"provider_unreachable", "provider_timeout"}
