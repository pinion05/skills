---
name: browseros-cdp-web
description: 'Browser automation via BrowserOS when it already holds tabs/cookies/login state: logged-in web apps, dashboards, webmail, scraping.'
disable-model-invocation: true
---

# BrowserOS CDP Web Workflow

## Overview

Ordinary web work here should reuse the running `BrowserOS` session.

Attach `agent-browser` to `BrowserOS` over CDP so existing tabs, cookies, and logged-in state remain available. Use a separate browser only when `BrowserOS` is unavailable or the user explicitly wants isolation.

Stay in the current `BrowserOS` window. Prefer the current tab first, then a new tab in the same window. Do not open a new window for routine work unless the user explicitly asks for one.

## When to Use

Use this skill for:

- websites already tied to the user's session
- logged-in tools like mail, dashboards, and admin pages
- clicking, filling, searching, scraping, or screenshotting pages
- testing a web app in the browser the user is already using

Do not use it when:

- `BrowserOS` is not running or its CDP endpoint is unreachable
- the user explicitly wants an isolated or disposable browser
- the task needs iOS or another provider-specific `agent-browser` mode

## Quick Reference

```bash
ps aux | rg "BrowserOS|browseros_server"
curl -s http://127.0.0.1:9016/json/version
agent-browser --cdp 9016 tab
agent-browser --cdp 9016 open https://example.com
agent-browser --cdp 9016 snapshot -i
agent-browser --cdp 9016 get text body
agent-browser --cdp 9016 screenshot --full
```

## Workflow

1. Find the `BrowserOS` CDP endpoint. Common signal: `browseros_server --cdp-port=9016`
2. Inspect the existing session first.

```bash
agent-browser --cdp 9016 tab
curl -s http://127.0.0.1:9016/json/list
```

3. Reuse that session in the same window. Prefer the current tab if it already matches the task. Otherwise open a new tab, not a new window.

```bash
agent-browser --cdp 9016 tab
agent-browser --cdp 9016 tab new https://example.com
agent-browser --cdp 9016 open https://example.com
agent-browser --cdp 9016 wait --load networkidle
```

4. Interact, then re-snapshot after page changes.

```bash
agent-browser --cdp 9016 snapshot -i
agent-browser --cdp 9016 click @e1
agent-browser --cdp 9016 fill @e2 "text"
agent-browser --cdp 9016 wait --load networkidle
agent-browser --cdp 9016 snapshot -i
```

5. Read or capture only what the user asked for.

```bash
agent-browser --cdp 9016 get title
agent-browser --cdp 9016 get url
agent-browser --cdp 9016 get text body
agent-browser --cdp 9016 screenshot --full
```

If `agent-browser connect 9016` says no page exists, create one with `agent-browser --cdp 9016 open <url>` first.

## Common Mistakes

- Picking a separate Chrome session when `BrowserOS` is already available
- Opening a new BrowserOS window when the task only needs the current tab or a same-window new tab
- Opening a fresh tab before checking whether the target page is already logged in
- Reusing stale refs after navigation instead of running `snapshot -i` again
- Echoing full private page contents when a short summary would satisfy the request

## Fallback

Use generic `agent-browser` only when `BrowserOS` cannot be reused or the user clearly asks for isolation. Say briefly why fallback was necessary.
