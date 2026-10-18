# Architecture

## Runtime

`index.html` creates `#app`, `#header-root`, `#page-root`, and `#overlay`, sets TEST mode only when the URL path contains `/test/`, then loads `system/system.js`, `system/pageConfig.js`, and `system/app.js`.

`system/app.js` loads core `system/n8n.js`, `system/api.js`, and `shared/class_TableUI.js`; fetches the header and selected page HTML; loads configured CSS and JavaScript; and calls the page's `registerPageInit` callback. `window.PAGE_CONFIG` in `system/pageConfig.js` is the runtime page registry. It has 16 entries: 15 page records and the shared `header`.

The app is a static SPA with runtime globals including `window.PAGE_CONFIG`, `window.CONFIG`, `window.token`, `window.USER_STORE`, and `window.API`. `window.registerPageInit(pageId, callback)` stores callbacks that `system/app.js` invokes after the page HTML and scripts load. There is no local build pipeline in this repository.

## Transport

`system/api.js` owns `API_ROUTES`, route selection, legacy contract v1 GET wrapping, contract v2 POST envelopes, raw-body compatibility, response normalization, and store/user context enrichment. `system/n8n.js` resolves the base URL and chooses `/webhook/` or `/webhook-test/`.

The normal flow is:

`index.html -> system runtime -> PAGE_CONFIG -> dynamic loader -> page init -> API.* or legacy wrapper -> n8n transport`.

Some pages still call legacy `googleFuncName` plus `runGSfunction`/`runGSfunctionPromise`; the generated route inventory records these callers. `newsale/newsale.js` also calls the configured external Amelie payment endpoints directly from the browser.

## Source boundaries

This repository contains root-level `index.html` and page folders. It does not contain `workflows/`, `test/`, `index/`, `budget2/`, `charts/`, `n8nac-config.json`, or `system/n8n-service-workflow-map.json`. No workflow ownership is claimed from absent files.
