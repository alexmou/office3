# Service Workflow Matrix

Last refreshed: 2026-04-04

Source files:
- `system/api.js`
- `system/n8n-service-workflow-map.json`

Coverage snapshot:
- total services in `API_ROUTES`: 51
- `n8n`-backed services: 41
- `auto` services: 10
- mapped to a concrete workflow file: 37
- `n8n` services still unmapped in the lookup file: 4

## Mapped n8n services by workflow

### `button_Auth.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getAuthData` | `GET` | `prod` | `Auth` | `GJQ5EyXqLMJAK0uU` |
| `setToken` | `POST` | `prod` | `Auth` | `GJQ5EyXqLMJAK0uU` |

### `button_budget.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getBudgetData` | `GET` | `prod` | `budget` | `jyqgaRvgPCMMLPjZ` |
| `getBudgetVocabulary` | `GET` | `prod` | `budget` | `jyqgaRvgPCMMLPjZ` |
| `getMonthsSummary` | `GET` | `prod` | `budget` | `jyqgaRvgPCMMLPjZ` |
| `saveBudgetChanges` | `POST` | `prod` | `budget` | `jyqgaRvgPCMMLPjZ` |

### `button_charts.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getChartsData` | `GET` | `prod` | `charts` | `VSQwF8modN3kIuz9` |
| `getChartsSummary` | `GET` | `test` | `charts` | `VSQwF8modN3kIuz9` |

### `button_config.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getConfig` | `GET` | `prod` | `config` | `bT8hmBOQFVQk7iJ9` |
| `updateConfig` | `POST` | `prod` | `config` | `bT8hmBOQFVQk7iJ9` |

### `button_getStores.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getStores` | `GET` | `prod` | `stores` | `LnFR3805UOxKmVlx` |
| `getUserStoreByToken` | `GET` | `prod` | `stores` | `LnFR3805UOxKmVlx` |

### `button_schedule.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getSchedule` | `GET` | `prod` | `schedule` | `9z0Gg2KId6ieywKg` |
| `getScheduleMeta` | `GET` | `prod` | `schedule` | `9z0Gg2KId6ieywKg` |
| `upsertShifts` | `POST` | `prod` | `schedule` | `9z0Gg2KId6ieywKg` |

### `button_sklad.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `addSkladItem` | `POST` | `prod` | `sklad` | `1rSHNYY8DuXZQJ1Y` |
| `deleteSkladItem` | `POST` | `prod` | `sklad` | `1rSHNYY8DuXZQJ1Y` |
| `editSkladItem` | `POST` | `prod` | `sklad` | `1rSHNYY8DuXZQJ1Y` |
| `getSkladData` | `GET` | `prod` | `sklad` | `1rSHNYY8DuXZQJ1Y` |
| `getSkladHeader` | `GET` | `prod` | `sklad` | `1rSHNYY8DuXZQJ1Y` |
| `getSkladVocabulary` | `GET` | `prod` | `sklad` | `1rSHNYY8DuXZQJ1Y` |
| `saveSkladChanges` | `POST` | `prod` | `sklad` | `1rSHNYY8DuXZQJ1Y` |

### `button_tags.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getTagsConfig` | `GET` | `prod` | `tags` | `TBIyzil82lShTiqx` |
| `saveTagsConfig` | `POST` | `prod` | `tags` | `TBIyzil82lShTiqx` |

### `CashRegister.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `addCacheRegisterRecord` | `POST` | `prod` | `CashRegister` | `t6SVNT2eaJMzNH1e` |
| `getCash` | `GET` | `prod` | `CashRegister` | `t6SVNT2eaJMzNH1e` |
| `getCashRegisterRecords` | `GET` | `prod` | `CashRegister` | `t6SVNT2eaJMzNH1e` |
| `getVocabulary` | `GET` | `prod` | `CashRegister` | `t6SVNT2eaJMzNH1e` |

### `getCatalogData.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getAllItemsFromCatalogByQuery` | `GET` | `prod` | `getCatalogData` | `hUNAzAUPzoSKPnVfY5hCx` |
| `getHeader` | `GET` | `prod` | `getCatalogData` | `hUNAzAUPzoSKPnVfY5hCx` |
| `getItemByArticleName` | `GET` | `prod` | `getCatalogData` | `hUNAzAUPzoSKPnVfY5hCx` |

### `localization.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getLocalizationDictionary` | `GET` | `prod` | `localization` | `fJVdhXr3rGXg0TsB` |

### `Menu.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getMenu` | `GET` | `prod` | `Menu` | `hwR6rUBEyPfH3zRl` |

### `newSale.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `sendSalesToSheet` | `POST` | `prod` | `newSale` | `7pC8RxgVHa1G7N7PsT9W4` |

### `salary.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getMySalary` | `GET` | `prod` | `Salary` | `rIjQhZPR3nLFhiNX` |

### `SalaryFix.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getSalaryFix` | `GET` | `test` | `SalaryFix` | `lcTnjXz7ItCVZbVW` |

### `sales.workflow.ts`

| Service | Method | Mode | Action | Workflow ID |
| --- | --- | --- | --- | --- |
| `getSalesData` | `GET` | `prod` | `sales` | `S8psazYZnXdCAT0B` |

## n8n routes missing workflow ownership in the lookup

| Service | Method | Mode | Action | Note |
| --- | --- | --- | --- | --- |
| `addBudgetRecord` | `POST` | `prod` | none declared | Present in `API_ROUTES`, unresolved in lookup |
| `markSupplierPaymentsDone` | `POST` | `prod` | `supliers` | Suppliers payment endpoint is declared in `API_ROUTES`, workflow ownership not assigned yet |
| `getToken` | `GET` | `prod` | none declared | Present in `API_ROUTES`, unresolved in lookup |
| `getSapoOrders` | `GET` | `prod` | `sapo` | New Sapo integration route, workflow ownership not assigned yet |

## `auto` services

These routes are still marked `source: "auto"` in `system/api.js` and do not point to a tracked workflow file.

| Service | Mode |
| --- | --- |
| `getAllItemsFromSalesByQuery` | `prod` |
| `getAllSalesStatistic` | `prod` |
| `getBudget` | `prod` |
| `getBudgetRecords` | `prod` |
| `getDistinctBrandNames` | `prod` |
| `getPivot` | `prod` |
| `getPnl` | `prod` |
| `getSalesFilterOptions` | `prod` |
| `setStatisticBrandName` | `prod` |
| `updateBudgetData` | `prod` |

## Operating rules

- When changing a frontend service, update both `system/api.js` and this file.
- When workflow ownership changes, update `system/n8n-service-workflow-map.json` and this file in the same task.
- Treat unmapped `n8n` routes as integration debt until ownership is made explicit.
