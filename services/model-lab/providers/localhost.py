"""Localhost-only bind and endpoint policy for the development stack."""

from __future__ import annotations

from urllib.parse import urlparse

from providers.errors import UnsafeBindError

ALLOWED_HOSTS = frozenset({"127.0.0.1", "localhost", "::1"})
BLOCKED_WILDCARD_HOSTS = frozenset({"0.0.0.0", "::", "[::]", "*"})


def hostname_of(url_or_host: str) -> str:
    raw = (url_or_host or "").strip()
    if not raw:
        raise UnsafeBindError("empty host")
    if "://" not in raw:
        # host or host:port
        host = raw.split("%")[0].strip("[]")
        if host.count(":") == 1 and not host.startswith(":"):
            host = host.rsplit(":", 1)[0]
        return host.lower()
    parsed = urlparse(raw)
    host = (parsed.hostname or "").lower()
    if not host:
        raise UnsafeBindError("URL has no hostname")
    return host


def is_localhost_host(host: str) -> bool:
    return host.lower() in ALLOWED_HOSTS


def assert_localhost_endpoint(url: str, *, what: str = "endpoint") -> str:
    host = hostname_of(url)
    if host in BLOCKED_WILDCARD_HOSTS or not is_localhost_host(host):
        raise UnsafeBindError(
            f"refusing non-localhost {what} {host!r}; Model Lab is localhost-only"
        )
    return host


def assert_dev_bind_host(host: str) -> str:
    normalized = (host or "").strip().lower().strip("[]")
    if normalized in BLOCKED_WILDCARD_HOSTS or normalized not in ALLOWED_HOSTS:
        raise UnsafeBindError(
            f"refusing to bind development server to {host!r}; localhost only"
        )
    return host
