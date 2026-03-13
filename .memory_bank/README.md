# Memory Bank

Purpose:
- keep durable project context outside `AGENTS.md`
- let the agent recover state across longer tasks without re-reading the entire repo

Update rules:
- `active-context.md`: update after substantial work or when current priorities shift
- `project-overview.md`: update when the repository scope or top-level structure changes
- `frontend-architecture.md`: update when SPA runtime, shared UI primitives, or page lifecycle changes
- `n8n-architecture.md`: update when workflow sync rules, ownership, or active project layout changes
- `integration-contracts.md`: update when frontend-to-backend contracts change
- `decision-log.md`: append durable architectural decisions, not transient task notes

Read order:
1. `active-context.md`
2. the domain note that matches the task
3. `decision-log.md` if the task touches prior architecture decisions
