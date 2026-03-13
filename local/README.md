# Project README

This file is the canonical project context for AI-assisted work in `/home/l_murygin/www`.

Read order for non-trivial tasks:
- `AGENTS.md`
- `local/README.md`
- `.memory_bank/active-context.md`
- the most relevant domain note in `.memory_bank/`
- only then the target code files

## Purpose

This repository is a static browser SPA for Button Rouge operations plus a version-controlled `n8n` workflow layer. There is no build step. The app is served directly from the repository root over HTTP.

The project has two tightly-coupled domains:
- frontend runtime: `index/`, `system/`, `shared/`, page folders such as `catalog/` and `schedule/`
- automation/runtime backend: `workflows/` managed by `n8n-as-code`

Keep both domains in sync when changing integrations. Frontend service names in `system/api.js` are often coupled to specific webhooks and workflows.

## Runtime map

Entry path:
- `index/index.html` loads `system/system.js`, `system/pageConfig.js`, `system/app.js`

SPA boot:
- `system/pageConfig.js` defines `window.PAGE_CONFIG` with page ids, HTML, JS, CSS, and external assets
- `system/app.js` loads shared assets, header, page HTML, and page scripts on demand
- `window.registerPageInit(pageId, fn)` is the page initialization hook

Shared client layer:
- `system/n8n.js` resolves `prod` vs `test` webhook base URLs and wraps fetch calls
- `system/api.js` maps frontend service names to webhook actions, contract versions, and transport rules
- `shared/class_TableUI.js` provides the main shared table/data abstraction

Key runtime assumptions:
- run over HTTP, not `file://`, otherwise page/header `fetch()` calls are blocked
- auth token is passed in the URL and propagated through runtime globals
- config and store context are loaded asynchronously at runtime

## Page model

Primary page ids currently configured in `system/pageConfig.js`:
- `login`
- `newsale`
- `barcode`
- `catalog`
- `sales`
- `statistic`
- `settings`
- `salary`
- `cashregister`
- `budget`
- `supliers`
- `schedule`
- `admin_sklad`
- `charts`

The concise page-to-folder map remains in `AGENTS.pages.md`.

## Frontend architecture

Navigation and layout:
- `system/app.js` contains default nav items, header fallback markup, dynamic asset loading, and page switching
- page HTML files are fetched and injected into the SPA shell
- page scripts register their own init routines instead of relying on a build pipeline

Shared abstractions:
- `TableData` in `shared/class_TableUI.js` centralizes dataset loading, filtering, and client-side search
- shared table CSS lives in `shared/table.css`

Operational risks:
- multiple runtime globals are used (`window.PAGE_CONFIG`, `window.CONFIG`, `window.token`)
- some pages still depend on legacy patterns or external scripts loaded from `vendor/`
- page ids and folder names are not fully normalized (`cashregister` -> `cashRegister/`, `budget` -> `budget2/`)

## API and integration boundaries

Canonical integration entrypoint:
- `system/api.js`

Current model:
- service names are mapped in `API_ROUTES`
- routes may use `source: "n8n"`, `source: "auto"`, or legacy behavior
- webhook mode can be `prod` or `test`
- the code still carries both contract v1 and contract v2 semantics

Important integration facts:
- some GET calls still use legacy wrappers such as `data={ query: ... }`
- some POST routes use raw bodies instead of a normalized envelope
- route naming is business-oriented, not always workflow-oriented
- `system/n8n-service-workflow-map.json` is the fast lookup table from services to workflow ids/files

When changing any API route:
1. inspect the relevant entry in `system/api.js`
2. inspect `system/n8n-service-workflow-map.json`
3. inspect the linked workflow under `workflows/`
4. update docs in `.memory_bank/` if the contract or ownership changed

## n8n-as-code layer

Source of truth for workflow sync:
- `n8nac-config.json`

Active sync context at the time of writing:
- host: `https://buttonrouge.org/n8n`
- sync folder: `workflows`
- project name: `Personal`
- instance identifier: `buttonrouge_org/n8n_алексей_м`

Workflow rules:
- never edit an existing workflow blindly; list/pull first
- push by filename only, not by path
- verify after push whenever possible
- treat `workflows/**/*.workflow.ts` as production code, not as generated scratch files

Representative workflow examples:
- `workflows/buttonrouge_org/n8n_алексей_м/personal/localization.workflow.ts`
- `workflows/buttonrouge_org/n8n_алексей_м/personal/CashRegister.workflow.ts`
- `workflows/buttonrouge_org/n8n_алексей_м/personal/button_config.workflow.ts`

## Change protocol

For any non-trivial task:
1. build a short plan first
2. read the smallest useful set of source files
3. make the code change
4. update docs if the architecture, workflow ownership, contracts, or operating assumptions changed
5. record durable conclusions in `.memory_bank/decision-log.md` when the change introduces a new rule or architectural decision

Update expectations:
- update `local/README.md` for stable project-level truths
- update `.memory_bank/active-context.md` for current working context
- update `.memory_bank/frontend-architecture.md` or `.memory_bank/n8n-architecture.md` when a domain model changes
- update `.memory_bank/integration-contracts.md` when API semantics change

## Where to look first

If the task is about:
- SPA boot or routing: `system/app.js`, `system/pageConfig.js`
- API behavior: `system/api.js`, `system/n8n.js`
- tables/search/filtering: `shared/class_TableUI.js`
- page-specific UI: the corresponding page folder plus `AGENTS.pages.md`
- workflow-backed behavior: `system/n8n-service-workflow-map.json`, `n8nac-config.json`, `workflows/`

## Known rough edges

- mixed legacy and newer API contracts coexist
- some route ownership is still implicit and discovered through lookup files
- localization is partly centralized in a workflow and partly embedded in frontend text
- the `test/` subtree mirrors much of the app and should not silently diverge from root-level operating rules
