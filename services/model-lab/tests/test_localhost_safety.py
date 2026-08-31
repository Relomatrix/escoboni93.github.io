from __future__ import annotations

import pytest

from providers.errors import UnsafeBindError
from providers.localhost import assert_dev_bind_host, assert_localhost_endpoint, is_localhost_host
from providers.ollama_deepseek import OllamaDeepSeekProvider


def test_localhost_hosts_accepted() -> None:
    assert is_localhost_host("127.0.0.1")
    assert is_localhost_host("localhost")
    assert is_localhost_host("::1")
    assert_localhost_endpoint("http://127.0.0.1:11434")
    assert_dev_bind_host("127.0.0.1")


def test_public_and_wildcard_hosts_rejected() -> None:
    with pytest.raises(UnsafeBindError):
        assert_localhost_endpoint("http://0.0.0.0:11434")
    with pytest.raises(UnsafeBindError):
        assert_localhost_endpoint("http://192.168.1.20:11434")
    with pytest.raises(UnsafeBindError):
        assert_dev_bind_host("0.0.0.0")
    with pytest.raises(UnsafeBindError):
        assert_dev_bind_host("::")


def test_provider_rejects_non_local_base_url() -> None:
    with pytest.raises(UnsafeBindError):
        OllamaDeepSeekProvider(base_url="http://8.8.8.8:11434")
    with pytest.raises(UnsafeBindError):
        OllamaDeepSeekProvider(base_url="http://0.0.0.0:11434")


def test_provider_accepts_localhost_default() -> None:
    provider = OllamaDeepSeekProvider(base_url="http://127.0.0.1:11434")
    meta = provider.metadata()
    assert meta.localhost_only is True
    assert meta.development_only is True
    assert meta.provider == "local_ollama"
