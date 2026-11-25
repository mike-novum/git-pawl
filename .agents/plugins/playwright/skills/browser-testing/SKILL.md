---
name: browser-testing
description: Guidelines and workflows for UI testing in the browser using Playwright MCP and Chrome DevTools MCP. Use when verifying web interfaces, capturing screenshots of app states, checking console errors, or validating user interactions.
---

# Browser Testing with Playwright & Chrome DevTools MCP

This skill outlines how to test application interfaces using the configured MCP servers: `playwright` and `chrome-devtools`.

## Prerequisites

1. Ensure the dev server or preview build is running (e.g. `npm run dev` or `npm run storybook`).
2. Make sure screenshots are saved to the `screenshots/` directory (never at project root).

## Common Playwright MCP Workflows

### 1. Navigating to the Interface
Use `playwright_navigate` to open the local development URL (e.g. `http://localhost:5173` or storybook URL):
```json
{
  "url": "http://localhost:5173"
}
```

### 2. Inspecting Page Elements & DOM
Use `playwright_snapshot` or element query tools to inspect rendered elements, accessibility tree, and available selectors.

### 3. Taking Screenshots
Capture visual state into the `screenshots/` folder:
```json
{
  "name": "screenshots/main-dashboard.png"
}
```

### 4. Interacting with Elements
- `playwright_click`: Click buttons, dropdowns, navigation links.
- `playwright_fill`: Input values into form fields and inputs.
- `playwright_press_key`: Trigger keyboard navigation (Enter, Tab, Escape).

### 5. Inspecting Console Logs & Errors
Review browser console messages using `playwright_console_logs` or Chrome DevTools MCP to confirm there are no unhandled JavaScript exceptions or React errors.
