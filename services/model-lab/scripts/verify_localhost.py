#!/usr/bin/env python3
"""Confirm Ollama / Model Lab listeners are localhost-only."""

from __future__ import annotations

import json
import socket
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from providers.localhost import is_localhost_host  # noqa: E402


def _hex_ip_port(chunk: str) -> tuple[str, int] | None:
    if ":" not in chunk:
        return None
    ip_hex, port_hex = chunk.split(":")
    try:
        port = int(port_hex, 16)
        raw = int(ip_hex, 16)
    except ValueError:
        return None
    if len(ip_hex) == 8:
        ip = socket.inet_ntoa(raw.to_bytes(4, "little"))
        return ip, port
    return None


def listening_on(ports: set[int]) -> list[dict[str, object]]:
    found: list[dict[str, object]] = []
    tcp = Path("/proc/net/tcp")
    if not tcp.exists():
        return found
    lines = tcp.read_text(encoding="utf-8", errors="replace").splitlines()[1:]
    for line in lines:
        parts = line.split()
        if len(parts) < 4:
            continue
        parsed = _hex_ip_port(parts[1])
        if not parsed:
            continue
        ip, port = parsed
        if port in ports:
            found.append({"ip": ip, "port": port, "localhost_only": is_localhost_host(ip)})
    return found


def main() -> int:
    ports = {11434, 8077}
    listeners = listening_on(ports)
    public = [row for row in listeners if not row["localhost_only"]]
    report = {
        "listeners": listeners,
        "public_bind_count": len(public),
        "localhost_only": len(public) == 0,
    }
    print(json.dumps(report, indent=2))
    return 1 if public else 0


if __name__ == "__main__":
    raise SystemExit(main())
