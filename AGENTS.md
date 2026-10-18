# Button Rouge agent context

## Project
Button Rouge is a static browser SPA. `index.html` is the runtime entrypoint; vanilla JavaScript loads page HTML, CSS, and JavaScript dynamically and initializes pages through `registerPageInit`. Existing third-party libraries are loaded from configured local or external assets. The frontend calls n8n webhooks; those workflows and Grist-backed data workflows are not source-controlled in this repository. There is no local build pipeline.

Use [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for verified runtime boundaries. Use [docs/generated/context-index.json](docs/generated/context-index.json) only as a navigation aid; verify behavior in active source.

## Change Workflow
For every development task:
1. Identify the relevant domain.
2. Load only its skill and required documentation.
3. Inspect the implementation and direct dependencies.
4. Identify behavior and contracts that must remain unchanged.
5. Make the smallest correct change; avoid unrelated refactoring.
6. Run the narrowest relevant verification.
7. Inspect the final diff.
8. Report changes, checks, and remaining risks.

Make a short implementation plan before nontrivial changes. Do not require documentation-only diffs for ordinary code tasks.

## Task Routing
- Page/runtime work: [.agents/skills/frontend-page/SKILL.md](.agents/skills/frontend-page/SKILL.md), [docs/PAGES.md](docs/PAGES.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Checkout/pricing work: [.agents/skills/sale-checkout/SKILL.md](.agents/skills/sale-checkout/SKILL.md), [docs/SALE_FLOW.md](docs/SALE_FLOW.md), [docs/DATA_MODEL.md](docs/DATA_MODEL.md).
- Frontend API/transport work: [.agents/skills/api-contract/SKILL.md](.agents/skills/api-contract/SKILL.md), [docs/API.md](docs/API.md).
- Production/security-sensitive work: [.agents/skills/production-change/SKILL.md](.agents/skills/production-change/SKILL.md), [docs/SECURITY.md](docs/SECURITY.md), [docs/OPERATIONS.md](docs/OPERATIONS.md).
- Verification: [.agents/skills/code-change-verification/SKILL.md](.agents/skills/code-change-verification/SKILL.md), [docs/TESTING.md](docs/TESTING.md).
- Documentation maintenance: [.agents/skills/documentation-sync/SKILL.md](.agents/skills/documentation-sync/SKILL.md).
- Explicit n8n instance/artifact work: use the configured n8n MCP server and its task-specific instructions. Before creating or modifying an n8n artifact, read user preferences first, distinguish a first-class Agent from a workflow, then follow the matching reference, schema discovery, validation, and approval requirements. Do not use MCP for routine frontend/API work or treat this repository as workflow source.
- UX/UI, CSS/layout, accessibility, responsive behavior, or visual polish: use Impeccable only if its installation is verified. Do not invoke it for backend, pricing, API transport, or generic JavaScript debugging; do not run `/impeccable init` on every task. Use [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md).

## Business Invariants
Preserve sale source fields; cart and draft restoration; username/store propagation; currency and payment-method consistency; item `finalPrice` and `finalPriceVND`; basket totals and rounding; API request/response shapes; authentication/authorization boundaries; async navigation and page initialization; and persisted data formats. Changes to financial formulas, rounding, data structures, or external contracts require explicit task scope and focused regression checks.

## Safety
- Never print, copy, use, or commit credentials. A tracked credential-shaped `n8n.apiKey` is documented in [docs/SECURITY.md](docs/SECURITY.md); rotation remains an owner action.
- Do not make live mutating webhook requests, publish workflows, deploy, restart services, or modify production data without explicit approval.
- `tools/publish_n8n_workflow.mjs` is hazardous legacy tooling: it reads local n8n credentials, writes the n8n SQLite database, changes activation state, restarts `n8n.service`, and probes webhooks. Never execute it automatically.
- This repository has no local `workflows/`, `test/`, `index/`, `budget2/`, `charts/`, `n8nac-config.json`, or workflow ownership map. Historical documents never override source or canonical docs.

## Efficiency
Search symbols before opening large files; read the smallest useful source set; load only the relevant skill; do not reread unchanged files; prefer focused patches; and keep implementation reports brief and factual.
