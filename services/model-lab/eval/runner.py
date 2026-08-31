"""Shared EVAL_ONLY case execution. Stores operational metrics only."""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

from providers.contract import ChatMessage, CompletionRequest
from providers.errors import ProviderTimeoutError
from providers.eval_score import score_case
from providers.ollama_deepseek import OllamaDeepSeekProvider

LAB_ROOT = Path(__file__).resolve().parents[1]
CASES_PATH = LAB_ROOT / "eval" / "cases.json"


def load_cases(suite: str | None = None) -> list[dict[str, Any]]:
    payload = json.loads(CASES_PATH.read_text(encoding="utf-8"))
    cases = list(payload.get("cases") or [])
    if suite:
        cases = [c for c in cases if c.get("suite") == suite or suite == "all"]
    return cases


def run_cases(
    provider: OllamaDeepSeekProvider,
    cases: list[dict[str, Any]],
    *,
    max_tokens: int = 1024,
) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    for case in cases:
        timed_out = False
        content = ""
        latency_ms = None
        input_tokens = None
        output_tokens = None
        tokens_per_sec = None
        finish_reason = None
        error_code = None
        started = time.perf_counter()
        try:
            result = provider.complete(
                CompletionRequest(
                    messages=[ChatMessage(role="user", content=case["prompt"])],
                    temperature=0.0,
                    max_tokens=max_tokens,
                    json_mode=bool(case.get("json_mode")),
                )
            )
            content = result.content
            latency_ms = result.latency_ms
            input_tokens = result.input_tokens
            output_tokens = result.output_tokens
            tokens_per_sec = (result.metadata or {}).get("tokens_per_sec")
            finish_reason = result.finish_reason
        except ProviderTimeoutError:
            timed_out = True
            latency_ms = int((time.perf_counter() - started) * 1000)
            error_code = "provider_timeout"
        except Exception as exc:  # operational code only
            error_code = getattr(exc, "code", type(exc).__name__)
            latency_ms = int((time.perf_counter() - started) * 1000)
        score = score_case(case, content, timed_out)
        score.update(
            {
                "latency_ms": latency_ms,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "tokens_per_sec": tokens_per_sec,
                "finish_reason": finish_reason,
                "error_code": error_code,
            }
        )
        rows.append(score)

    json_rows = [r for r in rows if r.get("suite") != "language"]
    valid_json_rows = [r for r in rows if r.get("valid_json")]
    latencies = [r["latency_ms"] for r in rows if isinstance(r.get("latency_ms"), int)]
    tps = [r["tokens_per_sec"] for r in rows if isinstance(r.get("tokens_per_sec"), (int, float))]
    return {
        "mark": "EVAL_ONLY",
        "do_not_train": True,
        "case_count": len(rows),
        "pass_count": sum(1 for r in rows if r["passed"]),
        "valid_json_rate": (len(valid_json_rows) / max(1, sum(1 for r in rows if r.get("malformed") or r.get("valid_json")))),
        "malformed_response_count": sum(1 for r in rows if r.get("malformed")),
        "timeout_count": sum(1 for r in rows if r.get("timed_out")),
        "required_field_compliance_rate": (
            sum(1 for r in rows if r.get("required_fields_ok")) / max(1, len(rows))
        ),
        "missing_information_detection_rate": (
            sum(1 for r in rows if r.get("missing_information_ok") or "missing_information_ok" not in r)
            / max(1, len(rows))
        ),
        "latency_ms_avg": round(sum(latencies) / len(latencies), 1) if latencies else None,
        "tokens_per_sec_avg": round(sum(tps) / len(tps), 3) if tps else None,
        "cases": rows,
        "json_scored_case_count": len(json_rows),
    }
