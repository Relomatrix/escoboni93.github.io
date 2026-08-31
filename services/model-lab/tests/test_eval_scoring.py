from __future__ import annotations

import json
from pathlib import Path

from providers.eval_score import score_case

CASES = json.loads(
    (Path(__file__).resolve().parents[1] / "eval" / "cases.json").read_text(encoding="utf-8")
)
BY_ID = {c["id"]: c for c in CASES["cases"]}


def test_cases_are_eval_only() -> None:
    assert CASES["mark"] == "EVAL_ONLY"
    assert CASES["do_not_train"] is True
    for case in CASES["cases"]:
        assert case["mark"] == "EVAL_ONLY"


def test_math_json_pass() -> None:
    row = score_case(BY_ID["A_basic_math_json"], '{"status":"ok","result":391}')
    assert row["passed"] is True


def test_math_json_wrong_result_fails() -> None:
    row = score_case(BY_ID["A_basic_math_json"], '{"status":"ok","result":390}')
    assert row["passed"] is False
    assert row["result_ok"] is False


def test_required_keys_are_case_insensitive() -> None:
    row = score_case(BY_ID["A_basic_math_json"], '{"Status":"ok","Result":391}')
    assert row["passed"] is True


def test_missing_info_requires_cannot_determine_and_gaps() -> None:
    good = score_case(
        BY_ID["C_missing_info"],
        json.dumps(
            {
                "jurisdiction": [],
                "missing_information": ["destination country", "employment status", "length of stay"],
                "cannot_determine": True,
                "reason": "destination and stay facts were not provided",
            }
        ),
    )
    assert good["passed"] is True
    invented = score_case(
        BY_ID["C_missing_info"],
        json.dumps(
            {
                "jurisdiction": ["Spain"],
                "missing_information": [],
                "cannot_determine": False,
                "reason": "assumed Spain",
            }
        ),
    )
    assert invented["passed"] is False
    assert invented["invented_destination"] is True


def test_italian_language_smoke() -> None:
    row = score_case(
        BY_ID["B_multilingual_it"],
        "La residenza fiscale è il luogo in cui una persona è considerata residente ai fini fiscali.",
    )
    assert row["passed"] is True
    assert row["italian_smoke_ok"] is True
