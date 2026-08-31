"""Local Ollama DeepSeek provider. Calls localhost only. No retry storm."""

from __future__ import annotations

import json
import os
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from providers.contract import (
    CompletionRequest,
    CompletionResponse,
    HealthStatus,
    ProviderMetadata,
)
from providers.errors import (
    ProviderHttpError,
    ProviderMalformedResponseError,
    ProviderTimeoutError,
    ProviderUnreachableError,
)
from providers.localhost import assert_localhost_endpoint, hostname_of
from providers.logging_policy import operational_logger, safe_event
from providers.reasoning import strip_hidden_reasoning

DEFAULT_BASE_URL = "http://127.0.0.1:11434"
DEFAULT_MODEL = "deepseek-r1:1.5b"
DEFAULT_TIMEOUT_S = 180.0
PROVIDER_ID = "local_ollama"

_LOG = operational_logger("model_lab.ollama")


class OllamaDeepSeekProvider:
    def __init__(
        self,
        base_url: str | None = None,
        model: str | None = None,
        timeout_s: float | None = None,
    ) -> None:
        raw_url = (
            base_url
            or os.environ.get("OLLAMA_BASE_URL")
            or os.environ.get("OLLAMA_HOST")
            or DEFAULT_BASE_URL
        )
        if "://" not in raw_url:
            raw_url = f"http://{raw_url}"
        self.base_url = raw_url.rstrip("/")
        self.endpoint_host = assert_localhost_endpoint(self.base_url, what="Ollama URL")
        self.model = model or os.environ.get("MODEL_LAB_OLLAMA_MODEL") or DEFAULT_MODEL
        self.timeout_s = float(
            timeout_s
            if timeout_s is not None
            else os.environ.get("MODEL_LAB_TIMEOUT_S") or DEFAULT_TIMEOUT_S
        )

    def metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            provider=PROVIDER_ID,
            model=self.model,
            endpoint=self.base_url,
            runtime="ollama",
            localhost_only=True,
            development_only=True,
        )

    def health(self) -> HealthStatus:
        started = time.perf_counter()
        try:
            version_payload = self._request_json("GET", "/api/version")
            tags_payload = self._request_json("GET", "/api/tags")
        except (ProviderTimeoutError, ProviderUnreachableError, ProviderHttpError) as exc:
            safe_event(
                _LOG,
                "health_fail",
                provider=PROVIDER_ID,
                error_code=exc.code,
                endpoint_host=self.endpoint_host,
            )
            return HealthStatus(
                ok=False,
                provider=PROVIDER_ID,
                endpoint=self.base_url,
                detail=exc.code,
                latency_ms=int((time.perf_counter() - started) * 1000),
                model_present=False,
            )
        except ProviderMalformedResponseError as exc:
            return HealthStatus(
                ok=False,
                provider=PROVIDER_ID,
                endpoint=self.base_url,
                detail=exc.code,
                latency_ms=int((time.perf_counter() - started) * 1000),
                model_present=False,
            )

        names = _model_names(tags_payload)
        present = _model_is_present(self.model, names)
        latency_ms = int((time.perf_counter() - started) * 1000)
        version = version_payload.get("version") if isinstance(version_payload, dict) else None
        safe_event(
            _LOG,
            "health_ok",
            provider=PROVIDER_ID,
            model=self.model,
            ok=True,
            latency_ms=latency_ms,
            endpoint_host=self.endpoint_host,
        )
        return HealthStatus(
            ok=True,
            provider=PROVIDER_ID,
            endpoint=self.base_url,
            detail=f"ollama_version={version}; model_present={present}",
            latency_ms=latency_ms,
            model_present=present,
        )

    def complete(self, request: CompletionRequest) -> CompletionResponse:
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
            "stream": False,
            "think": False,
            "options": {
                "temperature": request.temperature,
                "num_predict": request.max_tokens,
            },
        }
        if request.json_schema:
            payload["format"] = dict(request.json_schema)
        elif request.json_mode:
            # Bare "json" is unreliable on small distilled models; a generic
            # object schema produces valid objects without changing prompts.
            payload["format"] = {"type": "object"}

        started = time.perf_counter()
        raw = self._request_json("POST", "/api/chat", payload)
        latency_ms = int((time.perf_counter() - started) * 1000)

        if not isinstance(raw, dict):
            raise ProviderMalformedResponseError("chat response is not an object")

        message = raw.get("message") or {}
        if not isinstance(message, dict):
            raise ProviderMalformedResponseError("chat message is not an object")

        visible = strip_hidden_reasoning(str(message.get("content") or ""))
        # Drop any separate thinking field without persisting it.
        _ = message.get("thinking")

        input_tokens = _as_int(raw.get("prompt_eval_count"))
        output_tokens = _as_int(raw.get("eval_count"))
        eval_duration_ns = _as_int(raw.get("eval_duration"))
        tokens_per_sec = None
        if output_tokens and eval_duration_ns and eval_duration_ns > 0:
            tokens_per_sec = round(output_tokens / (eval_duration_ns / 1_000_000_000), 3)

        finish = "stop" if raw.get("done") else "unknown"
        done_reason = raw.get("done_reason")
        if isinstance(done_reason, str) and done_reason:
            finish = done_reason

        safe_event(
            _LOG,
            "complete_ok",
            provider=PROVIDER_ID,
            model=str(raw.get("model") or self.model),
            latency_ms=latency_ms,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            finish_reason=finish,
            tokens_per_sec=tokens_per_sec,
            json_mode=request.json_mode,
            endpoint_host=self.endpoint_host,
        )
        return CompletionResponse(
            content=visible,
            provider=PROVIDER_ID,
            model=str(raw.get("model") or self.model),
            latency_ms=latency_ms,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            finish_reason=finish,
            metadata={
                "tokens_per_sec": tokens_per_sec,
                "eval_duration_ns": eval_duration_ns,
                "localhost_only": True,
                "hidden_reasoning_stripped": True,
            },
        )

    def _request_json(
        self,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
    ) -> Any:
        url = f"{self.base_url}{path}"
        data = None
        headers = {"Accept": "application/json"}
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"
        request = Request(url, data=data, headers=headers, method=method)
        try:
            with urlopen(request, timeout=self.timeout_s) as response:
                raw = response.read()
        except TimeoutError as exc:
            raise ProviderTimeoutError("Ollama request timed out") from exc
        except HTTPError as exc:
            # Read and discard body without logging it.
            try:
                exc.read()
            except Exception:
                pass
            raise ProviderHttpError(exc.code, "Ollama HTTP error") from exc
        except URLError as exc:
            reason = exc.reason
            if isinstance(reason, TimeoutError) or "timed out" in str(reason).lower():
                raise ProviderTimeoutError("Ollama request timed out") from exc
            raise ProviderUnreachableError("Ollama endpoint is unreachable") from exc
        except OSError as exc:
            raise ProviderUnreachableError("Ollama endpoint is unreachable") from exc

        if not raw:
            raise ProviderMalformedResponseError("empty response body")
        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ProviderMalformedResponseError("response is not valid JSON") from exc


def _as_int(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _model_names(tags_payload: Any) -> list[str]:
    if not isinstance(tags_payload, dict):
        return []
    models = tags_payload.get("models") or []
    names: list[str] = []
    if isinstance(models, list):
        for item in models:
            if isinstance(item, dict) and item.get("name"):
                names.append(str(item["name"]))
    return names


def _model_is_present(wanted: str, names: list[str]) -> bool:
    wanted_l = wanted.lower()
    for name in names:
        lowered = name.lower()
        if lowered == wanted_l or lowered.startswith(wanted_l + ":") or wanted_l.startswith(lowered):
            return True
    return False


def configured_base_url() -> str:
    raw = os.environ.get("OLLAMA_BASE_URL") or os.environ.get("OLLAMA_HOST") or DEFAULT_BASE_URL
    if "://" not in raw:
        raw = f"http://{raw}"
    assert_localhost_endpoint(raw)
    return raw.rstrip("/")


def configured_host() -> str:
    return hostname_of(configured_base_url())
