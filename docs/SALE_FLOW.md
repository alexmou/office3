# Sale Flow

## Production path

1. `newsale/newsales_classes.js` loads catalog data into `productTable.rawData`; visible table rows remain the cart UI source for row order and count.
2. `newsale/newsale.js` merges visible fields back onto raw objects so hidden catalog fields are preserved, then stores a session draft keyed by environment, store, and user/token.
3. `updateSale()` computes gross item totals, item discounts, general discount, payment fee, and the displayed basket total. It sets `cartUI.finalPriceVND`, currency rate (`curs`), selected currency, and payment method.
4. `SalesManager` normalizes each sale item using the catalog schema plus required sale fields, calculates `finalPriceVND`, converts to `finalPrice`, and copies `curs`, `currency`, `paymentmethod`, and `username`.
5. `Basket` stores cart context. `submitSales()` generates a UUID basket id, resolves store and sheet context, adds date/time and basket id to every item and the basket, converts values to strings, and sends `{ sales, stores?, store?, basketid }` through legacy `googleFuncName: "sendSalesToSheet"` to the `newSale` route.
6. A successful response clears the table, cart, draft, and starts receipt printing. Failure leaves the cart available and reports an error.

## RUB QR

Selecting `RUB_QR` starts Amelie rate polling. The displayed RUB amount is rounded to two decimals from final VND and the rate. The QR is created directly against the configured Amelie endpoint; status is polled until terminal state. After confirmation, the sale is rebuilt, each item is forced to `paymentmethod: "RUB_QR"`, `currency: "VND"`, `curs: "1"`, and `finalPrice = finalPriceVND`, then submitted through the same basket path.

## Invariants

- Preserve all source product fields when merging raw data and normalizing sale items.
- Resolve username from cart state, DOM, or login global; an empty username is a defect.
- Keep one payment method for the basket. RUB QR uses `RUB_QR` only after payment confirmation.
- Preserve store name, `storeId`, `sheetName_sklad`, and `sheetName_accounting` through draft, basket, and serialization.
- Every submitted item must have `finalPriceVND` and a corresponding `finalPrice`.
- The sum of item final prices and the displayed basket total must agree under the documented currency and rounding rules; this is a required regression test, not a refactor performed here.
