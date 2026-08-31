from __future__ import annotations

import pytest

from providers.contract import ChatMessage, CompletionRequest
from providers.errors import ProviderMalformedResponseError
from providers.ollama_deepseek import OllamaDeepSeekProvider
from providers.reasoning import strip_hidden_reasoning
from tests.http_helpers import LocalOllama, json_bytes


def test_complete_rejects_non_json() -> None:
    def handler(method: str, path: str, _body: bytes):
        return 200, b"not-json<", "text/plain"

    with LocalOllama(handler) as server:
        provider = OllamaDeepSeekProvider(base_url=server.base_url, timeout_s=2)
        with pytest.raises(ProviderMalformedResponseError):
            provider.complete(CompletionRequest(messages=[ChatMessage(role="user", content="x")]))


def test_complete_rejects_missing_message_object() -> None:
    def handler(method: str, path: str, _body: bytes):
        return 200, json_bytes({"done": True, "message": "oops"}), "application/json"

    with LocalOllama(handler) as server:
        provider = OllamaDeepSeekProvider(base_url=server.base_url, timeout_s=2)
        with pytest.raises(ProviderMalformedResponseError):
            provider.complete(CompletionRequest(messages=[ChatMessage(role="user", content="x")]))


def test_complete_strips_think_and_drops_thinking_field() -> None:
    def handler(method: str, path: str, _body: bytes):
        return (
            200,
            json_bytes(
                {
                    "model": "deepseek-r1:1.5b",
                    "done": True,
                    "done_reason": "stop",
                    "prompt_eval_count": 11,
                    "eval_count": 7,
                    "eval_duration": 1_000_000_000,
                    "message": {
                        "role": "assistant",
                        "content": "<think>secret chain</think>{\"status\":\"ok\",\"result\":391}",
                        "thinking": "secret chain",
                    },
                }
            ),
            "application/json",
        )

    with LocalOllama(handler) as server:
        provider = OllamaDeepSeekProvider(base_url=server.base_url, timeout_s=2)
        result = provider.complete(CompletionRequest(messages=[ChatMessage(role="user", content="x")]))
    assert "secret chain" not in result.content
    assert result.content == '{"status":"ok","result":391}'
    assert result.provider == "local_ollama"
    assert result.input_tokens == 11
    assert result.output_tokens == 7
    assert result.metadata["tokens_per_sec"] == 7.0
    assert "secret" not in strip_hidden_reasoning("<think>secret</think>ok")
