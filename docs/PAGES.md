# Pages

The authoritative page inventory is [generated/pages.json](generated/pages.json), derived from `system/pageConfig.js`. Each record includes page id, HTML, JavaScript, CSS, configured external assets, initializer name (or `null`), an initializer-registration flag, direct API services found in loaded JavaScript, and local source files. Runtime asset strings retain query parameters; `sourceFiles` and local file reads use normalized physical paths, preserve case, strip query/fragment suffixes, and exclude external URLs. Commented-out calls are excluded.

Active page ids are `admin_sklad`, `login`, `newsale`, `barcode`, `catalog`, `sales`, `statistic`, `settings`, `salary`, `salaryperiod`, `cashregister`, `budget`, `suppliers`, `schedule`, and `sapo`. `header` is the shared runtime entry.

Important runtime details:
- `cashregister` loads files from `cashRegister/`.
- `salaryperiod` loads the period-based salary summary from `salaryPeriod/`.
- `budget` is the refactored budget page (vocabulary editor, per-article month comparison, analytics, next-month suggestions) and needs the `saveBudgetVocabulary` backend action; the previous implementation is kept in `budget_old/` (not registered).
- All page HTML is fetched and inserted into `#page-root`.
- Page scripts register initialization with `registerPageInit`.
- `newsale` loads `newsales_classes.js` before `newsale.js`.
- Barcode, salary, budget, suppliers, statistic, and the active chart-enabled views use external or vendor Chart.js/PDF/barcode assets as recorded in generated data.

Standalone `3d/` and `catalog3d/` folders are not registered in the SPA. `budget_old/` is an archived implementation, not an active page.
