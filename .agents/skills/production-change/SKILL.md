---
name: production-change
description: Use for production configuration, credentials, release operations, payment integrations, or live webhook verification. Do not use for ordinary local documentation or isolated UI changes.
---

Load `docs/SECURITY.md` and `docs/OPERATIONS.md`. Never print, copy, or use tracked credentials; rotation is an owner action. Treat POST webhooks as potentially mutating. Do not publish, deploy, restart services, modify production data, or make live writes without explicit approval. Never run `tools/publish_n8n_workflow.mjs` automatically; it changes SQLite workflow state, restarts n8n, and probes endpoints.
