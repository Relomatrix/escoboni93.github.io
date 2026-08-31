from __future__ import annotations

import logging

import pytest

from providers.contract import ChatMessage, CompletionRequest
from providers.logging_policy import PromptBodyLoggingError, operational_logger, safe_event
from providers.ollama_deepseek import OllamaDeepSeekProvider
from tests.http_helpers import LocalOllama, json_bytes


class ListHandler(logging.Handler):
    def __init__(self) -> None:
        super().__init__()
        self.records: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.records.append(self.format(record))


def test_safe_event_rejects_prompt_fields() -> None:
    logger = operational_logger("model_lab.test_forbidden")
    with pytest.raises(PromptBodyLoggingError):
        safe_event(logger, "x", prompt="secret user prompt")
    with pytest.raises(PromptBodyLoggingError):
        safe_event(logger, "x", messages=[{"role": "user", "content": "nope"}])
    with pytest.raises(PromptBodyLoggingError):
        safe_event(logger, "x", content="document body")


def test_complete_does_not_log_prompt_or_completion_bodies() -> None:
    secret = "UNIQUE_PROMPT_BODY_TOKEN_42_RESIDENZA"

    def handler(method: str, path: str, _body: bytes):
        return (
            200,
            json_bytes(
                {
                    "model": "deepseek-r1:1.5b",
                    "done": True,
                    "message": {"role": "assistant", "content": "UNIQUE_RESPONSE_BODY_TOKEN"},
                    "prompt_eval_count": 3,
                    "eval_count": 2,
                }
            ),
            "application/json",
        )

    logger = logging.getLogger("model_lab.ollama")
    handler_cap = ListHandler()
    logger.addHandler(handler_cap)
    try:
        with LocalOllama(handler) as server:
            provider = OllamaDeepSeekProvider(base_url=server.base_url, timeout_s=2)
            provider.complete(
                CompletionRequest(messages=[ChatMessage(role="user", content=secret)])
            )
    finally:
        logger.removeHandler(handler_cap)

    joined = "\n".join(handler_cap.records)
    assert secret not in joined
    assert "UNIQUE_RESPONSE_BODY_TOKEN" not in joined
    assert "complete_ok" in joined
