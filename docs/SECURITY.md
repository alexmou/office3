# Security

## Findings

A real credential-shaped value is tracked in `.vscode/settings.json` under `n8n.apiKey`. Its value is intentionally not recorded here. It should be revoked/rotated and removed from git history through the repository's approved incident process; this documentation task does not perform credential mutation.

## Current architecture

The login flow posts credentials to the `Auth` webhook through `API.setToken`. The returned token is assigned to `window.token` and written into the URL query by `setToken()` using `history.replaceState`. The token is therefore browser-readable, travels with requests, and can leak through copied URLs, referrers, browser history, logs, screenshots, or third-party resources. Tokens are not intentionally stored in localStorage by the runtime.

The browser trusts `window.CONFIG`, page JavaScript, URL state, selected store context, and client-calculated prices. The backend/n8n layer must authenticate and authorize every request; browser validation is not a security boundary. `system/n8n.js` uses webhook URLs, while n8n API credentials belong only in untracked local tooling/environment configuration, never browser CONFIG or git.

The sale page directly calls Amelie payment endpoints using `CONFIG.Amelie_AuthHeader` and configured URLs. Authorization material in browser configuration is architecture debt: payment authorization should move behind a backend-owned integration with server-side secret storage, origin/user validation, replay protection, and auditable request binding.

## Rules

- Never add API keys, payment headers, passwords, bearer tokens, or credentials to source, `CONFIG`, generated docs, or git.
- Never print secret values during scans or reports.
- Treat production POST webhooks as potentially mutating; do not probe them without explicit approval.
- Production webhook verification must use a read-only endpoint or an explicitly approved test payload and must record endpoint, mode, response status, and rollback/cleanup plan without recording secrets.
- Rotate the tracked n8n credential before any publication or deployment action.
