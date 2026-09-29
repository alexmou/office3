---
name: production-change
description: Use for production configuration, credentials, release operations, payment integrations, or live webhook verification. Do not use for ordinary local documentation or isolated UI changes.
---

Load `docs/SECURITY.md` and `docs/OPERATIONS.md`. Redact secrets, keep credentials out of browser CONFIG and git, use only environment or untracked local credential sources, and treat POST webhooks as destructive. Do not publish, deploy, or make live mutating requests without explicit approval.
