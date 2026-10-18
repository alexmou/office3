# Testing and verification

Choose checks for the changed surface. There is no application test suite or local workflow source; do not run every check for every task.

## Documentation and generated inventories

```sh
node --check tools/generate-docs.mjs
node --check tools/generate-docs.test.mjs
node --test tools/generate-docs.test.mjs
node tools/generate-docs.mjs --check
```

`node tools/generate-docs.mjs` explicitly writes generated JSON and is not part of the test runner. The native Node.js suite imports a read-only builder; it checks relative Markdown links, current `PAGE_CONFIG` coverage, generated local source references, page initializers/assets/services, commented route filtering, unresolved-call classification, fixtures, and deterministic equality with checked-in output. Temporary fixtures are created outside the repository and removed after each test. The suite makes no production requests and writes no repository files.

## Application source and browser

Run `node --check` on changed JavaScript and direct dependencies. For page/runtime changes, serve the repository over HTTP and smoke only the affected page; `file://` does not support the runtime's fetch-based loading. For checkout or financial changes, verify the invariants in [SALE_FLOW.md](SALE_FLOW.md) with focused regression tests or a local fixture when available. Do not claim a regression test passed if no executable test exists.

## Read-only integration checks

Backend contracts and live state are not verified by local source checks. Use n8n MCP read-only discovery/inspection only when the task requires it and the user authorizes access. Never treat a local syntax or inventory check as backend verification.

## Mutating production checks

Get explicit approval before sending a request that can change production data or state, including sales, budget, warehouse, schedule, supplier-payment, or user-administration writes. Publication, deployment, service restart, and direct production database changes also require approval. Static documentation work must not invoke live webhook probes.
