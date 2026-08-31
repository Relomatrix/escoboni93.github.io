#!/usr/bin/env bash
# Pull only the hardware-selected DeepSeek tag. Never 32B/70B/671B.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PYTHONPATH="${ROOT}${PYTHONPATH:+:${PYTHONPATH}}"
TAG="$(python3 - <<'PY'
from providers.hardware import collect_hardware
from providers.model_selection import recommend_model, assert_tag_allowed
rec = recommend_model(collect_hardware())
print(assert_tag_allowed(rec["ollama_tag"]))
PY
)"

echo "selected tag: ${TAG}"
echo "pulling a single model; this may take several minutes"
ollama pull "${TAG}"
ollama --version
ollama list
