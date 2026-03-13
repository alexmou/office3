# Test Workspace README

This workspace mirrors the main project under `/home/l_murygin/www` for testing and parallel changes.

Read order:
- `test/AGENTS.md`
- `test/local/README.md`
- `test/.memory_bank/active-context.md`

Rules:
- follow the same frontend and `n8n` operating model as the root workspace unless the test workspace explicitly diverges
- use `/home/l_murygin/www/local/README.md` as the upstream source of truth for project architecture
- if test-only behavior diverges, document that divergence here and in `test/.memory_bank/decision-log.md`

Key mirrors:
- SPA entrypoint and system files mirror the root workspace layout
- workflow conventions stay aligned with the root workspace `n8nac` setup
- helper summaries remain in `test/AGENTS.arch.md` and `test/AGENTS.pages.md`
