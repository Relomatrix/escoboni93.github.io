# Model Lab — Phase 1 local DeepSeek

Isolated development lab for running an open-source DeepSeek model locally
through Ollama. It is **not** wired into Relomatrix production, checkout,
Stripe, customer routes, or Render.

This tree can be deleted without changing Relomatrix behaviour.

## What this phase is

- Prove a **local** DeepSeek runtime on this machine
- Expose a **provider-neutral** `LLMProvider` contract
- Offer a **localhost-only** OpenAI-compatible development bridge
- Collect **operational** evidence (hardware, smoke, benchmark, license)

## What this phase is not

Do **not** (later phases):

- fine-tune, QLoRA, or merge adapters
- generate synthetic legal training data
- connect DeepSeek to customer traffic
- replace the production LLM
- deploy an inference server
- open Ollama to the network
- train on source-bound or client data

Eval cases under `eval/` are marked **EVAL_ONLY**. Do not train on them.

## Safety

- Default Ollama URL: `http://127.0.0.1:11434`
- Development bridge: `http://127.0.0.1:8077`
- Both refuse `0.0.0.0` / public binds
- Hidden reasoning (`<think>`) is stripped and never persisted
- Logs record operational metadata only (model, latency, token counts)
- Model weights and Hugging Face / Ollama caches are gitignored

Local inference improves **data control**. It does **not** automatically mean
"100% privacy". See [SECURITY.md](SECURITY.md).

## Hardware policy (conservative)

| VRAM | Selected Ollama tag |
| --- | --- |
| missing / ≤ 6 GB | `deepseek-r1:1.5b` |
| 7–10 GB | `deepseek-r1:7b` (quantized Ollama tag) |
| 11–15 GB | `deepseek-r1:7b` baseline; 14B only later |
| ≥ 16 GB | `deepseek-r1:7b` baseline; 14B only after that passes |

Never auto-pull 32B, 70B, or the full 671B R1 model.

## Commands (localhost)

Prefer WSL2 on a Windows laptop. This lab also runs on native Linux.

```bash
# 1) Hardware snapshot (no PII)
python3 services/model-lab/scripts/collect_hardware.py

# 2) Start Ollama on localhost only
export OLLAMA_HOST=127.0.0.1:11434
bash services/model-lab/scripts/start_ollama_localhost.sh

# 3) Pull only the policy-selected model
bash services/model-lab/scripts/pull_selected_model.sh

# 4) Direct Ollama check
ollama run deepseek-r1:1.5b "Return only JSON: {\"status\":\"ok\"}"

# 5) Development bridge (localhost)
python3 services/model-lab/scripts/local_server.py

# 6) Query the bridge
curl -sS http://127.0.0.1:8077/health
curl -sS http://127.0.0.1:8077/metadata
curl -sS http://127.0.0.1:8077/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"deepseek-r1:1.5b","messages":[{"role":"user","content":"Return only JSON with keys status and result. What is 17 * 23?"}],"response_format":{"type":"json_object"}}'

# 7) Smoke + benchmark (writes evidence metrics only)
python3 services/model-lab/scripts/run_smoke.py
python3 services/model-lab/scripts/benchmark_local_model.py
python3 services/model-lab/scripts/write_model_manifest.py
python3 services/model-lab/scripts/verify_localhost.py

# 8) Unit tests
pip install -r services/model-lab/requirements-dev.txt
pytest services/model-lab

# 9) Stop Ollama
# If started in the foreground: Ctrl+C
# If a user-level service was installed:
#   systemctl --user stop ollama   # or: sudo systemctl stop ollama
```

The development bridge **MUST NOT** be exposed to the Internet.

## Layout

```
services/model-lab/
  README.md
  SECURITY.md
  config/
  evidence/          # operational metrics only
  scripts/
  eval/              # EVAL_ONLY — do not train
  providers/         # LLMProvider + OllamaDeepSeekProvider
  tests/
```

## Removability

Delete `services/model-lab/` and the Model Lab entries in the root `.gitignore`.
Nothing else in this repository imports this package.
