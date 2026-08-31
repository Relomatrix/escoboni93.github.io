"""Operational logging only. Prompt bodies, documents, and CoT are forbidden."""

from __future__ import annotations

import logging
from typing import Any, Mapping

FORBIDDEN_FIELD_NAMES = frozenset(
    {
        "prompt",
        "prompts",
        "messages",
        "message",
        "content",
        "body",
        "document",
        "documents",
        "text",
        "reasoning",
        "think",
        "thought",
        "chain_of_thought",
        "cot",
        "hidden_reasoning",
        "input",
        "output",
        "response",
        "completion",
        "user_message",
        "system_prompt",
        "pii",
    }
)

SAFE_FIELD_NAMES = frozenset(
    {
        "event",
        "provider",
        "model",
        "latency_ms",
        "input_tokens",
        "output_tokens",
        "finish_reason",
        "status_code",
        "error_code",
        "endpoint_host",
        "ok",
        "json_mode",
        "timeout_s",
        "path",
        "method",
        "tokens_per_sec",
        "case_id",
        "valid_json",
        "malformed",
        "timed_out",
    }
)


class PromptBodyLoggingError(ValueError):
    """Raised when a caller attempts to log a forbidden field."""


def assert_safe_fields(fields: Mapping[str, Any]) -> None:
    for key in fields:
        lowered = str(key).lower()
        if lowered in FORBIDDEN_FIELD_NAMES:
            raise PromptBodyLoggingError(
                f"refusing to log field {key!r}: prompt/document/CoT bodies are forbidden"
            )


def operational_logger(name: str = "model_lab") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter("%(asctime)s %(name)s %(levelname)s %(message)s"))
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        logger.propagate = False
    return logger


def safe_event(logger: logging.Logger, event: str, **fields: Any) -> None:
    payload = {"event": event, **fields}
    assert_safe_fields(payload)
    logger.info("op %s", payload)
