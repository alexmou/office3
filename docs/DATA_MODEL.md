# Data Model

## Runtime state

- `window.token`: URL-derived auth token.
- `window.CONFIG`: backend configuration, including pricing percentages, currency rates, API overrides, and current Amelie endpoint/auth configuration.
- `window.USER_STORE` and `window.STORES_CACHE`: selected store and store metadata.
- `productTable.rawData`: catalog-backed objects, including hidden source fields.
- `cartUI`: discount, payment method, currency, rate, username, store, and calculated totals.
- `SalesManager.values`: normalized sale items.
- `SalesManager.basket`: one local basket context object.

## Sale item fields

The runtime schema starts with catalog all-field names and visible headers, then adds `id`, `finalPriceVND`, `finalPrice`, `curs`, `currency`, `paymentmethod`, `username`, `date`, `time`, `basketid`, `store`, `storeId`, `sheetName_sklad`, and `sheetName_accounting`. Missing fields are normalized to empty strings before serialization.

Drafts are JSON in `sessionStorage` under `newsaleDraft.v1:<prod|test>:<store>:<user-or-token>`. Drafts contain `rawData`, cart selections, and `savedAt`.

Backend payloads are sent as stringified item values after store and basket context are attached. The exact route and caller are in [generated/api-routes.json](generated/api-routes.json).
