---
name: sale-checkout
description: Use for catalog-to-sale, cart drafts, discounts, payment fees, currency conversion, RUB QR, basket context, or sale payloads. Do not use for unrelated page styling or generic API documentation.
---

Load `docs/SALE_FLOW.md` and `docs/DATA_MODEL.md`, then inspect `newsale/newsale.js` and `newsale/newsales_classes.js`. Preserve source fields, username, store context, payment consistency, finalPriceVND, basket id, and total rounding. Do not send live mutating sales requests. Run sale syntax checks and focused invariant tests when available.
