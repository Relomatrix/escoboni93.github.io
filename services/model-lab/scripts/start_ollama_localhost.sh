#!/usr/bin/env bash
# Start Ollama bound to localhost only. Do not expose this service.
set -euo pipefail

HOST="${OLLAMA_HOST:-127.0.0.1:11434}"

case "${HOST}" in
  0.0.0.0*|\[::\]*|:::* )
    echo "refusing OLLAMA_HOST=${HOST}: must be localhost only" >&2
    exit 2
    ;;
  127.0.0.1*|localhost*|\[::1\]*|::1* )
    ;;
  * )
    echo "refusing OLLAMA_HOST=${HOST}: Model Lab requires 127.0.0.1" >&2
    exit 2
    ;;
esac

export OLLAMA_HOST="${HOST}"
echo "starting ollama on ${OLLAMA_HOST} (localhost only)"
echo "WARNING: do not expose Ollama to the Internet"
exec ollama serve
