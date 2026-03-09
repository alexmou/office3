import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : localization
// Nodes   : 3  |  Connections: 2
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// BuildDictionary                    code
// RespondToWebhook                   respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → BuildDictionary
//      → RespondToWebhook
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'fJVdhXr3rGXg0TsB',
    name: 'localization',
    active: true,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: false },
})
export class LocalizationWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [-420, 0],
    })
    Webhook = {
        httpMethod: 'GET',
        path: 'localization',
        authentication: 'none',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'Build Dictionary',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-120, 0],
    })
    BuildDictionary = {
        mode: 'runOnceForAllItems',
        language: 'javaScript',
        jsCode: "\nconst input = $input.first()?.json || {};\nconst query = input.query || {};\nconst body = input.body || {};\n\nlet legacyQuery = {};\nif (typeof query.data === 'string' && query.data.trim()) {\n  try {\n    const parsed = JSON.parse(query.data);\n    legacyQuery = parsed?.query || parsed || {};\n  } catch (_) {\n    legacyQuery = {};\n  }\n}\n\nconst mergedQuery = { ...legacyQuery, ...query };\nconst mergedBody = { ...body };\n\nconst langRaw = mergedQuery.lang ?? mergedBody.lang ?? 'en';\nconst lang = String(langRaw || 'en').trim().toLowerCase();\nconst scope = String(mergedQuery.scope ?? mergedBody.scope ?? 'ui').trim().toLowerCase();\nconst page = mergedQuery.page ?? mergedBody.page ?? null;\nconst namespace = mergedQuery.namespace ?? mergedBody.namespace ?? null;\n\nconst baseDictionaries = {\n  en: {\n    'global.error.reload': 'An error occurred. Please reload the page.',\n    'auth.error.invalidCredentials': 'Invalid username or password',\n    'auth.error.authorization': 'Authorization error',\n    'auth.error.storesLoad': 'Failed to load stores list',\n    'ui.common.save': 'Save',\n    'ui.common.cancel': 'Cancel',\n    'ui.common.delete': 'Delete',\n    'ui.schedule.month.current': 'Current month',\n    'ui.schedule.month.prevYear': 'Previous year',\n    'ui.schedule.month.nextYear': 'Next year',\n    'ui.schedule.store.all': 'All stores',\n  },\n  ru: {\n    'global.error.reload': 'Произошла ошибка. Перезагрузите страницу',\n    'auth.error.invalidCredentials': 'Неверный логин или пароль',\n    'auth.error.authorization': 'Ошибка авторизации',\n    'auth.error.storesLoad': 'Ошибка загрузки списка магазинов',\n    'ui.common.save': 'Сохранить',\n    'ui.common.cancel': 'Отмена',\n    'ui.common.delete': 'Удалить',\n    'ui.schedule.month.current': 'Текущий месяц',\n    'ui.schedule.month.prevYear': 'Предыдущий год',\n    'ui.schedule.month.nextYear': 'Следующий год',\n    'ui.schedule.store.all': 'Все магазины',\n  },\n};\n\nconst textDictionaryEn = {\n  'Администрирование складов': 'Warehouse administration',\n  'Нет товаров для отображения': 'No products to display',\n  'Перетащить': 'Drag',\n  'Сохранить': 'Save',\n  'Сохранить изменения': 'Save changes',\n  'Скрывать отсутствующие': 'Hide out-of-stock items',\n  'Фильтр по всем полям': 'Filter by all fields',\n  '+ Добавить товар': '+ Add item',\n  'Склад 1': 'Warehouse 1',\n  'Склад 2': 'Warehouse 2',\n  'Перенос товара': 'Transfer item',\n  'Введите количество (макс.': 'Enter quantity (max.',\n  'Отмена': 'Cancel',\n  'Подтвердить': 'Confirm',\n  'Редактировать ценник': 'Edit tag',\n  'Сохранить на будущее': 'Save for later',\n  'Сначала выделите ценник!': 'Select a tag first!',\n  'Тип ценника не найден': 'Tag type not found',\n  'Бюджет магазина': 'Store budget',\n  'Свод по месяцам': 'Monthly summary',\n  'Редактирование — только строки с флагом editable: true. Все пересчёты локально; отправка на сервер — по кнопке «Сохранить».': 'Editing is available only for rows with editable: true. All recalculations are local; send to server using Save.',\n  'Операция с Кассой': 'Cash operation',\n  'Тип операции': 'Operation type',\n  'Статья расходов': 'Expense category',\n  'Сумма': 'Amount',\n  'Отправить': 'Submit',\n  'Расход': 'Expense',\n  'Приход': 'Income',\n  'Не удалось загрузить словарь для кассы': 'Failed to load cash dictionary',\n  'Операции кассы не найдены': 'Cash operations not found',\n  'Не удалось загрузить список операций кассы': 'Failed to load cash operations list',\n  'Форма кассы не готова. Обновите страницу и повторите.': 'Cash form is not ready. Reload page and retry.',\n  'Операция в кассе зарегистрирована': 'Cash operation registered',\n  'Не удалось записать операцию в кассу': 'Failed to save cash operation',\n  'Сейчас в кассе': 'Cash in register now',\n  'Поиск по каталогу...': 'Search catalog...',\n  'показывать товар в наличии': 'show in-stock items',\n  'Поиск по продажам...': 'Search sales...',\n  'Предыдущий месяц': 'Previous month',\n  'Следующий месяц': 'Next month',\n  'Месяц': 'Month',\n  'Магазин': 'Store',\n  'Магазин:': 'Store:',\n  'Сотрудник': 'Employee',\n  'Часы работы': 'Work hours',\n  'Заметка': 'Note',\n  'Добавить статью': 'Add item',\n  'Закрыть': 'Close',\n  'Расходы': 'Expenses',\n  'Оплачено': 'Paid',\n  'Выберите статью для добавления': 'Select item to add',\n  'Добавить': 'Add',\n  'Каталог': 'Catalog',\n  'Расчет зарплаты': 'Salary calculation',\n  'Пользователи и роли': 'Users and roles',\n  'Произошла ошибка. Пожалуйста, попробуйте снова.': 'An error occurred. Please try again.',\n  'Ошибка загрузки списка магазинов': 'Failed to load stores list',\n  'Неверный логин или пароль': 'Invalid username or password',\n  'Ошибка авторизации: некорректный ответ': 'Authorization error: invalid response',\n  'Ошибка авторизации': 'Authorization error',\n  'Не удалось определить пользователя для расчёта зарплаты': 'Could not determine user for salary calculation',\n  'Статистика по продажам': 'Sales statistics',\n  'Откройте приложение через HTTP-сервер (не file://), иначе загрузка страниц и header через fetch будет заблокирована.': 'Open app via an HTTP server (not file://), otherwise fetch for pages/header is blocked.',\n  'ERROR. НЕ УДАЛОСЬ ПОЛУЧИТЬ ДАННЫЕ С СЕРВЕРА': 'ERROR. FAILED TO LOAD DATA FROM SERVER',\n  'Внесение данных в бюджет': 'Budget data entry',\n  'ФАКТ': 'ACTUAL',\n  'ПРОГНОЗ': 'FORECAST',\n  'Янв': 'Jan',\n  'Фев': 'Feb',\n  'Мар': 'Mar',\n  'Апр': 'Apr',\n  'Май': 'May',\n  'Июн': 'Jun',\n  'Июл': 'Jul',\n  'Авг': 'Aug',\n  'Сен': 'Sep',\n  'Окт': 'Oct',\n  'Ноя': 'Nov',\n  'Дек': 'Dec',\n};\n\nconst dictionaries = {\n  en: {\n    ...baseDictionaries.en,\n    ...textDictionaryEn,\n  },\n  ru: {\n    ...baseDictionaries.ru,\n  },\n};\n\nconst fallbackLang = 'en';\nconst effectiveLang = Object.prototype.hasOwnProperty.call(dictionaries, lang) ? lang : fallbackLang;\n\nreturn [\n  {\n    json: {\n      ok: true,\n      source: 'n8n.localization',\n      version: '2026-03-09.2',\n      lang: effectiveLang,\n      requestedLang: lang,\n      scope,\n      page,\n      namespace,\n      translations: dictionaries[effectiveLang],\n      meta: {\n        hasLegacyDataWrapper: typeof query.data === 'string',\n      },\n    },\n  },\n];\n",
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [160, 0],
    })
    RespondToWebhook = {
        respondWith: 'json',
        responseBody: '={{ $json }}',
        options: {
            responseHeaders: {
                entries: [
                    {
                        name: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                ],
            },
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.BuildDictionary.in(0));
        this.BuildDictionary.out(0).to(this.RespondToWebhook.in(0));
    }
}
