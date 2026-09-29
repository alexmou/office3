# Testing

There is no repository test suite or `test/` directory. Verification is currently syntax, generated-context consistency, static caller inspection, and controlled browser smoke testing.

## Required checks

```sh
node --check tools/generate-docs.mjs
node tools/generate-docs.mjs --check
node --check system/api.js
node --check system/n8n.js
node --check system/app.js
node --check newsale/newsale.js
node --check newsale/newsales_classes.js
```

For a page change, also run `node --check` on that page JavaScript. Serve the repository over HTTP and smoke the affected page; do not open it only with `file://`.

## Sale regression cases

Test catalog fields survive draft save/restore and submission; username and store context remain non-empty; every item has `finalPriceVND`; all items in one basket share payment method and basket id; RUB QR confirmation forces the documented fields; and displayed totals equal item totals within the chosen currency rounding rule.

Live webhook checks must distinguish reads from writes. Do not send a sale, budget, warehouse, schedule, supplier-payment, or other mutating request without explicit approval.
