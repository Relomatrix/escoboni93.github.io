"""Best-effort JSON extraction from model text. Never keeps hidden reasoning."""

from __future__ import annotations

import json
import re
from typing import Any

from providers.reasoning import strip_hidden_reasoning

_FENCE_RE = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL | re.IGNORECASE)


def extract_json_object(text: str) -> dict[str, Any]:
    visible = strip_hidden_reasoning(text or "")
    if not visible:
        raise ValueError("empty visible text")

    candidates: list[str] = [visible.strip()]
    fenced = _FENCE_RE.search(visible)
    if fenced:
        candidates.insert(0, fenced.group(1))

    start = visible.find("{")
    end = visible.rfind("}")
    if start != -1 and end > start:
        candidates.append(visible[start : end + 1])

    last_error: Exception | None = None
    seen: set[str] = set()
    for candidate in candidates:
        if candidate in seen:
            continue
        seen.add(candidate)
        try:
            parsed = json.loads(candidate)
        except json.JSONDecodeError as exc:
            last_error = exc
            continue
        if isinstance(parsed, dict):
            return parsed
        last_error = ValueError("JSON root is not an object")
    raise ValueError(f"no JSON object found: {last_error}")


def is_success_status(value: Any) -> bool:
    if value is True:
        return True
    if isinstance(value, (int, float)) and value == 1:
        return True
    if isinstance(value, str):
        return value.strip().lower() in {"ok", "success", "succeeded", "pass", "passed", "true"}
    return False


def looks_italian(text: str) -> bool:
    """Language smoke only. Not a production-quality language detector."""
    visible = strip_hidden_reasoning(text or "").lower()
    markers = (
        " la ",
        " il ",
        " lo ",
        " gli ",
        " delle ",
        " della ",
        " è ",
        " e ",
        "residenza",
        "fiscale",
        "persona",
        "paese",
        "stato",
        "dove",
        "un'",
    )
    return any(marker in f" {visible} " for marker in markers)
