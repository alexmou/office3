---
name: code-change-verification
description: Use after source or tooling changes when selecting syntax, generated-context, smoke, or contract verification. Do not use as a substitute for domain guidance or to justify live writes.
---

Load `docs/TESTING.md`. Run the narrowest relevant `node --check`, then `node tools/generate-docs.mjs --check`; inspect the final diff and diff stat. For browser behavior, serve over HTTP. Keep mutating backend checks disabled unless explicitly approved.
