---
name: api-contract
description: Use for API_ROUTES, API.* callers, n8n transport, legacy wrappers, webhook mode/action, raw bodies, or response contracts. Do not use for page-only styling or n8n workflow editing when no workflow source exists here.
---

Load `docs/API.md` and `docs/generated/api-routes.json`, then inspect `system/api.js` and `system/n8n.js`. Preserve method, mode, action, raw-body, contract-version, and caller behavior. Prefer read-only verification; require explicit approval before mutating production webhook checks.
