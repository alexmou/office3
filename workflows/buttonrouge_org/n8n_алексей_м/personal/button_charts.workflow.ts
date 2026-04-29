import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/charts
// Nodes   : 32  |  Connections: 24
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// GooglePerspective                  googlePerspective          [creds]
// StickyNote                         stickyNote
// GlobalConstants                    globalConstants            [creds]
// GetRowSInSheet                     googleSheets               [creds]
// Summarize                          summarize
// Merge                              merge
// JsonToArray                        code
// Webhook                            webhook
// StickyNote1                        stickyNote
// Stores                             aggregate
// SumFinalpricevnd                   aggregate
// RespondToWebhook1                  respondToWebhook
// MonthYear                          code
// Stores2                            aggregate
// Merge1                             merge
// SplitOut                           splitOut
// SplitOut1                          splitOut
// Merge2                             merge
// Node                               removeDuplicates
// Node1                              removeDuplicates
// EditFields                         set
// MonthYear1                         aggregate
// SumPrice                           aggregate
// EditFields1                        set
// Node2                              code
// Aggregate                          aggregate
// RespondToWebhook                   respondToWebhook
// Switch_                            switch
// Switch1                            switch
// Sort                               sort
// Sort1                              sort
// RespondToWebhook2                  respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Switch_
//      → GetRowSInSheet
//        → MonthYear
//          → Switch1
//            → RespondToWebhook
//           .out(1) → Node
//              → Sort
//                → SplitOut
//                  → EditFields
//                    → Merge2
//                      → Merge1
//                        → Node2
//                          → RespondToWebhook1
//           .out(1) → Node1
//              → SplitOut1
//                → Merge2.in(1) (↩ loop)
//           .out(1) → Sort1
//              → Summarize
//                → Merge1.in(1) (↩ loop)
//     .out(1) → RespondToWebhook2
// Stores
//    → Merge.in(3)
// SumFinalpricevnd
//    → Merge (↩ loop)
// MonthYear1
//    → Merge.in(1) (↩ loop)
// SumPrice
//    → Merge.in(2) (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'VSQwF8modN3kIuz9',
    name: 'button/charts',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ButtonChartsWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Google Perspective',
        type: 'n8n-nodes-base.googlePerspective',
        version: 1,
        position: [-1408, 2064],
        credentials: { googlePerspectiveOAuth2Api: { id: 'PPCEhmmQpMpufh39', name: 'Google Perspective account' } },
    })
    GooglePerspective = {
        text: 'хороший магазин  но я бы не пошел туда с тещей, она дура',
        requestedAttributesUi: {
            requestedAttributesValues: [
                {
                    attributeName: 'insult',
                },
            ],
        },
        options: {
            languages: 'ru',
        },
    };

    @node({
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-720, 432],
    })
    StickyNote = {
        content:
            '\t\nA rude, disrespectful, or unreasonable comment that is likely to make people leave a discussion.\n\nArabic (ar), Chinese (zh), Czech (cs), Dutch (nl), English (en), French (fr), German (de), Hindi (hi), Hinglish (hi-Latn), Indonesian (id), Italian (it), Japanese (ja), Korean (ko), Polish (pl), Portuguese (pt), Russian (ru), Spanish (es)\n\nSEVERE_TOXICITY\n\nA very hateful, aggressive, disrespectful comment or otherwise very likely to make a user leave a discussion or give up on sharing their perspective. This attribute is much less sensitive to more mild forms of toxicity, such as comments that include positive uses of curse words.\n\nde, en, es, fr, it, pt, ru\n\nIDENTITY_ATTACK\n\nNegative or hateful comments targeting someone because of their identity.\n\nde, en, es, fr, it, pt, ru \n\nINSULT\n\nInsulting, inflammatory, or negative comment towards a person or a group of people.\n\nde, en, es, fr, it, pt, ru\n\nPROFANITY\n\nSwear words, curse words, or other obscene or profane language.\n\nde, en, es, fr, it, pt, ru\n\nTHREAT\n\nDescribes an intention to inflict pain, injury, or violence against an individual or group.\n\nde, en, es, fr, it, pt, ru',
        height: 480,
    };

    @node({
        name: 'Global Constants',
        type: 'n8n-nodes-globals.globalConstants',
        version: 1,
        position: [-1408, 2576],
        credentials: { globalConstantsApi: { id: 'KrO4vlVCV8z6txE7', name: 'Global Constants account' } },
    })
    GlobalConstants = {};

    @node({
        name: 'Get row(s) in sheet',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.6,
        position: [-960, -16],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GetRowSInSheet = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1597077839,
            mode: 'list',
            cachedResultName: 'Sales',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k/edit#gid=1597077839',
        },
        options: {},
    };

    @node({
        name: 'Summarize',
        type: 'n8n-nodes-base.summarize',
        version: 1.1,
        position: [368, 160],
    })
    Summarize = {
        fieldsToSummarize: {
            values: [
                {
                    aggregation: 'sum',
                    field: 'finalPriceVND',
                },
                {
                    aggregation: 'sum',
                    field: 'price',
                },
                {
                    field: 'article',
                },
                {
                    aggregation: 'countUnique',
                    field: 'type',
                },
                {
                    aggregation: 'countUnique',
                    field: 'Brand',
                },
                {
                    aggregation: 'sum',
                    field: 'Profit',
                },
                {
                    aggregation: 'sum',
                    field: 'amount to supplier',
                },
            ],
        },
        fieldsToSplitBy: ' month_year , store',
        options: {},
    };

    @node({
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-1184, 1216],
    })
    Merge = {
        numberInputs: 4,
    };

    @node({
        name: 'json to array',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1408, 2320],
    })
    JsonToArray = {
        jsCode: "const EXCLUDE_FIELDS = ['row_number', 'dateConverted'];\n\nconst data = $input.all().map(item => item.json);\n\nconst allValues = data.map(obj => {\n  const filteredObj = Object.fromEntries(\n    Object.entries(obj).filter(([key]) => !EXCLUDE_FIELDS.includes(key))\n  );\n  return Object.values(filteredObj);\n});\n\nreturn [\n  {\n    json: {\n      values: allValues\n    }\n  }\n];\n",
    };

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1424, -208],
    })
    Webhook = {
        path: 'charts',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
            responseHeaders: {
                entries: [
                    {
                        name: 'Access-Control-Allow-Origin',
                        value: 'ALL',
                    },
                ],
            },
        },
    };

    @node({
        name: 'Sticky Note1',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-160, -688],
    })
    StickyNote1 = {
        content:
            'const labels=["май", "июнь", "июль", "август"]\nconst dataLabels=["Boho", "Urban"]\nconst data=[ [234, 345, 567, 568],[233, 566, 234, 766]]\ncreateChart(\'bar\',labels, data, \'Solar Panels\');',
        height: 100,
        width: 780,
        color: 6,
    };

    @node({
        name: 'stores',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-1408, 1536],
    })
    Stores = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: 'store',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'sum_finalPriceVND',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-1408, 944],
    })
    SumFinalpricevnd = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: 'sum_finalPriceVND',
                    renameField: true,
                    outputFieldName: 'finalPriceVND',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook1',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [1024, -16],
    })
    RespondToWebhook1 = {
        respondWith: 'allIncomingItems',
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

    @node({
        name: 'FilterReturns',
        type: 'n8n-nodes-base.filter',
        version: 2,
        position: [-848, -16],
    })
    FilterReturns = {
        conditions: {
            options: { caseSensitive: false, leftValue: '', typeValidation: 'loose', version: 2 },
            conditions: [{
                id: 'filter-is-return',
                leftValue: '={{ $json.is_return }}',
                rightValue: 'TRUE',
                operator: { type: 'string', operation: 'notEquals', name: 'filter.operator.notEquals' },
            }],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Добавляем month_year',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-736, -16],
    })
    MonthYear = {
        jsCode: "for (const item of $input.all()) {\n  let monthName;\n  const monthNum = item.json.month.toString();\n  \n  switch (monthNum) {\n    case '1':\n      monthName = 'Янв';\n      break;\n    case '2':\n      monthName = 'Фев';\n      break;\n    case '3':\n      monthName = 'Мар';\n      break;\n    case '4':\n      monthName = 'Апр';\n      break;\n    case '5':\n      monthName = 'Май';\n      break;\n    case '6':\n      monthName = 'Июн';\n      break;\n    case '7':\n      monthName = 'Июл';\n      break;\n    case '8':\n      monthName = 'Авг';\n      break;\n    case '9':\n      monthName = 'Сен';\n      break;\n    case '10':\n      monthName = 'Окт';\n      break;\n    case '11':\n      monthName = 'Ноя';\n      break;\n    case '12':\n      monthName = 'Дек';\n      break;\n    default:\n      monthName = 'Некорректный месяц';\n  }\n\n  item.json.month_year = `${monthName} ${item.json.year.toString()}`;\n}\n\nreturn $input.all();",
    };

    @node({
        name: 'stores2',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-1408, 688],
    })
    Stores2 = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: 'store',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Merge1',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [592, -16],
    })
    Merge1 = {
        mode: 'combine',
        fieldsToMatchString: 'month_year, store',
        joinMode: 'enrichInput1',
        options: {},
    };

    @node({
        name: 'Split Out',
        type: 'n8n-nodes-base.splitOut',
        version: 1,
        position: [-16, -304],
    })
    SplitOut = {
        fieldToSplitOut: 'month_year',
        options: {},
    };

    @node({
        name: 'Split Out1',
        type: 'n8n-nodes-base.splitOut',
        version: 1,
        position: [144, -16],
    })
    SplitOut1 = {
        fieldToSplitOut: 'store',
        options: {},
    };

    @node({
        name: 'Merge2',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [368, -128],
    })
    Merge2 = {
        mode: 'combine',
        combineBy: 'combineAll',
        options: {},
    };

    @node({
        name: 'Уникальные значения для месяцев',
        type: 'n8n-nodes-base.removeDuplicates',
        version: 2,
        position: [-304, -224],
    })
    Node = {
        compare: 'selectedFields',
        fieldsToCompare: 'month_year',
        options: {
            removeOtherFields: false,
        },
    };

    @node({
        name: 'Уникальные значения для названий магазинов',
        type: 'n8n-nodes-base.removeDuplicates',
        version: 2,
        position: [-80, -16],
    })
    Node1 = {
        compare: 'selectedFields',
        fieldsToCompare: 'store',
        options: {
            removeOtherFields: false,
        },
    };

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [144, -224],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: '00e683d7-b313-4396-b1e1-7fb38b3e8494',
                    name: 'sum_finalPriceVND',
                    value: '',
                    type: 'string',
                },
                {
                    id: '9ee1e8c7-d442-4936-b584-9d5ea6e748d1',
                    name: 'sum_price',
                    value: '',
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'month_year',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-1408, 1344],
    })
    MonthYear1 = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: 'month_year',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'sum_price',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-1408, 1136],
    })
    SumPrice = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: 'sum_price',
                    renameField: true,
                    outputFieldName: 'price',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Edit Fields1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1408, 416],
    })
    EditFields1 = {
        assignments: {
            assignments: [
                {
                    id: 'f7ebd2c9-ae5a-41ab-ae8f-cf1a1c61d5c4',
                    name: '',
                    value: "={{ $('Webhook').item.json.query.data.parseJson().query.groupByField\n\n}}",
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'группируем по полю из запроса',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [800, -16],
    })
    Node2 = {
        jsCode: "// --- настройка ------------------------\n\n            \n var FIELD\nif( $('Webhook').isExecuted) {\n  FIELD = JSON.parse($('Webhook').item.json.query.data).query.groupByField\n} else\n{\n  FIELD = \"store\"\n}\n\n// Run Once for All Items\nconst groups = {};\nfor (const item of $input.all()) {\n  const key = item.json[FIELD];              // динамическое обращение\n  (groups[key] ??= []).push(item.json);      // сохраняем полную запись\n}\n\n// превращаем группы в выходные items\nreturn Object.entries(groups).map(([key, items]) => ({\n  json: { [FIELD]: key, items }              // ключ создаётся через [] \n}));\n",
    };

    @node({
        name: 'Aggregate',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-1408, 1808],
    })
    Aggregate = {
        aggregate: 'aggregateAllItemData',
        destinationFieldName: '=finalPriceVND',
        options: {},
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-96, -480],
    })
    RespondToWebhook = {
        respondWith: 'allIncomingItems',
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

    @node({
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-1200, -208],
    })
    Switch_ = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: '={{ JSON.parse($json.query.data).query.action }}',
                                rightValue: 'getChartsData',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                                id: '50880f5c-2526-4969-9728-daa1323817a4',
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'getChartsData',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: '9628cbfb-7a94-4ab1-9f5b-a5e15037c27a',
                                leftValue: '={{ $json.query.action }}',
                                rightValue: 'getChartsSummary',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                    name: 'filter.operator.equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: '=getChartsSummary',
                },
            ],
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        name: 'Switch1',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-528, -16],
    })
    Switch1 = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: "={{ JSON.parse($('Webhook').item.json.query.data).query.groupByField }}",
                                rightValue: '',
                                operator: {
                                    type: 'string',
                                    operation: 'empty',
                                    singleValue: true,
                                },
                                id: '50880f5c-2526-4969-9728-daa1323817a4',
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'No group',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: false,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: '0e500b0e-fe9d-4597-87eb-7d6061c6717f',
                                leftValue: "={{ JSON.parse($('Webhook').item.json.query.data).query.groupByField }}",
                                rightValue: '',
                                operator: {
                                    type: 'string',
                                    operation: 'notEmpty',
                                    singleValue: true,
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'GroupByField',
                },
            ],
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        name: 'Sort',
        type: 'n8n-nodes-base.sort',
        version: 1,
        position: [-144, -336],
    })
    Sort = {
        sortFieldsUi: {
            sortField: [
                {
                    fieldName: 'year',
                },
                {
                    fieldName: 'month',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Sort1',
        type: 'n8n-nodes-base.sort',
        version: 1,
        position: [-144, 192],
    })
    Sort1 = {
        sortFieldsUi: {
            sortField: [
                {
                    fieldName: 'year',
                },
                {
                    fieldName: 'month',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook2',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-1056, 160],
    })
    RespondToWebhook2 = {
        respondWith: 'json',
        responseBody:
            '{\n  "dateISO": "2026-02-21",\n  "today": {\n    "dateISO": "2026-02-21",\n    "rows": [\n      { "brand": "BUTTON ROUGE", "count": 10, "revenue": 8930000, "profit": 8508740 },\n      { "brand": "CULT accessories", "count": 1, "revenue": 250000, "profit": 75000 },\n      { "brand": "Linh Vu", "count": 4, "revenue": 3950000, "profit": 1166300 }\n    ]\n  },\n  "month": {\n    "monthISO": "2026-02",\n    "cards": [\n      {\n        "title": "Доход текущий месяц",\n        "tone": "green",\n        "total": 303123000,\n        "items": [\n          { "label": "От BUTTON ROUGE", "value": 188075000 },\n          { "label": "От других брендов", "value": 115048000 }\n        ]\n      },\n      {\n        "title": "Расходы",\n        "tone": "red",\n        "total": 98027138,\n        "items": [\n          { "label": "Терминал", "value": 1816458 },\n          { "label": "Поставщикам (не оплачено)", "value": 77017250 },\n          { "label": "Долг (нач. месяца)", "value": 8621000 },\n          { "label": "Тек. месяц", "value": 68396250 },\n          { "label": "Оплачено", "value": 0 }\n        ]\n      },\n      {\n        "title": "Зарплата сотрудникам",\n        "tone": "red",\n        "total": 19193430,\n        "items": [\n          { "label": "Фикс", "value": 7350000 },\n          { "label": "Проценты", "value": 11843430 }\n        ]\n      },\n      { "title": "Выручка", "tone": "green", "total": 205095862 },\n      {\n        "title": "Прибыль текущего месяца (без фикс. зарплаты)",\n        "tone": "purple",\n        "total": 216515910\n      }\n    ]\n  }\n}\n',
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
        this.GetRowSInSheet.out(0).to(this.FilterReturns.in(0));
        this.FilterReturns.out(0).to(this.MonthYear.in(0));
        this.Summarize.out(0).to(this.Merge1.in(1));
        this.Webhook.out(0).to(this.Switch_.in(0));
        this.Stores.out(0).to(this.Merge.in(3));
        this.SumFinalpricevnd.out(0).to(this.Merge.in(0));
        this.MonthYear.out(0).to(this.Switch1.in(0));
        this.SplitOut.out(0).to(this.EditFields.in(0));
        this.SplitOut1.out(0).to(this.Merge2.in(1));
        this.Merge2.out(0).to(this.Merge1.in(0));
        this.Node.out(0).to(this.Sort.in(0));
        this.Node1.out(0).to(this.SplitOut1.in(0));
        this.EditFields.out(0).to(this.Merge2.in(0));
        this.Merge1.out(0).to(this.Node2.in(0));
        this.MonthYear1.out(0).to(this.Merge.in(1));
        this.SumPrice.out(0).to(this.Merge.in(2));
        this.Node2.out(0).to(this.RespondToWebhook1.in(0));
        this.Switch_.out(0).to(this.GetRowSInSheet.in(0));
        this.Switch_.out(1).to(this.RespondToWebhook2.in(0));
        this.Switch1.out(0).to(this.RespondToWebhook.in(0));
        this.Switch1.out(1).to(this.Node.in(0));
        this.Switch1.out(1).to(this.Node1.in(0));
        this.Switch1.out(1).to(this.Sort1.in(0));
        this.Sort.out(0).to(this.SplitOut.in(0));
        this.Sort1.out(0).to(this.Summarize.in(0));
    }
}
