# Operations

This repository contains the browser frontend, not n8n workflow source or deployment configuration. `system/n8n.js` defaults to production webhook mode and a configured public base URL; runtime configuration can override these values. Do not infer live backend state from frontend configuration.

## Pure local validation

Run `node --check` on changed JavaScript, `node --test tools/generate-docs.test.mjs`, and `node tools/generate-docs.mjs --check` as relevant. Documentation-only changes do not require application-code checks or a documentation diff for ordinary feature work.

## Local browser smoke test

Serve the repository root over HTTP, for example `python3 -m http.server 8123`, then open `http://127.0.0.1:8123/index.html`. The SPA uses `fetch()` for header and page loading; do not use `file://` for a browser smoke test. Keep the test local and avoid submitting business data.

## Read-only integration verification

Use only when the task requires it and the user has authorized the integration check. Prefer read-only n8n MCP discovery/inspection when available. Do not infer workflow ownership from generated frontend inventories, and do not expose credential values.

## Mutating production operations

Explicit user approval is required before live writes, publication, deployment, service restarts, or production data changes. This includes sales, budget, warehouse, schedule, supplier-payment, and user-administration endpoints. `tools/publish_n8n_workflow.mjs` is hazardous legacy tooling; it directly modifies the n8n SQLite database, changes workflow activation, restarts `n8n.service`, and probes webhooks. Never run it automatically. Do not invoke webhook-check scripts as part of static documentation validation.
