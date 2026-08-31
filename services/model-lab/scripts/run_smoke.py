#!/usr/bin/env python3
"""Run EVAL_ONLY smoke cases A/B/C. Writes operational metrics only."""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from eval.runner import load_cases, run_cases  # noqa: E402
from providers.hardware import collect_hardware, sample_nvidia_smi  # noqa: E402
from providers.model_selection import recommend_model  # noqa: E402
from providers.ollama_deepseek import OllamaDeepSeekProvider  # noqa: E402


def _ollama_ps() -> str:
    try:
        completed = subprocess.run(
            ["ollama", "ps"],
            check=False,
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return completed.stdout or ""


def main() -> int:
    hardware = collect_hardware()
    recommendation = recommend_model(hardware)
    provider = OllamaDeepSeekProvider(model=recommendation["ollama_tag"])
    health = provider.health()
    gpu_before = sample_nvidia_smi()
    cases = [c for c in load_cases() if c["id"].startswith(("A_", "B_", "C_"))]
    results = run_cases(provider, cases, max_tokens=512)
    gpu_after = sample_nvidia_smi()
    acceleration = "none"
    if gpu_before.get("nvidia_smi_available") and gpu_before.get("devices"):
        used = (gpu_after.get("total_vram_mb") or 0) - (gpu_after.get("free_vram_mb") or 0)
        acceleration = "gpu" if used > 256 else "unknown"
    else:
        acceleration = "cpu"
    ps_text = _ollama_ps()
    processor = "cpu"
    if "CPU/GPU" in ps_text or ("CPU" in ps_text and "GPU" in ps_text):
        processor = "mixed-offload"
    elif "100% GPU" in ps_text:
        processor = "gpu"
    elif "CPU" in ps_text:
        processor = "cpu"
    smoke = {
        "schema": "model-lab.local-deepseek-smoke.v1",
        "mark": "EVAL_ONLY",
        "captured_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "selected_model": recommendation,
        "health": {
            "ok": health.ok,
            "detail": health.detail,
            "model_present": health.model_present,
            "endpoint": health.endpoint,
        },
        "results": results,
        "acceleration": {
            "mode": acceleration,
            "ollama_processor": processor,
            "ollama_ps_mentions_gpu": "GPU" in ps_text,
            "ollama_ps_mentions_cpu": "CPU" in ps_text,
            "gpu_before": gpu_before,
            "gpu_after": gpu_after,
            "peak_vram_used_mb_observed": (
                (gpu_after.get("total_vram_mb") or 0) - (gpu_after.get("free_vram_mb") or 0)
                if gpu_after.get("nvidia_smi_available")
                else None
            ),
        },
        "gates": {
            "JSON_SMOKE": next((r["passed"] for r in results["cases"] if r["case_id"] == "A_basic_math_json"), False),
            "MULTILINGUAL_SMOKE": next((r["passed"] for r in results["cases"] if r["case_id"] == "B_multilingual_it"), False),
            "MISSING_INFO_SMOKE": next((r["passed"] for r in results["cases"] if r["case_id"] == "C_missing_info"), False),
        },
        "notes": [
            "Evidence stores operational metrics only. Prompts and model outputs are not persisted.",
            "Multilingual smoke does not score legal correctness.",
        ],
    }
    dest = ROOT / "evidence" / "local-deepseek-smoke.json"
    dest.write_text(json.dumps(smoke, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {dest}")
    return 0 if all(smoke["gates"].values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())
