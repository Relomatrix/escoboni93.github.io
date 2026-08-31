"""Collect local hardware facts. No hostnames, usernames, or home paths."""

from __future__ import annotations

import json
import os
import platform
import shutil
import subprocess
from pathlib import Path
from typing import Any

LAB_ROOT = Path(__file__).resolve().parents[1]


def _run(cmd: list[str], timeout: int = 8) -> str | None:
    try:
        completed = subprocess.run(
            cmd,
            check=False,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if completed.returncode != 0:
        return None
    return completed.stdout.strip()


def _is_wsl2() -> bool:
    if os.environ.get("WSL_DISTRO_NAME"):
        return True
    if Path("/proc/sys/fs/binfmt_misc/WSLInterop").exists():
        return True
    version = Path("/proc/version")
    if version.exists():
        text = version.read_text(encoding="utf-8", errors="replace").lower()
        return "microsoft" in text or "wsl" in text
    return False


def _meminfo() -> dict[str, int]:
    path = Path("/proc/meminfo")
    result = {"total_kb": 0, "available_kb": 0, "free_kb": 0}
    if not path.exists():
        return result
    mapping = {
        "MemTotal:": "total_kb",
        "MemAvailable:": "available_kb",
        "MemFree:": "free_kb",
    }
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        for prefix, key in mapping.items():
            if line.startswith(prefix):
                parts = line.split()
                if len(parts) >= 2 and parts[1].isdigit():
                    result[key] = int(parts[1])
    return result


def _disk(mount: str = "/") -> dict[str, float]:
    usage = shutil.disk_usage(mount)
    return {
        "mount": mount,
        "total_gb": round(usage.total / (1024**3), 2),
        "available_gb": round(usage.free / (1024**3), 2),
    }


def _cpu_model() -> str | None:
    path = Path("/proc/cpuinfo")
    if path.exists():
        for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
            if line.lower().startswith("model name"):
                return line.split(":", 1)[1].strip()
    return platform.processor() or None


def sample_nvidia_smi() -> dict[str, Any]:
    if shutil.which("nvidia-smi") is None:
        return {
            "nvidia_smi_available": False,
            "devices": [],
            "total_vram_mb": 0,
            "free_vram_mb": 0,
            "driver_version": None,
            "raw_exit": "command_not_found",
        }
    query = _run(
        [
            "nvidia-smi",
            "--query-gpu=name,memory.total,memory.free,driver_version",
            "--format=csv,noheader,nounits",
        ]
    )
    devices: list[dict[str, Any]] = []
    if query:
        for line in query.splitlines():
            parts = [p.strip() for p in line.split(",")]
            if len(parts) < 4:
                continue
            try:
                total_mb = int(float(parts[1]))
                free_mb = int(float(parts[2]))
            except ValueError:
                continue
            devices.append(
                {
                    "name": parts[0],
                    "total_vram_mb": total_mb,
                    "free_vram_mb": free_mb,
                    "driver_version": parts[3],
                }
            )
    driver = devices[0]["driver_version"] if devices else None
    return {
        "nvidia_smi_available": True,
        "devices": devices,
        "total_vram_mb": max((d["total_vram_mb"] for d in devices), default=0),
        "free_vram_mb": max((d["free_vram_mb"] for d in devices), default=0),
        "driver_version": driver,
        "raw_exit": "ok" if devices else "empty_query",
    }


def _os_pretty() -> str | None:
    os_release = Path("/etc/os-release")
    if os_release.exists():
        for line in os_release.read_text(encoding="utf-8", errors="replace").splitlines():
            if line.startswith("PRETTY_NAME="):
                return line.split("=", 1)[1].strip().strip('"')
    return None


def collect_hardware() -> dict[str, Any]:
    mem = _meminfo()
    gpu = sample_nvidia_smi()
    wsl2 = _is_wsl2()
    python_version = platform.python_version()
    git_version = None
    git_out = _run(["git", "--version"])
    if git_out:
        git_version = git_out.replace("git version", "").strip()

    snapshot = {
        "schema": "model-lab.local-hardware.v1",
        "captured_at_utc": __import__("datetime").datetime.now(
            __import__("datetime").timezone.utc
        ).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "os": {
            "system": platform.system(),
            "release": platform.release(),
            "machine": platform.machine(),
            "distro": _os_pretty(),
            "wsl2": wsl2,
            "execution_environment": "wsl2" if wsl2 else "linux",
        },
        "cpu": {
            "model": _cpu_model(),
            "logical_cores": os.cpu_count() or 0,
        },
        "memory": {
            "total_mb": round(mem["total_kb"] / 1024),
            "available_mb": round(mem["available_kb"] / 1024),
            "free_mb": round(mem["free_kb"] / 1024),
        },
        "disk": _disk("/"),
        "gpu": gpu,
        "software": {
            "python": python_version,
            "git": git_version,
        },
        "notes": [],
    }
    if not gpu["nvidia_smi_available"] or not gpu["devices"]:
        snapshot["notes"].append(
            "No NVIDIA GPU reported. nvidia-smi is unavailable or returned no devices."
        )
    if not wsl2:
        snapshot["notes"].append("Not running inside WSL2.")
    snapshot["notes"].append(
        "Snapshot omits machine identity, account names, home directories, and public network addresses."
    )
    return snapshot


def write_hardware_evidence(path: Path | None = None) -> Path:
    dest = path or (LAB_ROOT / "evidence" / "local-hardware.json")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(collect_hardware(), indent=2) + "\n", encoding="utf-8")
    return dest
