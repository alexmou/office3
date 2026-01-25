# AGENTS.md

Quick context for Codex (keep short; load this first).

- Entry point: `index/index.html` loads `system/system.js`, `system/pageConfig.js`, `system/app.js`.
- SPA loader: `system/app.js` + `window.PAGE_CONFIG` from `system/pageConfig.js`.
- API client: `system/api.js` + `system/n8n.js` (n8n webhooks, prod/test).
- Shared tables: `shared/class_TableUI.js` (TableData + TableUI).
- No build step; serve from repo root via a simple HTTP server.

See also: `AGENTS.arch.md`, `AGENTS.pages.md`.
