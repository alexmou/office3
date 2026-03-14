# Integration Contracts

Frontend contract owner:
- `system/api.js`

Transport helpers:
- `system/n8n.js` resolves `prod` vs `test` webhook URLs and wraps fetch calls

Ownership matrix:
- `system/n8n-service-workflow-map.json` is the machine-friendly lookup
- `.memory_bank/service-workflow-matrix.md` is the human-readable audit view

Current contract shape:
- route definitions live in `API_ROUTES`
- some calls use `GET`, some `POST`
- some routes still use `rawBody`
- contract versioning is explicit via `API_CONTRACT_VERSION`

Important compatibility notes:
- contract v1 still exists for part of the app
- contract v2 aims at plain query params for GET and `{ action, token, payload }`-style envelopes for POST
- legacy wrappers such as `data={ query: ... }` still appear in runtime code and workflows
- the same business surface may mix `prod` and `test` webhooks depending on route

Documentation rule:
- if a route changes service name, request shape, response shape, or webhook ownership, update this file and `system/n8n-service-workflow-map.json` if needed
- if a route is added, removed, remapped, or switched between `auto` and `n8n`, update `.memory_bank/service-workflow-matrix.md` in the same task
