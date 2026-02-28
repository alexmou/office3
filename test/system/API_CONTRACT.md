# API contract (frontend ↔ n8n)

Фронт работает в двух режимах (переключается настройкой в `CONFIG`):

- **v1 (legacy)** — текущий прод: GET через `?data={"query":...}`; часть POST использует raw-body и `?action=...`.
- **v2 (universal)** — целевой режим: единый формат, без `data.query.*`, без raw-body, без `webhookAction` с `?action=...`.

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

## Что нужно изменить в n8n (обязательное)

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

