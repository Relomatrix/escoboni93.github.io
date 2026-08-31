"""Score EVAL_ONLY cases from already-visible text. No prompt logging."""

from __future__ import annotations

import json
from typing import Any

from providers.json_extract import extract_json_object, is_success_status, looks_italian
from providers.reasoning import strip_hidden_reasoning

INVENTED_DESTINATION_MARKERS = (
    "united states",
    "usa",
    "spain",
    "france",
    "germany",
    "italy",
    "portugal",
    "uae",
    "dubai",
    "singapore",
    "switzerland",
    "united kingdom",
    "canada",
    "australia",
)


def score_case(case: dict[str, Any], content: str, timed_out: bool = False) -> dict[str, Any]:
    expect = case.get("expect") or {}
    visible = strip_hidden_reasoning(content)
    parsed: dict[str, Any] | None = None
    malformed = False
    valid_json = False
    if expect.get("valid_json") or case.get("json_mode"):
        try:
            parsed = extract_json_object(visible)
            valid_json = True
        except ValueError:
            malformed = True
            valid_json = False

    required_ok = True
    for key in expect.get("required_keys") or []:
        if not parsed or key not in parsed:
            required_ok = False

    result_ok = True
    if "result_equals" in expect:
        result_ok = bool(parsed and parsed.get("result") == expect["result_equals"])

    status_ok = True
    if expect.get("status_indicates_success"):
        status_ok = bool(parsed and is_success_status(parsed.get("status")))

    cannot_determine_ok = True
    if "cannot_determine" in expect:
        cannot_determine_ok = bool(parsed and parsed.get("cannot_determine") is expect["cannot_determine"])

    missing_ok = True
    if expect.get("missing_information_nonempty"):
        missing = (parsed or {}).get("missing_information")
        missing_ok = isinstance(missing, list) and len(missing) > 0

    invented = False
    if expect.get("must_not_invent_destination"):
        blob = json.dumps(parsed, ensure_ascii=False).lower() if parsed else visible.lower()
        invented = any(marker in blob for marker in INVENTED_DESTINATION_MARKERS)
        jurisdiction = (parsed or {}).get("jurisdiction") if parsed else None
        if isinstance(jurisdiction, list) and len(jurisdiction) > 0:
            invented = True

    italian_ok = True
    if expect.get("language_smoke") == "it":
        italian_ok = looks_italian(visible)

    passed = (
        not timed_out
        and (not expect.get("valid_json") or valid_json)
        and required_ok
        and result_ok
        and status_ok
        and cannot_determine_ok
        and missing_ok
        and not invented
        and italian_ok
    )
    return {
        "case_id": case["id"],
        "suite": case.get("suite"),
        "mark": "EVAL_ONLY",
        "passed": passed,
        "timed_out": timed_out,
        "valid_json": valid_json,
        "malformed": malformed,
        "required_fields_ok": required_ok,
        "result_ok": result_ok,
        "status_ok": status_ok,
        "cannot_determine_ok": cannot_determine_ok,
        "missing_information_ok": missing_ok,
        "invented_destination": invented,
        "italian_smoke_ok": italian_ok,
        "visible_chars": len(visible),
    }
