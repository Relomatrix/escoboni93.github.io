"""Structured Model Lab errors. Messages must stay operational (no prompt bodies)."""


class ModelLabError(Exception):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(f"{code}: {message}")

    def to_dict(self) -> dict[str, str]:
        return {"code": self.code, "message": self.message}


class ProviderTimeoutError(ModelLabError):
    def __init__(self, message: str = "provider request timed out") -> None:
        super().__init__("provider_timeout", message)


class ProviderUnreachableError(ModelLabError):
    def __init__(self, message: str = "provider endpoint is unreachable") -> None:
        super().__init__("provider_unreachable", message)


class ProviderMalformedResponseError(ModelLabError):
    def __init__(self, message: str = "provider returned a malformed response") -> None:
        super().__init__("provider_malformed_response", message)


class ProviderHttpError(ModelLabError):
    def __init__(self, status_code: int, message: str = "provider HTTP error") -> None:
        self.status_code = status_code
        super().__init__("provider_http_error", f"{message} (status={status_code})")


class UnsafeBindError(ModelLabError):
    def __init__(self, message: str = "refusing non-localhost bind or endpoint") -> None:
        super().__init__("unsafe_bind", message)
