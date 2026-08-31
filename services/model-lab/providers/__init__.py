"""Isolated Model Lab provider package. Not wired into production Relomatrix."""

from providers.contract import (
    ChatMessage,
    CompletionRequest,
    CompletionResponse,
    HealthStatus,
    LLMProvider,
    ProviderMetadata,
)
from providers.errors import (
    ModelLabError,
    ProviderHttpError,
    ProviderMalformedResponseError,
    ProviderTimeoutError,
    ProviderUnreachableError,
    UnsafeBindError,
)
from providers.ollama_deepseek import OllamaDeepSeekProvider

__all__ = [
    "ChatMessage",
    "CompletionRequest",
    "CompletionResponse",
    "HealthStatus",
    "LLMProvider",
    "ModelLabError",
    "OllamaDeepSeekProvider",
    "ProviderHttpError",
    "ProviderMalformedResponseError",
    "ProviderMetadata",
    "ProviderTimeoutError",
    "ProviderUnreachableError",
    "UnsafeBindError",
]
