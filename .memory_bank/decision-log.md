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
