---
name: daily-memory
description: Use when you completed any task and need to log what was done with timestamps for future audit/review.
---

# Daily Memory

## Goal

Maintain a lightweight daily work log (timestamped) so completed work is searchable and attributable.

## Default Log Location

- Primary: `~/Brains/brain/daily-memory/YYYY-MM-DD.md` (if `~/Brains/brain/` exists)
- Fallback: `~/.codex/daily-memory/YYYY-MM-DD.md`

## How To Log

Use the script to append an entry to today's file:

```bash
python3 scripts/log.py --text "Did X" [--tags "tag1,tag2"]
```

The script will:

1. Choose the log directory (primary if available)
2. Create the daily file if missing
3. Append a timestamped bullet
