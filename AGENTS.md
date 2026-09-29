# Button Rouge agent context

This is a static browser SPA. The active runtime entrypoint is `index.html`; boot order and loader ownership are documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Do not assume paths from historical notes: verify source paths and refresh [docs/generated/](docs/generated/) when page or API structure changes.

Load focused context by task:
- Page work: `.agents/skills/frontend-page/SKILL.md`, then [docs/PAGES.md](docs/PAGES.md).
- Checkout or pricing work: `.agents/skills/sale-checkout/SKILL.md`, then [docs/SALE_FLOW.md](docs/SALE_FLOW.md) and [docs/DATA_MODEL.md](docs/DATA_MODEL.md).
- API or transport work: `.agents/skills/api-contract/SKILL.md`, then [docs/API.md](docs/API.md).
- Production or security-sensitive work: `.agents/skills/production-change/SKILL.md`, then [docs/SECURITY.md](docs/SECURITY.md) and [docs/OPERATIONS.md](docs/OPERATIONS.md).
- Verification: `.agents/skills/code-change-verification/SKILL.md`, then [docs/TESTING.md](docs/TESTING.md).
- Documentation maintenance: `.agents/skills/documentation-sync/SKILL.md`.

Repository rules:
- Keep application behavior unchanged for documentation-only tasks.
- Never put secrets in browser configuration or git. The tracked `.vscode/settings.json` currently contains a credential-shaped `n8n.apiKey`; do not print or reuse it.
- Do not make live mutating webhook requests without explicit approval.
- This repository contains no `workflows/`, `test/`, `index/`, `budget2/`, `charts/`, `n8nac-config.json`, or `system/n8n-service-workflow-map.json`; do not document or edit them as local sources.
- No n8n workflow-editing skill is defined here because no workflow source is present.
