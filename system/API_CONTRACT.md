# API contract notes (migration proposal and historical operations)

This file combines frontend migration design and dated operational notes. It is not evidence of current live n8n behavior. The canonical, source-verified frontend route and serialization reference is [docs/API.md](../docs/API.md); backend behavior is unverified because workflow source is absent here.

Фронт работает в двух режимах (переключается настройкой в `CONFIG`):

- **v1 (legacy frontend default)** — `system/api.js` defaults to GET requests with a `data={"query":...}` wrapper; some POST routes use raw bodies and `?action=...`. Live backend compatibility is not verified.
- **v2 (proposed migration target)** — a unified format without `data.query.*` and raw-body routes. This design has not been applied or verified against backend workflows.

## Что должен отдавать бэк в `getConfig`

Добавить (в Google Sheets / БД конфигурации):

- `API_CONTRACT_VERSION`: `1` или `2`
- `API_ROUTES`: JSON (строкой или объектом) — карта маршрутов, чтобы фронт был “minimalize”

Пример `API_ROUTES` (минимально):

```json
{
  "getStores": { "source": "n8n", "method": "GET", "webhook": "prod", "webhookAction": "stores" },
  "getSchedule": { "source": "n8n", "method": "GET", "webhook": "prod", "webhookAction": "schedule" },
  "upsertShifts": { "source": "n8n", "method": "POST", "webhook": "prod", "webhookAction": "schedule" }
}
```

Фронт автоматически подмешает `API_ROUTES` из `CONFIG` (см. `system/api.js`, `applyConfig()`).

## v2 (universal) — целевой формат запросов

### GET

Формат:

`GET /<webhookAction>?action=<action>&...параметры`

Пример:

`GET /schedule?action=getSchedule&Ym=2026-01`

### POST

Формат тела (всегда JSON, **не raw array/object**):

```json
{
  "action": "updateConfig",
  "token": "<optional>",
  "payload": { "...": "..." }
}
```

Примеры:

- Обновление конфига:
  - `POST /config`
  - body: `{ "action":"updateConfig", "payload": { "currentPageName_user":"schedule" } }`
- Сохранение смен:
  - `POST /schedule`
  - body: `{ "action":"upsertShifts", "payload":[ { "Id":"...", "DateISO":"2026-01-22", ... } ] }`
- Сохранение справочников/настроек:
  - `POST /tags` body: `{ "action":"saveTagsConfig", "payload": { ... } }`
  - `POST /budget` body: `{ "action":"saveBudgetChanges", "payload": [ ... ] }`
  - `POST /sklad` body: `{ "action":"saveSkladChanges", "payload": [ ... ] }`
  - `POST /supliers` body (current legacy raw-body route): `{ "action":"markSupplierPaymentsDone", "token":"...", "supplier":"...", "monthISO":"YYYY-MM", "sales":[...], "unpaidSales":[...] }`
  - `POST /supliers` response for `markSupplierPaymentsDone`: binary file (supplier report, downloadable attachment)

## Proposed backend migration notes (not active instructions)

1) **Webhook nodes**: разрешить методы, которые использует фронт:
   - для чтения — хотя бы GET (v2), лучше GET+POST
   - для записи — POST

2) **Единый парсер входа** в начале каждого workflow:
   - `action` брать из:
     - `req.query.action` (GET v2)
     - `req.body.action` (POST v2)
   - `payload` брать из:
     - `req.body.payload` (POST v2)
   - перестать использовать `data={"query":...}` (это только v1 legacy)

3) **Никаких пустых ответов (0 bytes)**:
   - если данных нет — вернуть `[]` или `{}` (но валидный JSON)
   - иначе фронт получает `null` и UI ломается/становится “пустым”

4) **Исправить `getScheduleMeta`** (сейчас `/schedule` отдаёт пустой ответ):
   - должно возвращать всех сотрудников и магазины (как в примере пользователя)
   - рекомендуемый формат: `{ "employees":[...], "stores":[...] }`

5) **Исправить `updateConfig`**:
   - сейчас workflow пишет ключ `action`, если он приходит в body
   - в v2 надо писать **только `payload`**, а `action` использовать только для роутинга

## Dated localization notes (live state unverified)

The workflow ID, webhook registration details, endpoint behavior, and reactivation advice below are historical claims, not current operational guidance. Verify live state through an explicitly requested, read-only n8n MCP inspection before taking action; publication or reactivation requires approval.

- n8n workflow: `localization` (`fJVdhXr3rGXg0TsB`)
- Webhook: `GET /localization`
- Front service: `API.getLocalizationDictionary(params, opts)` in `system/api.js`
- Route mapping: `getLocalizationDictionary -> webhookAction: localization`
- Bootstrap usage: `system/app.js` calls `preloadLocalizationDictionary()` during app startup.
- Runtime access helpers: `window.i18n(key, fallback)` and `window.i18nList(key, fallback)` in `system/system.js`.
- Runtime auto-localization: `window.localizeDomTree(root)` and `window.localizeUiText(text, fallback)` in `system/system.js`.
- `system/app.js` now calls `localizeDomTree()` for header and each loaded page, so static HTML and dynamic UI blocks can be translated without per-file rewrite.

Request example:

`GET /localization?lang=en&scope=ui`

Response shape:

```json
{
  "ok": true,
  "source": "n8n.localization",
  "version": "2026-03-09",
  "lang": "en",
  "scope": "ui",
  "translations": {
    "global.error.reload": "An error occurred. Please reload the page."
  }
}
```

Operational note:

- Production webhook registration depends on `webhookId` in the n8n node internals (current value in prod: `0bc22536-3a3e-4fcf-8ac9-a0b810d725b9`).
- If `/n8n/webhook/localization` starts returning `404 The requested webhook ... is not registered`, reactivate workflow `fJVdhXr3rGXg0TsB`.
