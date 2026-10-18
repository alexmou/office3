---
name: documentation-sync
description: Use when canonical docs, generated inventories, agent instructions, historical redirects, or repository skills need updating. Do not use for application behavior changes unless docs are a required consequence.
---

Treat active source as authoritative. Keep current docs under `docs/`, generated inventories under `docs/generated/`, agent routing in `AGENTS.md`, and product/design context in `PRODUCT.md` and `DESIGN.md`. Clearly label historical material; never let it override current source. Do not create documentation diffs for ordinary feature tasks.

When generated inputs change, run `node tools/generate-docs.mjs`, then `node --test tools/generate-docs.test.mjs` and `node tools/generate-docs.mjs --check`. For documentation-only changes, run the integrity test and inspect links/status; do not run production integrations. Never copy secrets into generated or narrative docs.
