# Decision Log

## 2026-03-13 - Mirror the root documentation model in test workspace

Decision:
- `test/` adopts the same `AGENTS.md` -> `local/README.md` -> `.memory_bank/` read path as the root workspace

Implication:
- test instructions should not drift from the root operating model without an explicit note here
