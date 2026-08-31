from __future__ import annotations

import pytest

from providers.json_extract import extract_json_object, is_success_status, looks_italian
from providers.reasoning import strip_hidden_reasoning


def test_extracts_plain_object() -> None:
    assert extract_json_object('{"status": "ok", "result": 391}')["result"] == 391


def test_extracts_fenced_and_strips_think() -> None:
    text = "<think>hidden plan</think>\n```json\n{\"status\": \"success\", \"result\": 391}\n```"
    parsed = extract_json_object(text)
    assert parsed["result"] == 391
    assert "hidden plan" not in strip_hidden_reasoning(text)


def test_extracts_embedded_object() -> None:
    parsed = extract_json_object("Sure.\n{\"cannot_determine\": true, \"reason\": \"need more facts\"}\n")
    assert parsed["cannot_determine"] is True


def test_rejects_empty_and_non_object() -> None:
    with pytest.raises(ValueError):
        extract_json_object("")
    with pytest.raises(ValueError):
        extract_json_object("[1, 2]")


def test_success_status_aliases() -> None:
    assert is_success_status("ok")
    assert is_success_status("SUCCESS")
    assert is_success_status("pass")
    assert not is_success_status("fail")


def test_italian_smoke_markers() -> None:
    assert looks_italian("La residenza fiscale è il paese in cui una persona è considerata residente.")
    assert not looks_italian("This is only English text about apples.")
