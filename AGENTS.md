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

Для фронт-разработки используй следующий skill:
The Skill: impeccable
The skill installs as one command:

/impeccable <command> <target>
Start every new project with:

/impeccable init
init inspects the project, asks only for material gaps in durable product truth, and writes PRODUCT.md. Visitor mode and visual direction are chosen later for each surface; incumbent or newly built visual systems are recorded separately in DESIGN.md.

24 Commands
All commands are accessed through /impeccable:

Command	What it does
/impeccable craft	Full shape-then-build flow with visual iteration
/impeccable init	One-time setup: gather durable product context, write PRODUCT.md, configure live mode when applicable, recommend next steps
/impeccable document	Generate root DESIGN.md from existing project code
/impeccable extract	Pull reusable components and tokens into the design system
/impeccable shape	Plan UX/UI before writing code
/impeccable critique	UX design review: hierarchy, clarity, emotional resonance
/impeccable audit	Run technical quality checks (a11y, performance, responsive)
/impeccable polish	Final pass, design system alignment, and shipping readiness
/impeccable bolder	Amplify boring designs
/impeccable quieter	Tone down overly bold designs
/impeccable distill	Strip to essence
/impeccable harden	Error handling, i18n, text overflow, edge cases
/impeccable onboard	First-run flows, empty states, activation paths
/impeccable animate	Add purposeful motion
/impeccable colorize	Introduce strategic color
/impeccable typeset	Fix font choices, hierarchy, sizing
/impeccable layout	Fix layout, spacing, visual rhythm
/impeccable delight	Add moments of joy
/impeccable overdrive	Add technically extraordinary effects
/impeccable clarify	Improve unclear UX copy
/impeccable adapt	Adapt for different devices
/impeccable optimize	Performance improvements
/impeccable live	Visual variant mode: iterate on elements in the browser
/impeccable generate	Generate variants of a named element in the live browser, no manual picking
Use /impeccable pin <command> to create standalone shortcuts (e.g., pin audit creates /audit).

Usage Examples
/impeccable audit blog           # Audit blog hub + post pages
/impeccable critique landing     # UX design review
/impeccable polish settings      # Final pass before shipping
/impeccable harden checkout      # Add error handling + edge cases
Or use /impeccable directly with a description:

/impeccable redo this hero section
