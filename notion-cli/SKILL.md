---
name: notion-cli
description: Manage Notion pages, databases, and tasks via Python Notion API client. Use when the user asks to add pages, search databases, query Notion content, or interact with Notion in any way.
---

# Notion CLI

Manage Notion pages and databases via Python `notion-client` library.

## Requirements

### Primary: notion-client (Official SDK)
```bash
pip install notion-client
export NOTION_API_KEY="your_integration_token"
```

Get your token: https://www.notion.so/my-integrations

### Alternative: ultimate-notion
```bash
pip install ultimate-notion
```

### CLI Option: notionshell
```bash
pip install git+https://github.com/talwrii/notionshell.git
```

## Common Commands

### Using Python notion-client (Primary)

```python
from notion_client import Client

client = Client(auth=os.environ["NOTION_API_KEY"])

# Search pages/databases
result = client.search(query="keyword")

# Get page content
page = client.pages.retrieve(page_id="page-id")
blocks = client.blocks.children.list(block_id="page-id")

# Create pages
new_page = client.pages.create(
    parent={"database_id": "database-id"},
    properties={"title": {"title": [{"text": "Page Title"}]}}
)

# Append blocks (add content)
client.blocks.children.append(
    block_id="page-id",
    children=[{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Text"}}]}}]
)

# Update pages
client.pages.update(
    page_id="page-id",
    properties={"Status": {"select": {"name": "Done"}}}
)

# Query databases
database = client.databases.query(database_id="database-id")
```

### Quick Bash One-liners

```bash
# Search
python3 -c 'from notion_client import Client; c=Client(); print(c.search(query="keyword"))'

# Get page
python3 -c 'from notion_client import Client; c=Client(); print(c.pages.retrieve("page-id"))'
```

## Quick Examples

```python
from notion_client import Client
import os

client = Client(auth=os.environ["NOTION_API_KEY"])

# Find pages
results = client.search(query="Project Alpha")

# Create a new page in a database
new_page = client.pages.create(
    parent={"database_id": "database-id"},
    properties={
        "Name": {"title": [{"text": "Review PR #123"}]},
        "Status": {"select": {"name": "Todo"}},
        "Priority": {"select": {"name": "High"}}
    }
)

# Append content to a page (with batch processing)
blocks = [
    {
        "type": "heading_2",
        "heading_2": {"rich_text": [{"type": "text", "text": {"content": "Notes"}}]}
    },
    {
        "type": "bulleted_list_item",
        "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Item 1"}}]}
    },
    {
        "type": "bulleted_list_item",
        "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Item 2"}}]}
    }
]

# Process in batches of 100 (Notion API limit)
for i in range(0, len(blocks), 100):
    batch = blocks[i:i+100]
    client.blocks.children.append(
        block_id="page-id",
        children=batch
    )

# Query database with filter
database = client.databases.query(
    database_id="database-id",
    filter={
        "property": "Date",
        "date": {"equals": "2025-02-05"}
    }
)
```

## Bash One-liner Examples

```bash
# Search
python3 -c 'from notion_client import Client; c=Client(); print(c.search(query="Project"))'

# Add page
python3 -c 'from notion_client import Client; c=Client(); c.pages.create(parent={"database_id": "db-id"}, properties={"title": {"title": [{"text": "New Page"}]}})'
```

## Database Query Filters

| Filter Type | Example |
|-------------|---------|
| Text | `property=Name=value=MyTask` |
| Select | `property=Status=value=Todo` |
| Date | `property=Date=value=today` |
| Checkbox | `property=Done=value=true` |
| Multi-select | `property=Tags=value=Urgent` |

## Setup Integration

1. Go to https://www.notion.so/my-integrations
2. Create new integration → Copy token
3. Share pages/databases with the integration
4. Set `NOTION_API_KEY` environment variable
5. Run `notion-shell list` to test

---

## ⚠️ Important API Constraints (Learned from Practice)

### Block Type Naming (Critical)
Notion API is strict about block type names. Use **exact** type names:

| Incorrect | Correct |
|-----------|---------|
| `bullet_list_item` | `bulleted_list_item` |
| `number_list_item` | `numbered_list_item` |

### Rich Text Structure
```python
# ❌ WRONG - annotations as direct property
{
    "type": "text",
    "text": {"content": "Bold text"},
    "annotations": {"bold": True}  # This causes API error
}

# ✅ CORRECT - annotations inside text object
{
    "type": "text",
    "text": {
        "content": "Bold text",
        "annotations": {"bold": True}  # Annotations here
    }
}
```

### Batch Processing Limit
- Notion API allows **max 100 blocks per request**
- Always split large content into batches:

```python
for i in range(0, len(blocks), 100):
    batch = blocks[i:i+100]
    client.blocks.children.append(block_id=page_id, children=batch)
```

### Recommended Workflow
1. **Plan content in Markdown** - Easier to write and review
2. **Convert to Notion API format** - Use correct block types
3. **Batch into chunks of 100** - Prevent API errors
4. **Handle errors gracefully** - Notion error messages are specific and helpful
5. **Style in Notion UI** - Let Notion handle formatting instead of complex API calls

### Common Block Types Reference
```python
# Headings
{"type": "heading_1", "heading_1": {"rich_text": [{"type": "text", "text": {"content": "Title"}}]}}
{"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": "Subtitle"}}]}}
{"type": "heading_3", "heading_3": {"rich_text": [{"type": "text", "text": {"content": "Section"}}]}}

# Lists
{"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": "Item"}}]}}
{"type": "numbered_list_item", "numbered_list_item": {"rich_text": [{"type": "text", "text": {"content": "Item"}}]}}

# Basic
{"type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Text"}}]}}
{"type": "divider", "divider": {}}

# Toggle
{"type": "toggle", "toggle": {"rich_text": [{"type": "text", "text": {"content": "Click to expand"}}]}}
```

### Error Handling
Notion API errors are **very specific** - read them carefully:

```
body.children[10].type should be "bulleted_list_item" instead of "bullet_list_item"
```

This tells you exactly:
- Which block has the error (index 10)
- What the correct value should be
- Fix and retry
