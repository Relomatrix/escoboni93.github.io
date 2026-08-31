from __future__ import annotations

import json

from providers.hardware import collect_hardware
from providers.model_selection import recommend_model


def test_collect_hardware_has_no_pii_keys() -> None:
    snap = collect_hardware()
    for key in ("hostname", "username", "user", "home", "ip", "mac"):
        assert key not in snap
        assert key not in snap.get("os", {})
        assert key not in snap.get("software", {})
    blob = json.dumps(snap)
    assert "/home/" not in blob
    assert "ssh" not in blob.lower()
    assert "token" not in blob.lower()
    assert "password" not in blob.lower()
    assert "os" in snap and "gpu" in snap and "memory" in snap
    assert snap["gpu"]["total_vram_mb"] >= 0


def test_recommendation_is_deterministic_for_same_snapshot() -> None:
    hw = {
        "gpu": {
            "nvidia_smi_available": True,
            "devices": [{"name": "synthetic", "total_vram_mb": 8192, "free_vram_mb": 7000}],
            "total_vram_mb": 8192,
        }
    }
    a = recommend_model(hw)
    b = recommend_model(hw)
    assert a == b
    assert a["ollama_tag"] == "deepseek-r1:7b"


def test_missing_gpu_block_is_treated_as_zero_vram() -> None:
    rec = recommend_model({})
    assert rec["ollama_tag"] == "deepseek-r1:1.5b"
    assert rec["vram_gb"] == 0.0
