#!/usr/bin/env python3
"""Write services/model-lab/evidence/local-hardware.json (no PII)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from providers.hardware import write_hardware_evidence  # noqa: E402


def main() -> int:
    dest = write_hardware_evidence()
    print(f"wrote {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
