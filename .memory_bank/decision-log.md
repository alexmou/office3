# Decision Log

## 2026-03-13 - Adopt local project context and memory bank

Decision:
- introduce `local/README.md` as the canonical long-form project context
- introduce `.memory_bank/` for durable working memory
- keep `AGENTS.md` as a short bootstrap file instead of the full architecture source

Why:
- the project spans both a static SPA and an `n8n` workflow backend
- durable context was growing too large for a single bootstrap file
- longer AI-assisted tasks need a stable place for architecture decisions and active state

Implications:
- architecture and contract changes must now update the relevant memory files
- `AGENTS.arch.md` and `AGENTS.pages.md` remain concise helper extracts, not the canonical source

## 2026-03-13 - Track service ownership in a dedicated matrix

Decision:
- add `.memory_bank/service-workflow-matrix.md` as the canonical human-readable map from frontend services to webhook actions and workflow files

Why:
- `system/n8n-service-workflow-map.json` is optimized for lookup, not for audits
- the project still mixes mapped `n8n`, unmapped `n8n`, and `auto` routes

Implications:
- API ownership reviews start from the matrix
- integration changes should update both the JSON lookup and the matrix together

## 2026-03-13 - Prefer minimal-scope implementation for routine feature work

Decision:
- default future changes to the smallest working scope
- do not automatically expand feature work into project-wide docs, `test/` mirror sync, or `n8n` workflow edits

Why:
- the recent `admin_sklad` task expanded into extra documentation, mirrored copies, wrapper/tool investigation, and backend deployment work before proving those steps were necessary
- this increased latency and token use without proportional value for a routine feature request

Implications:
- start from target file + reference file + direct dependency only
- only cross into `system/api.js`, `workflows/`, or `test/` after confirming the current boundary blocks the feature
- documentation updates are reserved for architecture/process changes, not ordinary UI work

## 2026-03-13 - Publish webhook workflows through the live host, not only through sync/push

Decision:
- finalize changed webhook workflows with `node tools/publish_n8n_workflow.mjs <workflowId>` after sync/push

Why:
- this n8n instance stores live runtime state in `/.n8n/database.sqlite`
- ordinary workflow sync/push can leave webhook nodes without a live-published `webhookId`, which makes the editor show an active workflow while production `/webhook/...` still returns `404`
- the repo now has a host-level helper that patches the live version, clears stale `webhook_entity` rows, restarts `n8n.service`, and verifies production endpoints

Implications:
- workflow editing is not done at the `n8nac push` step for webhook-based flows
- live webhook verification is a required part of delivery for services backed by `n8n` webhooks

## 2026-03-13 - Require approval before probing mutating backend paths

Decision:
- do not run live verification requests against mutating POST webhooks without explicit user approval
- treat Google Sheets-backed write workflows as destructive by default

Why:
- a backend health-check probe wrote `{ "probe": true }` into live `tagsConfig` and forced a manual Google Sheet restore
- in this project, several POST webhooks are not safe probes; they are real write paths into Sheets or business data

Implications:
- live verification is still required for published workflows, but mutating checks must be approved first
- automated health-check tooling must skip destructive POST probes unless the user explicitly authorizes them
