# AGENTS.arch.md

Architecture summary.

Canonical architecture notes live in `local/README.md` and `.memory_bank/frontend-architecture.md`.

- Static SPA with page HTML/JS/CSS loaded via `fetch()` (see `system/app.js`).
- Auth token is passed via URL query and kept in `window.token`.
- Config comes from `API.getConfig()` and is stored in `window.CONFIG`.
- Store context is resolved via `API.getStores()` and `fetchUserStoreFromToken()`.
- Data access is routed through `system/api.js` (n8n webhooks, legacy contract v1/v2).
