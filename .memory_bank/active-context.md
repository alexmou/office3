# Active Context

Last refreshed: 2026-03-13

Current documentation model:
- `AGENTS.md` is the bootstrap entrypoint
- `local/README.md` is the canonical project context
- `.memory_bank/` stores durable architecture and decision notes

Current repository realities:
- root workspace is the primary source for production-facing docs
- `test/` mirrors the workspace and should follow the same operating rules
- frontend runtime is static and heavily global-state driven
- `n8nac` is initialized and workflows are stored under `workflows/buttonrouge_org/n8n_алексей_м/personal/`

Current priorities:
- keep frontend docs and workflow docs connected through shared service names
- avoid reintroducing architecture context into `AGENTS.md`
- update the memory bank whenever integration ownership or runtime assumptions change
- use `.memory_bank/service-workflow-matrix.md` as the first stop for API-to-workflow impact analysis
