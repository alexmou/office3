# Refactor Plan

No refactor is performed in this documentation phase. Each stage is small, reversible, and must preserve current production behavior.

## 1. Remove exposed credentials and reduce token exposure

Scope: rotate the tracked n8n credential; remove `.vscode/settings.json` secrets; design a server-owned token/payment boundary. Files: `.vscode/settings.json`, `system/system.js`, `system/n8n.js`, `newsale/newsale.js`, deployment configuration. Unchanged behavior: successful login, authorized API calls, and payment outcomes. Tests: secret scan, auth smoke, read-only API checks, payment integration contract tests. Risk: high. Rollback: restore configuration from an approved secret store, never from git history.

## 2. Lock sale invariants with tests

Scope: characterize raw-field preservation, username/store propagation, payment-method consistency, finalPriceVND, and total rounding. Files: `newsale/newsale.js`, `newsale/newsales_classes.js`, new test harness outside production runtime. Unchanged behavior: existing payload shapes and pricing results. Tests: unit/fixture cases for normal, discount, currency, and RUB QR flows. Risk: medium. Rollback: revert tests only; no production code change.

## 3. Extract duplicated utilities

Scope: isolate numeric parsing, response unwrapping, store resolution, and normalization behind tested helpers. Files: `system/api.js`, `newsale/newsale.js`, `newsale/newsales_classes.js`, `shared/`. Unchanged behavior: exact route payloads and displayed totals. Tests: helper characterization plus page smoke. Risk: medium. Rollback: one helper extraction per commit/stage.

## 4. Migrate legacy API calls

Scope: replace `googleFuncName` and `runGSfunction*` callers with explicit `API.*` calls, one service at a time. Files: callers listed in `docs/generated/api-routes.json`, `system/api.js`. Unchanged behavior: method, webhook mode/action, raw body, and response handling. Tests: route contract fixtures and approved read-only integration checks. Risk: high. Rollback: revert one caller migration.

## 5. Separate sale state, pricing, and serialization

Scope: split UI state, pricing calculation, basket context, and backend serialization without changing fields or rounding. Files: `newsale/newsale.js`, `newsale/newsales_classes.js`. Unchanged behavior: sale payload and UI totals. Tests: full invariant suite and browser checkout smoke. Risk: high. Rollback: retain the old manager behind a temporary switch until parity is proven.

## 6. Decompose large pages

Scope: split large page modules by feature after API and sale contracts are stable. Files: `newsale/`, `schedule/`, `suppliers/`, `admin_sklad/`, and other large page scripts. Unchanged behavior: navigation, initializer timing, and API calls. Tests: page smoke and syntax checks. Risk: medium. Rollback: page-by-page revert.

## 7. Remove dead code

Scope: remove commented/unused legacy paths only after usage scans and runtime smoke. Files: source files identified by static analysis. Unchanged behavior: all active configured pages and routes. Tests: generated inventories, syntax checks, browser smoke. Risk: low to medium. Rollback: revert isolated cleanup stages.
