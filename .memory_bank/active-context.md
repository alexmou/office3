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
- prefer narrow task scope: target file first, backend/docs/test only when necessary
- validate live `n8n` registration with `tools/check_n8n_webhooks.mjs` or `tools/check_service_integrations.mjs` before assuming a webhook-backed service is healthy
- treat workflow publication as mandatory: after changing any `n8n` workflow, confirm the live published state, not only the editor or synced state
- webhook publication now has a concrete host-level fix path: `node tools/publish_n8n_workflow.mjs <workflowId>` patches live workflow versions with stable `webhookId`, clears stale `webhook_entity` rows, restarts `n8n.service`, and rechecks production endpoints
- backend verification against mutating Google Sheets or other write-capable POST webhooks now requires explicit user approval before any live request is sent
