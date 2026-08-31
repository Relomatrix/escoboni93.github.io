"""Provider-neutral internal contract.

Relomatrix can later swap OpenAI / Anthropic / local DeepSeek / cloud DeepSeek
without changing business logic. This module is isolated under Model Lab and
is not imported by production routes.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping, Protocol, Sequence


@dataclass(frozen=True)
class ChatMessage:
    role: str
    content: str


@dataclass(frozen=True)
class CompletionRequest:
    messages: Sequence[ChatMessage]
    temperature: float = 0.0
    max_tokens: int = 1024
    json_mode: bool = False


@dataclass(frozen=True)
class CompletionResponse:
    content: str
    provider: str
    model: str
    latency_ms: int
    input_tokens: int | None
    output_tokens: int | None
    finish_reason: str
    metadata: Mapping[str, Any] = field(default_factory=dict)

    def safe_metadata(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "model": self.model,
            "latency_ms": self.latency_ms,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "finish_reason": self.finish_reason,
        }


@dataclass(frozen=True)
class HealthStatus:
    ok: bool
    provider: str
    endpoint: str
    detail: str
    latency_ms: int | None = None
    model_present: bool | None = None


@dataclass(frozen=True)
class ProviderMetadata:
    provider: str
    model: str
    endpoint: str
    runtime: str
    localhost_only: bool
    development_only: bool


class LLMProvider(Protocol):
    def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Return visible completion text only. Never expose chain-of-thought."""

    def health(self) -> HealthStatus:
        """Operational liveness. Must not log request bodies."""

    def metadata(self) -> ProviderMetadata:
        """Safe static/runtime metadata."""
