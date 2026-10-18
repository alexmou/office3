---
name: code-change-verification
description: Use after source, tooling, or documentation changes to select focused syntax, inventory, link, or smoke verification. Do not use as a substitute for domain guidance or to justify live writes.
---

Load `docs/TESTING.md`. Run the narrowest relevant check: `node --check` for changed JavaScript, `node --test tools/generate-docs.test.mjs` for documentation integrity, and `node tools/generate-docs.mjs --check` when inventories are relevant. For browser behavior, serve over HTTP. Do not require app checks for docs-only changes or run mutating backend checks without explicit approval.
