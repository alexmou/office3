---
name: api-contract
description: Use for API_ROUTES, API.* callers, n8n transport, legacy wrappers, webhook mode/action, raw bodies, or frontend request/response expectations. Do not use for page-only styling or routine n8n instance administration.
---

Load `docs/API.md` and `docs/generated/api-routes.json`, then inspect `system/api.js` and `system/n8n.js`. Preserve method, mode, action, raw-body, contract-version, and caller behavior. Distinguish frontend-observed shapes from unverified backend behavior. If the user explicitly asks for n8n instance/artifact work, route to the configured n8n MCP instructions; do not infer remote workflows from this repository. Require explicit approval before mutating production checks.
