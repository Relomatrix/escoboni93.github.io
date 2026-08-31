# Model Lab security notes (Phase 1)

## Localhost only

Ollama and the development bridge must listen on loopback:

- `127.0.0.1`
- `localhost`
- `::1`

They must **not** bind `0.0.0.0`, `::`, or a LAN/public address.

The provider constructor and the bridge refuse non-localhost endpoints. The
helper `scripts/start_ollama_localhost.sh` refuses an unsafe `OLLAMA_HOST`.
`scripts/verify_localhost.py` inspects `/proc/net/tcp` for listeners on
`11434` and `8077`.

Do not add firewall holes. Do not put this stack behind a public URL.
There is no authentication suitable for Internet exposure.

## What local inference does and does not mean

Running DeepSeek on this machine **improves data control**:

- prompts are not sent to OpenAI or Anthropic
- weights stay in the local Ollama store
- the HTTP API is loopback-only by default

It does **not** automatically mean "100% privacy":

- the OS, hypervisor, backups, and disk encryption still apply
- Ollama model blobs live on the local filesystem
- a misconfigured bind (`0.0.0.0`) would expose the API on the network
- logs, crash dumps, and swap can still retain fragments if misused
- this lab never claims legal-grade confidentiality by itself

## Logging policy

Allowed: provider name, model tag, latency, token counts, finish reason,
HTTP path, error codes.

Forbidden in logs and evidence:

- full prompts
- document bodies
- completions
- chain-of-thought / `<think>` content
- customer data or PII

Hidden reasoning is stripped in `providers/reasoning.py` and is not written
to evidence JSON.

## Secrets and data

- No API keys are required for local Ollama
- Do not commit `.env`, tokens, or credentials
- Do not copy production source packs or customer prompts into `eval/`
- Smoke prompts are synthetic and generic
- Model weights must never be committed (see `.gitignore`)

## Production isolation

This lab is not imported by checkout, Stripe, Relomatrix customer routes,
Render services, or Supabase schema. It can be removed by deleting
`services/model-lab/`.
