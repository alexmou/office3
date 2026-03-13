# Project Overview

Repository type:
- static multi-page-in-a-shell SPA with direct file serving
- version-controlled `n8n` workflows stored as TypeScript files

Main directories:
- `index/`: HTML entrypoint and favicon
- `system/`: runtime boot, routing, API layer, integration lookup files, base styles
- `shared/`: reusable UI/data helpers
- page folders such as `catalog/`, `schedule/`, `salary/`: page-specific HTML/JS/CSS
- `vendor/`: third-party browser assets
- `workflows/`: synchronized `n8n-as-code` workflow files
- `test/`: mirrored app workspace used for testing/parallel work

Core operating assumptions:
- no build step
- browser app must be served from repo root over HTTP
- frontend runtime and `n8n` workflow layer evolve together

Key documentation entrypoints:
- `AGENTS.md`: short bootstrap and working rules
- `local/README.md`: canonical project context
- `.memory_bank/*`: durable domain memory
