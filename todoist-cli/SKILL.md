---
name: todoist-cli
description: Manage Todoist tasks via the `todoist` CLI. Use when the user asks to add tasks, complete tasks, list today's tasks, search tasks, manage projects/labels/sections, or interact with Todoist in any way.
---

# Todoist CLI

Manage tasks via the `todoist` command.

## Requirements

Install from: https://github.com/buddyh/todoist-cli

```bash
brew install buddyh/tap/todoist
# or
go install github.com/buddyh/todoist-cli/cmd/todoist@latest
```

## Commands

```bash
# Tasks
todoist                              # Today's tasks
todoist tasks --all                  # All tasks
todoist tasks --filter "p1"          # High priority
todoist tasks --filter "overdue"     # Overdue
todoist tasks -p Work                # By project

# Add tasks
todoist add "Task name"
todoist add "Task" -d tomorrow -P 1  # With due date and priority
todoist add "Task" -p Work -l urgent # With project and label

# Manage tasks
todoist complete <id>                # Complete task
todoist done <id>                    # Alias for complete
todoist delete <id>                  # Delete task
todoist update <id> --due "monday"   # Update due date
todoist update <id> -P 2             # Update priority
todoist view <id>                    # View task details
todoist search "keyword"             # Search tasks
todoist reopen <id>                  # Reopen completed task

# Move tasks (Kanban)
todoist move <id> --section "In Progress"
todoist move <id> --project "Work"

# Projects, labels, sections
todoist projects                     # List projects
todoist projects add "New Project"   # Create project
todoist labels                       # List labels
todoist labels add urgent --color red
todoist sections -p Work             # List sections

# Comments
todoist comment <id>                 # View comments
todoist comment <id> "Note"          # Add comment

# Completed tasks
todoist completed                    # Recently completed
todoist completed --since 2024-01-01
```

## JSON Output

All commands support `--json`:

```bash
todoist tasks --json
todoist tasks --json | jq '.[] | .content'
```

## Priority Mapping

| Flag | Todoist |
|------|---------|
| `-P 1` | p1 (highest) |
| `-P 2` | p2 |
| `-P 3` | p3 |
| `-P 4` | p4 (lowest) |
