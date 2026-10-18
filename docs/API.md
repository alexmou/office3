# API

The machine-readable inventory is [generated/api-routes.json](generated/api-routes.json), generated from `system/api.js`. It contains all 57 current `API_ROUTES` entries and, for each route, service, method, source, webhook mode, webhook action, raw-body flag, and source callers.

## Contract

`API.*` methods are generated from `API_ROUTES` and call `requestViaN8nOrMock`. Contract v1 is the current default: GET requests may include `data={query: payload}` and ordinary POST requests send the service payload. Contract v2 sends `{ action, token, payload }`; raw-body routes preserve their body shape. Route configuration can also be merged from runtime `CONFIG.API_ROUTES`.

`source: "n8n"` means the frontend selects n8n transport; `source: "auto"` is legacy/automatic behavior and has no local workflow ownership. `webhookMode` is `prod` or `test`; `webhookAction` is the transport endpoint suffix when declared. `rawBody` means the route sends the supplied body without the ordinary wrapper.

## Caller classes

Preferred callers use `API.<service>()`. Legacy callers construct `{ googleFuncName, params }` and pass through `runGSfunction` or `runGSfunctionPromise`; current examples include cash register, salary, catalog barcode/newsale lookup, statistics scratch UI, and sale submission. `requestViaN8nOrMock` is the shared transport used by generated API methods. Direct `fetch` also exists for runtime page HTML, auth fallbacks, and Amelie payment endpoints.

The route inventory intentionally does not claim workflow ownership. No workflow source or workflow map is present in this repository.

## Change rule

When an API route changes, update the source first, regenerate JSON, inspect callers in the generated record, and run the checks in `docs/TESTING.md`. Read-only verification is preferred; mutating webhook checks require explicit approval.

## User administration (proposed backend contract)

The settings page calls the `/users` webhook. The backend must authorize every action from the session token and restrict `createUser`/`updateUser` to administrators. Passwords must never be included in `getUsers` or `updateUser` responses. `createUser` creates a random temporary password server-side and returns it once; the frontend displays it once and does not persist it.

Read users:

```js
const result = await window.API.getUsers({ visible: true, token: window.token });
```

Example GET query to `/webhook/users` (contract v1):

```json
{
	"action": "getUsers",
	"visible": true,
	"token": "<SESSION_TOKEN>",
	"data": { "query": { "action": "getUsers", "visible": true, "token": "<SESSION_TOKEN>" } }
}
```

Example response:

```json
{
	"users": [
		{ "id": 1, "Name": "Ана", "Available": "1", "role": 4, "salaryFixHour": 0, "schedulecolor": "", "fontcolor": "" }
	]
}
```

Create a user; the backend generates the password and returns it only in this response:

```js
const result = await window.API.createUser({
	token: window.token,
	user: { Name: "New User", Available: "1", role: 2, salaryFixHour: 0, schedulecolor: "#006633", fontcolor: "#E8FFF1" }
});
```

POST `/webhook/users` request body:

```json
{
	"action": "createUser",
	"token": "<SESSION_TOKEN>",
	"user": { "Name": "New User", "Available": "1", "role": 2, "salaryFixHour": 0, "schedulecolor": "#006633", "fontcolor": "#E8FFF1" }
}
```

Example successful response:

```json
{
	"success": true,
	"user": { "id": 9, "Name": "New User", "Available": "1", "role": 2, "salaryFixHour": 0, "schedulecolor": "#006633", "fontcolor": "#E8FFF1" },
	"password": "<GENERATED_TEMPORARY_PASSWORD>"
}
```

Update a user. The response must not contain a password:

```js
const result = await window.API.updateUser({
	token: window.token,
	user: { id: 1, Name: "Ана", Available: null, role: 4, salaryFixHour: 2000, schedulecolor: "#004d40", fontcolor: "#ffffff" }
});
```

`Name` is both the login and display name. `Available` is sent as string `"1"` or `null`; `role` and `salaryFixHour` are numbers; both color fields are hex strings or empty strings. POST body uses the same structure with `"action": "updateUser"`. Responses should use `{ "success": true, "user": { ... } }` or `{ "success": false, "message": "..." }`. Passwords must never be returned by `getUsers` or `updateUser`.

## Salary percentages

The settings page uses the existing `/users` webhook. `getSalaryPercent` reads one user's brand percentages; `updateSalaryPercent` saves the complete set of that user's records.

Read through the frontend API:

```js
const result = await window.API.getSalaryPercent({ token: window.token, username: "Анна" });
```

Example response:

```json
{
  "rows": [
		{ "Id": 101, "username": "Анна", "brand": "BUTTON ROUGE", "Cash": 0, "Transfer": 0, "Terminal": 0, "RUB_QR": 0 },
		{ "Id": 102, "username": "Анна", "brand": "FESUNSHT", "Cash": 0, "Transfer": 2.5, "Terminal": 0, "RUB_QR": 0 }
  ]
}
```

