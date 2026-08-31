"""Strip hidden reasoning. Visible completions must never include chain-of-thought."""

from __future__ import annotations

import re

_THINK_BLOCK = re.compile(r"<think\b[^>]*>.*?</think>", re.DOTALL | re.IGNORECASE)
_THINK_OPEN = re.compile(r"<think\b[^>]*>.*", re.DOTALL | re.IGNORECASE)


def strip_hidden_reasoning(text: str) -> str:
    if not text:
        return ""
    visible = _THINK_BLOCK.sub("", text)
    visible = _THINK_OPEN.sub("", visible)
    return visible.strip()
