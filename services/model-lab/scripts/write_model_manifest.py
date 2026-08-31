#!/usr/bin/env python3
"""Record selected DeepSeek model provenance. Does not rewrite license text."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from providers.hardware import collect_hardware  # noqa: E402
from providers.model_selection import recommend_model  # noqa: E402

# Static upstream facts from official DeepSeek / Hugging Face / Ollama pages.
# License text is not copied. SPDX identifiers and source URLs only.
UPSTREAM = {
    "deepseek-r1:1.5b": {
        "selected_model_name": "DeepSeek-R1-Distill-Qwen-1.5B",
        "ollama_tag": "deepseek-r1:1.5b",
        "upstream_repository": "https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
        "upstream_model_identifier": "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
        "ollama_library": "https://ollama.com/library/deepseek-r1:1.5b",
        "model_license_spdx": "MIT",
        "base_series_license_spdx": "Apache-2.0",
        "base_distilled_architecture": "Qwen2.5 distilled with DeepSeek-R1 reasoning data",
        "created_by_relomatrix": False,
        "license_notes": [
            "Model weights are licensed under MIT according to DeepSeek and Ollama library pages.",
            "Qwen distilled models are derived from the Qwen-2.5 series (Apache-2.0) and fine-tuned with DeepSeek-R1 samples.",
            "Relomatrix did not create this model.",
        ],
        "citation": "DeepSeek-AI, DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning, arXiv:2501.12948",
    },
    "deepseek-r1:7b": {
        "selected_model_name": "DeepSeek-R1-Distill-Qwen-7B",
        "ollama_tag": "deepseek-r1:7b",
        "upstream_repository": "https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
        "upstream_model_identifier": "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
        "ollama_library": "https://ollama.com/library/deepseek-r1:7b",
        "model_license_spdx": "MIT",
        "base_series_license_spdx": "Apache-2.0",
        "base_distilled_architecture": "Qwen2.5 distilled with DeepSeek-R1 reasoning data",
        "created_by_relomatrix": False,
        "license_notes": [
            "Model weights are licensed under MIT according to DeepSeek and Ollama library pages.",
            "Qwen distilled models are derived from the Qwen-2.5 series (Apache-2.0) and fine-tuned with DeepSeek-R1 samples.",
            "Relomatrix did not create this model.",
        ],
        "citation": "DeepSeek-AI, DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning, arXiv:2501.12948",
    },
}


def _ollama_show(tag: str) -> dict[str, object]:
    if shutil.which("ollama") is None:
        return {"available": False}
    try:
        completed = subprocess.run(
            ["ollama", "show", tag],
            check=False,
            capture_output=True,
            text=True,
            timeout=30,
        )
    except (OSError, subprocess.TimeoutExpired):
        return {"available": False}
    listed = subprocess.run(
        ["ollama", "list"],
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    digest = None
    if listed.returncode == 0:
        for line in listed.stdout.splitlines():
            if tag.split(":")[0] in line.lower() or tag in line:
                parts = line.split()
                if len(parts) >= 2:
                    digest = parts[1]
                    break
    return {
        "available": completed.returncode == 0,
        "show_exit_code": completed.returncode,
        "digest_or_id": digest,
        "show_lines": completed.stdout.count("\n") if completed.stdout else 0,
    }


def main() -> int:
    hardware = collect_hardware()
    recommendation = recommend_model(hardware)
    tag = recommendation["ollama_tag"]
    static = UPSTREAM.get(tag, {"ollama_tag": tag, "created_by_relomatrix": False})
    runtime = _ollama_show(tag)
    payload = {
        "schema": "model-lab.base-model-manifest.v1",
        "retrieval_date_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "selection": recommendation,
        **static,
        "runtime": runtime,
        "relomatrix_created_the_model": False,
    }
    dest = ROOT / "evidence" / "base-model-manifest.json"
    dest.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
