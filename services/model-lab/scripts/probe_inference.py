#!/usr/bin/env python3
"""Timed local inference probe. Operational metrics only. No prompt/response text."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from providers.contract import ChatMessage, CompletionRequest  # noqa: E402
from providers.hardware import collect_hardware, sample_nvidia_smi  # noqa: E402
from providers.ollama_deepseek import OllamaDeepSeekProvider  # noqa: E402


def _run(cmd: list[str]) -> str:
    try:
        completed = subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=10)
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return (completed.stdout or "").strip()


def _mem_mb() -> dict[str, int]:
    hw = collect_hardware()
    return hw["memory"]


def stream_ttft(provider: OllamaDeepSeekProvider) -> dict[str, object]:
    """Measure time-to-first-token via Ollama streaming. Does not persist tokens."""
    import json as _json
    from urllib.request import Request, urlopen

    payload = {
        "model": provider.model,
        "messages": [{"role": "user", "content": "Reply with the single word READY."}],
        "stream": True,
        "think": False,
        "options": {"temperature": 0.0, "num_predict": 16},
    }
    request = Request(
        f"{provider.base_url}/api/chat",
        data=_json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/x-ndjson"},
        method="POST",
    )
    started = time.perf_counter()
    first_token_ms = None
    chunks = 0
    with urlopen(request, timeout=provider.timeout_s) as response:
        for raw in response:
            chunks += 1
            if first_token_ms is None:
                first_token_ms = int((time.perf_counter() - started) * 1000)
            # Discard payload content immediately.
            _ = raw
    return {
        "time_to_first_token_ms": first_token_ms,
        "stream_chunks": chunks,
        "total_stream_ms": int((time.perf_counter() - started) * 1000),
    }


def main() -> int:
    os.environ.setdefault("OLLAMA_HOST", "127.0.0.1:11434")
    provider = OllamaDeepSeekProvider(timeout_s=300)
    health = provider.health()
    gpu_before = sample_nvidia_smi()
    mem_before = _mem_mb()
    ps_before = _run(["ollama", "ps"])

    complete = provider.complete(
        CompletionRequest(
            messages=[ChatMessage(role="user", content="Reply with the single word READY.")],
            temperature=0.0,
            max_tokens=16,
        )
    )
    ttft = stream_ttft(provider)
    gpu_after = sample_nvidia_smi()
    mem_after = _mem_mb()
    ps_after = _run(["ollama", "ps"])

    processor = "cpu"
    if "100% GPU" in ps_after:
        processor = "gpu"
    elif "GPU" in ps_after and "CPU" in ps_after:
        processor = "mixed-offload"
    elif "CPU" in ps_after:
        processor = "cpu"

    payload = {
        "schema": "model-lab.inference-probe.v1",
        "captured_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "model": complete.model,
        "health_ok": health.ok,
        "health_detail": health.detail,
        "quantization": "Q4_K_M",
        "latency_ms": complete.latency_ms,
        "input_tokens": complete.input_tokens,
        "output_tokens": complete.output_tokens,
        "tokens_per_sec": (complete.metadata or {}).get("tokens_per_sec"),
        "finish_reason": complete.finish_reason,
        "time_to_first_token_ms": ttft["time_to_first_token_ms"],
        "stream_chunks": ttft["stream_chunks"],
        "processor": processor,
        "ollama_ps_processor_hint": "see processor field; raw table omitted if it could include paths",
        "ollama_ps_has_gpu": "GPU" in ps_after,
        "ollama_ps_has_cpu": "CPU" in ps_after,
        "gpu_before": gpu_before,
        "gpu_after": gpu_after,
        "ram_before_mb": mem_before,
        "ram_after_mb": mem_after,
        "visible_content_chars": len(complete.content),
        "ps_before_lines": len(ps_before.splitlines()),
        "ps_after_lines": len(ps_after.splitlines()),
        "notes": [
            "Prompt and completion text are not stored.",
            "No NVIDIA GPU was required for this probe to run.",
        ],
    }
    dest = ROOT / "evidence" / "local-inference-probe.json"
    dest.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, indent=2))
    return 0 if health.ok and complete.content else 1


if __name__ == "__main__":
    raise SystemExit(main())
