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
