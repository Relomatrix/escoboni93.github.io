from __future__ import annotations

import pytest

from providers.model_selection import assert_tag_allowed, recommend_model, vram_gb_from_hardware


def _hw(vram_mb: int) -> dict:
    return {"gpu": {"total_vram_mb": vram_mb, "devices": [{"total_vram_mb": vram_mb}]}}


def test_no_gpu_selects_1_5b() -> None:
    rec = recommend_model({"gpu": {"nvidia_smi_available": False, "devices": [], "total_vram_mb": 0}})
    assert rec["ollama_tag"] == "deepseek-r1:1.5b"
    assert rec["tier"] == "tiny"
    assert rec["auto_pull_671b"] is False


def test_six_gb_selects_1_5b() -> None:
    rec = recommend_model(_hw(6 * 1024))
    assert rec["ollama_tag"] == "deepseek-r1:1.5b"


def test_seven_gb_selects_7b() -> None:
    rec = recommend_model(_hw(7 * 1024))
    assert rec["ollama_tag"] == "deepseek-r1:7b"
    assert rec["tier"] == "small"


def test_ten_gb_selects_7b() -> None:
    rec = recommend_model(_hw(10 * 1024))
    assert rec["ollama_tag"] == "deepseek-r1:7b"
    assert rec["tier"] == "small"


def test_eleven_to_fifteen_stays_on_7b_baseline() -> None:
    rec = recommend_model(_hw(12 * 1024))
    assert rec["ollama_tag"] == "deepseek-r1:7b"
    assert rec["tier"] == "mid"
    assert "deepseek-r1:14b" in rec["may_evaluate_later"]
    assert rec["auto_pull_14b"] is False


def test_sixteen_gb_does_not_auto_pull_14b() -> None:
    rec = recommend_model(_hw(16 * 1024))
    assert rec["ollama_tag"] == "deepseek-r1:7b"
    assert rec["tier"] == "high"
    assert rec["auto_pull_14b"] is False
    assert rec["auto_pull_32b"] is False


def test_never_auto_selects_forbidden_sizes() -> None:
    rec = recommend_model(_hw(80 * 1024))
    assert rec["ollama_tag"] not in {"deepseek-r1:32b", "deepseek-r1:70b", "deepseek-r1:671b"}


def test_forbidden_tag_rejected() -> None:
    with pytest.raises(ValueError):
        assert_tag_allowed("deepseek-r1:671b")
    with pytest.raises(ValueError):
        assert_tag_allowed("deepseek-r1:32b")


def test_vram_conversion() -> None:
    assert vram_gb_from_hardware(None) == 0.0
    assert vram_gb_from_hardware(_hw(8192)) == 8.0
