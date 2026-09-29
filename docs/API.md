# API

The machine-readable inventory is [generated/api-routes.json](generated/api-routes.json), generated from `system/api.js`. It contains all 53 current `API_ROUTES` entries and, for each route, service, method, source, webhook mode, webhook action, raw-body flag, and source callers.

## Contract

`API.*` methods are generated from `API_ROUTES` and call `requestViaN8nOrMock`. Contract v1 is the current default: GET requests may include `data={query: payload}` and ordinary POST requests send the service payload. Contract v2 sends `{ action, token, payload }`; raw-body routes preserve their body shape. Route configuration can also be merged from runtime `CONFIG.API_ROUTES`.

`source: "n8n"` means the frontend selects n8n transport; `source: "auto"` is legacy/automatic behavior and has no local workflow ownership. `webhookMode` is `prod` or `test`; `webhookAction` is the transport endpoint suffix when declared. `rawBody` means the route sends the supplied body without the ordinary wrapper.

## Caller classes

Preferred callers use `API.<service>()`. Legacy callers construct `{ googleFuncName, params }` and pass through `runGSfunction` or `runGSfunctionPromise`; current examples include cash register, salary, catalog barcode/newsale lookup, statistics scratch UI, and sale submission. `requestViaN8nOrMock` is the shared transport used by generated API methods. Direct `fetch` also exists for runtime page HTML, auth fallbacks, and Amelie payment endpoints.

The route inventory intentionally does not claim workflow ownership. No workflow source or workflow map is present in this repository.

## Change rule

When an API route changes, update the source first, regenerate JSON, inspect callers in the generated record, and run the checks in `docs/TESTING.md`. Read-only verification is preferred; mutating webhook checks require explicit approval.