The write service is named `updateSalaryPercent`. Example frontend call:

```js
const result = await window.API.updateSalaryPercent({
	token: window.token,
	username: "Анна",
	records: [
		{ "Id": 101, "username": "Анна", "brand": "BUTTON ROUGE", "Cash": 6, "Transfer": 0, "Terminal": 0, "RUB_QR": 0 },
		{ "Id": 102, "username": "Анна", "brand": "FESUNSHT", "Cash": 0, "Transfer": 2.5, "Terminal": 0, "RUB_QR": 0 }
	]
});
```

The service should return `{ "success": true }` or `{ "success": false, "message": "..." }`. For API contract v2, the POST body is `{ "action": "updateSalaryPercent", "token": "...", "payload": { "username": "Анна", "records": [...] } }`. The `records` array replaces the full set for the specified user.

## Budget vocabulary (proposed backend contract)

The `budget` page always sends object bodies to the `budget` webhook: `saveBudgetChanges` is `{ "changes": [{ "month", "article", "outcome", "paid", "newArticle", "comment", "id"? }] }` (the previous page, kept in `budget_old/`, posted the bare array).

`getBudgetVocabulary` returns records `{ "Id": 1, "title": "Google, chatgpt", "category": "Маркетинг" }`; a record with an empty `title` is a category without articles. Titles may repeat, category names may not. `saveBudgetVocabulary` (POST, `budget` webhook, raw body, `?action=saveBudgetVocabulary`) is used by the `budget` page. Body: `{ "add": [{ "title": "Новая статья", "category": "Маркетинг" }, { "title": "", "category": "Новая категория" }], "delete": [{ "id": 5 }] }`. `delete` items carry the record `id` (deleting a category removes its empty-title record and the page also deletes its articles); `add` items need `title` and `category` (empty `title` creates a category). The page re-reads the vocabulary afterwards to obtain new ids. Budget records may carry a `group`/`category` field. The token is sent in the `X-Auth-Token` header. Respond with any non-empty JSON on success; an empty response is treated as failure.

### Test endpoint `budget-test`

Source: `workflows/n8n/Budget_Test.workflow.ts` (inactive until pushed and activated). It serves generated data relative to today (3 past months, current, next) and does not persist anything. Open `budget` with `?budgetEndpoint=budget-test` to route all of its requests there. Base URL: `https://n8n.buttonrouge.org/webhook/budget-test`. The token may be a `token` query/body field or the `X-Auth-Token` header; a missing token returns `{ "success": false, "message": "token required" }`.

```bash
# vocabulary
curl -G "$BASE/budget-test" --data-urlencode "action=getVocabulary" --data-urlencode "token=$TOKEN"
# -> [ { "Id": 1, "title": "", "category": "Недвижимость" }, { "Id": 2, "title": "Аренда", "category": "Недвижимость" }, ... ]

# records per month (keys are month starts)
curl -G "$BASE/budget-test" --data-urlencode "action=getBudgetData" --data-urlencode "token=$TOKEN"
# -> { "2026-07-01": [ { "id": 101, "title": "Аренда", "group": "Недвижимость", "income": 0,
#                        "outcome": 20000000, "paid": true, "editable": true, "comment": "" }, ... ], "2026-08-01": [...], ... }

# income/outcome per month (outcome is recomputed by the page)
curl -G "$BASE/budget-test" --data-urlencode "action=getMonthsSummary" --data-urlencode "token=$TOKEN"
# -> { "2026-07-01": { "income": 90000000, "outcome": 0 }, ... }

# save record changes (body is an array)
curl -X POST "$BASE/budget-test?action=saveBudgetChanges" -H "Content-Type: application/json" -H "X-Auth-Token: $TOKEN" \
  -d '[{ "month": "2026-10-01", "article": "Логистика", "outcome": 2500000, "paid": false, "newArticle": true, "comment": "" }]'
# -> { "success": true, "saved": 1, "changes": [ ... ] }

# save vocabulary
curl -X POST "$BASE/budget-test?action=saveBudgetVocabulary" -H "Content-Type: application/json" -H "X-Auth-Token: $TOKEN" \
  -d '{ "changes": [{ "action": "delete", "id": 3 }, { "action": "add", "title": "Аренда склада", "category": "Недвижимость" }] }'
# -> { "success": true, "added": 1, "deleted": 1 }
```

Error examples: `{ "success": false, "message": "body must be an object with a changes array" }`, `{ "success": false, "message": "unknown action: foo" }`. The test data deliberately contains a >20% spike (Маркетинг, Коммунальные услуги in the current month) and a missing regular article (Логистика) to exercise analytics and suggestions.
