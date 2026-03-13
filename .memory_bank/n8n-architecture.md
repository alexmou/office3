# n8n Architecture

Workspace config:
- `n8nac-config.json` is initialized and points to:
- host: `https://buttonrouge.org/n8n`
- sync folder: `workflows`
- project: `Personal`
- instance identifier: `buttonrouge_org/n8n_алексей_м`

Local workflow layout:
- active workflows live under `workflows/buttonrouge_org/n8n_алексей_м/personal/`
- filenames, not paths, are used for `n8nac push`

Integration bridge:
- `system/api.js` maps frontend service names to webhook actions
- `system/n8n-service-workflow-map.json` is the quick lookup from frontend services to workflow ids/files

Required workflow protocol:
- list before editing
- pull before editing if remote may have changed
- edit local `.workflow.ts`
- push by filename
- verify after push when possible

Representative owned workflows:
- `localization.workflow.ts`
- `CashRegister.workflow.ts`
- `button_config.workflow.ts`
- `sales.workflow.ts`
- `button_schedule.workflow.ts`

Current documentation split:
- stable sync and ownership rules belong here
- project-wide summary belongs in `local/README.md`
