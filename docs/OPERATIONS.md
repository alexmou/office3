# Operations

Serve from the repository root with a simple HTTP server, for example `python3 -m http.server 8123`, then open `http://127.0.0.1:8123/index.html`. The SPA relies on HTTP `fetch()` for header and page loading.

Runtime webhook mode defaults to `prod`. The root `index.html` forces `test` only when the pathname contains `/test/`. `system/n8n.js` defaults to the public n8n base URL unless runtime environment/query configuration overrides it.

No workflow files, n8n project config, or local workflow map are present. Do not publish or deploy n8n from this frontend repository. Any future integration operation must use environment/untracked credentials and explicit approval for mutating production checks.

Before release, run the generated-doc consistency check, source syntax checks, a browser smoke test, a secret scan that redacts values, and `git diff --stat`. Confirm only intended documentation/tooling files changed.
