"""VRAM-conservative DeepSeek model selection. Never auto-selects 32B/70B/671B."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

LAB_ROOT = Path(__file__).resolve().parents[1]
POLICY_PATH = LAB_ROOT / "config" / "hardware_policy.json"

FORBIDDEN_AUTO_TAGS = frozenset(
    {
        "deepseek-r1:32b",
        "deepseek-r1:70b",
        "deepseek-r1:671b",
        "deepseek-r1:671b-cloud",
    }
)


def load_policy(path: Path | None = None) -> dict[str, Any]:
    target = path or POLICY_PATH
    return json.loads(target.read_text(encoding="utf-8"))


def vram_gb_from_hardware(hardware: dict[str, Any] | None) -> float:
    if not hardware:
        return 0.0
    gpu = hardware.get("gpu") or {}
    total_mb = gpu.get("total_vram_mb") or 0
    try:
        return float(total_mb) / 1024.0
    except (TypeError, ValueError):
        return 0.0


def recommend_model(
    hardware: dict[str, Any] | None = None,
    *,
    policy: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Select the Phase 1 Ollama tag from measured VRAM.

    Rules:
    - missing/unknown/<=6 GB VRAM → deepseek-r1:1.5b
    - 7–10 GB → deepseek-r1:7b (quantized Ollama tag)
    - 11–15 GB → 7B baseline; larger experiments may be possible later
    - >=16 GB → 7B baseline; 14B only after that baseline passes (not auto-pulled)
    """
    policy = policy or load_policy()
    vram_gb = round(vram_gb_from_hardware(hardware), 2)
    if vram_gb < 7:
        tier = "tiny"
    elif vram_gb < 11:
        tier = "small"
    elif vram_gb < 16:
        tier = "mid"
    else:
        tier = "high"

    match = next(t for t in policy["tiers"] if t["id"] == tier)
    tag = match["ollama_tag"]
    if tag.lower() in FORBIDDEN_AUTO_TAGS:
        raise RuntimeError(f"policy attempted forbidden auto-select: {tag}")

    return {
        "tier": tier,
        "vram_gb": vram_gb,
        "ollama_tag": tag,
        "upstream_hf": match["upstream_hf"],
        "quantization": match.get("quantization"),
        "may_evaluate_later": list(match.get("may_evaluate_later") or []),
        "notes": match.get("notes"),
        "auto_pull_14b": False,
        "auto_pull_32b": False,
        "auto_pull_70b": False,
        "auto_pull_671b": False,
    }


def assert_tag_allowed(tag: str) -> str:
    normalized = (tag or "").strip().lower()
    if normalized in FORBIDDEN_AUTO_TAGS or any(
        needle in normalized for needle in (":32b", ":70b", ":671b")
    ):
        raise ValueError(f"refusing forbidden model tag: {tag}")
    return tag
