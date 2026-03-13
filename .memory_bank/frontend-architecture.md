# Frontend Architecture

Boot flow:
- `index/index.html` loads `system/system.js`, `system/pageConfig.js`, `system/app.js`
- `system/pageConfig.js` declares page metadata and static asset lists
- `system/app.js` loads the header, core scripts, page HTML, page CSS, page JS, and runs page init hooks

State model:
- heavy use of runtime globals such as `window.PAGE_CONFIG`, `window.CONFIG`, and `window.token`
- page scripts integrate through `window.registerPageInit`
- header and navigation are assembled at runtime

Shared primitives:
- `shared/class_TableUI.js` provides `TableData` and `TableUI`
- table-related pages often depend on this abstraction for filtering, search, and server-backed datasets

Page routing conventions:
- page ids are defined in `system/pageConfig.js`
- some ids do not match folder names exactly, for example `cashregister` -> `cashRegister/` and `budget` -> `budget2/`
- page HTML is fetched and injected, then scripts/styles are loaded dynamically

Operational cautions:
- external browser libraries are loaded ad hoc from `vendor/` or remote URLs
- failures in page init are logged but do not necessarily stop SPA execution
- HTTP serving is mandatory for page/header fetch logic
