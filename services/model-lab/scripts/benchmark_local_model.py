#!/usr/bin/env python3
"""Frozen EVAL_ONLY benchmark. Do not train on these cases later."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from eval.runner import load_cases, run_cases  # noqa: E402
from providers.hardware import collect_hardware  # noqa: E402
from providers.model_selection import recommend_model  # noqa: E402
from providers.ollama_deepseek import OllamaDeepSeekProvider  # noqa: E402


def main() -> int:
    hardware = collect_hardware()
    recommendation = recommend_model(hardware)
    provider = OllamaDeepSeekProvider(model=recommendation["ollama_tag"])
    cases = load_cases()
    results = run_cases(provider, cases, max_tokens=512)
    payload = {
        "schema": "model-lab.benchmark-baseline.v1",
        "mark": "EVAL_ONLY",
        "do_not_train": True,
        "captured_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "selected_model": recommendation,
        "provider": provider.metadata().__dict__,
        "results": results,
        "notes": [
            "EVAL_ONLY baseline. Do not train, fine-tune, or distill on these cases.",
            "Operational metrics only. No prompts or completions stored.",
        ],
    }
    dest = ROOT / "evidence" / "benchmark-baseline.json"
    dest.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {dest}")
    print(
        json.dumps(
            {
                "valid_json_rate": results["valid_json_rate"],
                "latency_ms_avg": results["latency_ms_avg"],
                "tokens_per_sec_avg": results["tokens_per_sec_avg"],
                "malformed_response_count": results["malformed_response_count"],
                "timeout_count": results["timeout_count"],
                "required_field_compliance_rate": results["required_field_compliance_rate"],
                "pass_count": results["pass_count"],
                "case_count": results["case_count"],
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
