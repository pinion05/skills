#!/usr/bin/env python3
"""Append a timestamped entry to the daily memory log."""

from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path


def resolve_log_dir() -> Path:
    brains = Path.home() / "Brains" / "brain"
    if brains.exists():
        return brains / "daily-memory"
    return Path.home() / ".codex" / "daily-memory"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True, help="Entry text")
    ap.add_argument("--tags", default="", help="Comma-separated tags")
    args = ap.parse_args()

    now = datetime.now()
    log_dir = resolve_log_dir()
    log_dir.mkdir(parents=True, exist_ok=True)

    day_path = log_dir / f"{now:%Y-%m-%d}.md"

    ts = now.strftime("%H:%M")
    tags = [t.strip() for t in args.tags.split(",") if t.strip()]
    tag_str = "" if not tags else " " + " ".join(f"#{t}" for t in tags)

    entry = f"- {ts} {args.text}{tag_str}\n"

    if not day_path.exists():
        day_path.write_text(f"# {now:%Y-%m-%d}\n\n")

    with day_path.open("a", encoding="utf-8") as f:
        f.write(entry)

    print(str(day_path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
