# API

## Evidence boundaries

`system/api.js` is the source of truth for explicit frontend route declarations and serialization. [generated/api-routes.json](generated/api-routes.json) keeps those declarations in `routes`; `unresolvedCalls` lists active calls with no explicit local declaration, and `inactiveReferences` records matches found only in comments. The explicit route count comes from the source and excludes both other sections. This repository has no workflow source, so frontend calls and payload shapes do not prove backend behavior, authorization, persistence, or production availability.

## Currently observed frontend transport

`API.*` methods are generated from `API_ROUTES` and call `requestViaN8nOrMock`. The frontend defaults to contract v1, which adds `data={query: payload}` to GET requests and sends ordinary POST payloads with an action. Contract v2 is supported and wraps ordinary POST data as `{ action, token, payload }`; raw-body routes retain their body shape. Runtime configuration may override route settings and contract version. These are frontend behaviors, not confirmation of a remote backend's current configuration.

`source: "n8n"` means the frontend selects n8n transport; `source: "auto"` is legacy/automatic behavior and has no local workflow ownership. `webhookMode` selects `prod` or `test`; `webhookAction` is the endpoint suffix when declared. In v1, raw-body routes POST the supplied object/array as-is, append the service action as a query parameter, and send the session token in `X-Auth-Token` when present. In v2, ordinary routes use the envelope above. Runtime overrides and older callers may differ.

## Caller classes

Preferred callers use `API.<service>()`. Legacy callers construct `{ googleFuncName, params }` and pass through `runGSfunction` or `runGSfunctionPromise`; current examples include cash register, salary, catalog barcode/newsale lookup, statistics scratch UI, and sale submission. `requestViaN8nOrMock` is the shared transport used by generated API methods. Direct `fetch` also exists for runtime page HTML, auth fallbacks, and Amelie payment endpoints.

The route inventory intentionally does not claim workflow ownership. Calls without `API_ROUTES` entries may use the `API` proxy or legacy `runGSfunction*` fallback; their frontend fallback is source-verifiable, but remote resolution and backend behavior are not. Comment-only references are not active calls. No workflow source or workflow map is present in this repository.

## Change rule

When an API route changes, update the source first, regenerate JSON, inspect callers in the generated record, and run the checks in `docs/TESTING.md`. Read-only verification is preferred; mutating webhook checks require explicit approval.

## User administration (frontend expectations; backend unverified)

The settings page calls `getUsers`, `createUser`, and `updateUser` on the `users` route. Read calls include `{ visible: true, token }`; writes include `{ token, user }`. The frontend unwraps several possible list/result wrappers and requires a password-like field (`password`, `generatedPassword`, or `temporaryPassword`) after create. No backend source is available to verify these response shapes or authorization behavior. The examples below are proposed expectations, not a verified contract. Any backend must authorize from the session token and restrict user writes; password handling and response exposure require backend verification.

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

The frontend submits the fields shown above, but backend meanings and accepted value types are unverified. In particular, earlier claims that `Name` is both login and display name and that responses have the exact shapes shown here are proposals, not confirmed behavior. Passwords must never be returned by `getUsers` or `updateUser`; this is a security requirement, not a verified backend property.

## Salary percentages (frontend expectations; backend unverified)

The settings page calls `getSalaryPercent({ token, username })` and `updateSalaryPercent({ token, username, records })` on the `users` route. Each submitted record contains a username, brand, optional `Id`, and numeric `Cash`, `Transfer`, `Terminal`, and `RUB_QR` values. The frontend accepts several array response wrappers when reading and handles a false/error result on write. Backend response shape, replacement semantics, and persistence are unverified. The examples below are illustrative proposals only.

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

Proposed response: `{ "success": true }` or `{ "success": false, "message": "..." }`. For API contract v2, the frontend serializer wraps the request as `{ "action": "updateSalaryPercent", "token": "...", "payload": { "username": "Анна", "records": [...] } }`. Whether the backend replaces the full set for the specified user is unverified.

## Budget (observed frontend payload; backend unverified)

The active `budget` page calls `API.saveBudgetChanges({ changes: payload }, ...)` and `API.saveBudgetVocabulary({ add, delete: del }, ...)`. Both routes are configured as v1 raw-body POSTs to the `budget` webhook: the first body is an object containing `changes`, and the second contains `add` and `delete` arrays. The transport adds `?action=<service>` and sends the session token in `X-Auth-Token` when available. This verifies only the frontend request, not backend acceptance or persistence. The previous implementation in `budget_old/` posted a bare array for changes.

The frontend builds `add` entries as `{ title, category }`, including `{ title: "", category }` for a new category, and `delete` entries as `{ id }`. It rereads the vocabulary after saving. Read methods use actions `getVocabulary`, `getBudgetData`, and `getMonthsSummary`. Required response fields and persistence behavior remain unverified.

### Experimental endpoint override

The page accepts `?budgetEndpoint=<webhook>` and passes that value as a route override for budget calls. This frontend switch is present in `budget/budget.js`; no corresponding `workflows/n8n/Budget_Test.workflow.ts` or other budget test backend source exists in this repository. Backend availability, test data, token handling, non-persistence, and response behavior are unverified. Earlier examples claiming a bare-array `saveBudgetChanges` body and a `{ changes: [...] }` vocabulary body conflict with the active frontend calls and must not be used as contract truth.
