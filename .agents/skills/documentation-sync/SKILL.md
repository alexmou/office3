---
name: documentation-sync
description: Use when source-derived docs, generated inventories, AGENTS.md, memory migration, or repository skills need updating. Do not use for application behavior changes unless docs are a required consequence.
---

Treat the current source tree as authoritative. Run `node tools/generate-docs.mjs`, then `node tools/generate-docs.mjs --check`. Update canonical docs under `docs/`, keep README short, keep AGENTS concise, and remove or supersede stale claims without documenting absent paths. Never copy secrets into generated or narrative docs.
