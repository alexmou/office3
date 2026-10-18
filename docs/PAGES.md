# Pages

The authoritative page inventory is [generated/pages.json](generated/pages.json), derived from `system/pageConfig.js`. Each record includes page id, HTML, JavaScript, CSS, external assets, initializer detection, API services, and source files.

Active page ids are `admin_sklad`, `login`, `newsale`, `barcode`, `catalog`, `sales`, `statistic`, `settings`, `salary`, `salaryperiod`, `cashregister`, `budget`, `suppliers`, `schedule`, and `sapo`. `header` is the shared runtime entry.

Important runtime details:
- `cashregister` loads files from `cashRegister/`.
- `salaryperiod` loads the period-based salary summary from `salaryPeriod/`.
- `budget` is the refactored budget page (vocabulary editor, per-article month comparison, analytics, next-month suggestions) and needs the `saveBudgetVocabulary` backend action; the previous implementation is kept in `budget_old/` (not registered).
- All page HTML is fetched and inserted into `#page-root`.
- Page scripts register initialization with `registerPageInit`.
- `newsale` loads `newsales_classes.js` before `newsale.js`.
- Barcode, salary, budget, suppliers, statistic, and the active chart-enabled views use external or vendor Chart.js/PDF/barcode assets as recorded in generated data.

Do not use the stale `AGENTS.pages.md` map as a source of truth; it names absent paths and omits active `sapo`.
