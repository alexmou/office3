import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/budget
// Nodes   : 44  |  Connections: 47
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// Switch_                            switch
// WhenClickingTestWorkflow           manualTrigger
// Webhook2                           webhook
// Getstoreid                         googleSheets               [creds]
// Getstorename                       googleSheets               [creds]
// RespondToWebhook4                  respondToWebhook
// Jsondatabase                       JsonDatabase
// Jsondatabase1                      JsonDatabase
// RespondToWebhook                   respondToWebhook
// EditFields1                        set
// Getbudget                          googleSheets               [creds]
// EditFields3                        set
// Node                               code
// RespondToWebhook7                  respondToWebhook
// Merge                              merge
// Node1                              googleSheets               [creds]
// Node2                              googleSheets               [creds]
// Sort                               sort
// EditFields2                        set
// EditFields4                        set
// EditFields5                        set
// DateTime                           dateTime
// Getmonthssummary                   googleSheets               [creds]
// _1                                 code
// EditFields6                        set
// RespondToWebhook8                  respondToWebhook
// Getbudget1                         googleSheets               [creds]
// RenameKeys                         renameKeys
// SplitOut1                          splitOut
// LoopOverItems                      splitInBatches
// EditFields9                        set
// Merge1                             merge
// Aggregate                          aggregate
// RespondToWebhook9                  respondToWebhook
// NewOrEdit                          if
// EditFields10                       set
// Getbudget4                         googleSheets               [creds]
// EditFields7                        set
// Aggregate1                         aggregate
// EditFields8                        set
// RespondToWebhook10                 respondToWebhook
// AppendRow                          googleSheets               [creds]
// UpdateRow                          googleSheets               [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Switch_
//      → Getbudget
//        → EditFields5
//          → Merge
//            → EditFields3
//              → DateTime
//                → Sort
//                  → Node
//                    → RespondToWebhook7
//      → Node1
//        → EditFields2
//          → Merge.in(1) (↩ loop)
//      → Node2
//        → EditFields4
//          → Merge.in(2) (↩ loop)
//     .out(1) → Getstoreid
//        → Getstorename
//          → RespondToWebhook4
//     .out(2) → Getmonthssummary
//        → EditFields6
//          → _1
//            → RespondToWebhook8
//     .out(3) → SplitOut1
//        → RenameKeys
//          → LoopOverItems
//            → NewOrEdit
//              → EditFields10
//                → AppendRow
//                  → RespondToWebhook9
//             .out(1) → EditFields9
//                → UpdateRow
//                  → RespondToWebhook9 (↩ loop)
//           .out(1) → Merge1.in(1)
//              → Aggregate
//                → LoopOverItems (↩ loop)
//           .out(1) → Getbudget1
//              → Merge1 (↩ loop)
//     .out(4) → Getbudget4
//        → EditFields7
//          → Aggregate1
//            → EditFields8
//              → RespondToWebhook10
// WhenClickingTestWorkflow
//    → Getmonthssummary (↩ loop)
// Webhook2
//    → Switch_ (↩ loop)
// EditFields1
//    → Jsondatabase
//      → Jsondatabase1
//        → RespondToWebhook
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'jyqgaRvgPCMMLPjZ',
    name: 'button/budget',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ButtonBudgetWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-2496, 320],
    })
    Webhook = {
        path: 'budget',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
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
        position: [-2304, 400],
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
                                rightValue: 'getBudgetData',
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
                    outputKey: 'getBudgetData',
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
                                id: 'da5fa65a-6254-49d6-93e6-f86c86bda713',
                                leftValue: '={{ JSON.parse($json.query.data).query.action }}',
                                rightValue: 'updateBudget',
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
                    outputKey: 'updateBudget',
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
                                id: '641db672-1c99-48ce-9a1a-a16d5f0a2dd4',
                                leftValue: '={{ JSON.parse($json.query.data).query.action }}',
                                rightValue: 'getMonthsSummary',
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
                    outputKey: 'getMonthsSummary',
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
                                id: '8ad9c35b-be41-40a6-9313-bd5bdefa118a',
                                leftValue: '={{ $json.query.action }}',
                                rightValue: 'saveBudgetChanges',
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
                    outputKey: 'saveBudgetChanges',
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
                                id: 'a0a5acd0-05f1-4658-bfe2-77ee02c88b76',
                                leftValue: '={{ JSON.parse($json.query.data).query.action }}',
                                rightValue: 'getVocabulary',
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
                    outputKey: 'getVocabulary',
                },
            ],
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        name: 'When clicking ‘Test workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-2496, 128],
    })
    WhenClickingTestWorkflow = {};

    @node({
        name: 'Webhook2',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-2496, 480],
    })
    Webhook2 = {
        httpMethod: 'POST',
        path: 'budget',
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
        name: 'getStoreId',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1056, 848],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getstoreid = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1369313038,
            mode: 'list',
            cachedResultName: 'Authorization',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=1369313038',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'token',
                    lookupValue: '={{ $json.query.data.parseJson().query.token }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getStoreName',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-880, 848],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getstorename = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1090132997,
            mode: 'list',
            cachedResultName: 'stores',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=1090132997',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'storeId',
                    lookupValue: '={{ $json.store }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook4',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-640, 848],
    })
    RespondToWebhook4 = {
        respondWith: 'json',
        responseBody: '{\n  "ok": true\n}',
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
        name: 'JsonDatabase',
        type: '@n-octo-n/n8n-nodes-json-database.JsonDatabase',
        version: 1,
        position: [-896, 1840],
    })
    Jsondatabase = {
        operation: 'opWrite',
        queryPath: '=settings',
        sourceType: 'sourceTypeJson',
        sourceData: '={{ JSON.stringify($json) }}',
    };

    @node({
        name: 'JsonDatabase1',
        type: '@n-octo-n/n8n-nodes-json-database.JsonDatabase',
        version: 1,
        position: [-576, 1824],
    })
    Jsondatabase1 = {
        queryPath: 'settings',
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.4,
        position: [-240, 1760],
    })
    RespondToWebhook = {
        options: {},
    };

    @node({
        name: 'Edit Fields1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1200, 1968],
    })
    EditFields1 = {
        assignments: {
            assignments: [
                {
                    id: '669640f7-0ad5-4105-9831-e25b2d7f4372',
                    name: 'currentPageName_Alex',
                    value: 'cashregister',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getBudget',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1936, -128],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getbudget = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '=1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1236634822,
            mode: 'list',
            cachedResultName: 'Budget',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M/edit#gid=1236634822',
        },
        options: {
            outputFormatting: {
                values: {
                    general: 'UNFORMATTED_VALUE',
                    date: 'FORMATTED_STRING',
                },
            },
        },
    };

    @node({
        name: 'Edit Fields3',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-720, 208],
    })
    EditFields3 = {
        assignments: {
            assignments: [
                {
                    id: '884097fc-69f0-406f-8700-1cd3d96ef8cd',
                    name: 'outcome',
                    value: "=\n{{(()=>{\nif ($json['Тип']==\"Расход\") {\n\n  return $json['Сумма']\n} else {return 0}\n\n\n})()}}",
                    type: 'number',
                },
                {
                    id: 'ee1aeeb2-c52d-437d-869c-c7578eeab0d7',
                    name: 'paid',
                    value: '=\n{{(()=>{\nif ($json[\'Вид\']=="Не оплачено") {\n\n  return 0\n} else {return 1}\n\n\n})()}}',
                    type: 'boolean',
                },
                {
                    id: '976df001-e11a-4f7f-ac73-913b639556ae',
                    name: 'year-month',
                    value: "={{ $json['Год'] }}-{{ $json['Месяц'] }}-01",
                    type: 'string',
                },
                {
                    id: '1bac8c80-f4da-4612-b653-bdd924282c0b',
                    name: 'income',
                    value: "=\n{{(()=>{\nif ($json['Тип']==\"Доход\") {\n\n  return $json['Сумма']\n} else {return 0}\n\n\n})()}}",
                    type: 'number',
                },
                {
                    id: '023a967a-b7fb-4ac9-9e1f-fb39a5510fcf',
                    name: 'comment',
                    value: "={{$json['Комментарий']}}",
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'В формат фронта',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-144, 64],
    })
    Node = {
        jsCode: "// n8n Code node (Run Once for All Items)\n\nconst rows = $input.all().map(i => i.json);\n\nconst pad2 = n => String(n).padStart(2, '0');\nconst normMonth = (ym) => {\n  const parts = String(ym).split(\"-\");\n  if (parts.length >= 2) {\n    const y = parts[0];\n    const m = pad2(parseInt(parts[1], 10));\n    return `${y}-${m}-01`;\n  }\n  const d = new Date(ym);\n  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-01`;\n};\n\nconst out = {}; // { \"YYYY-MM-01\": { \"Статья расходов\": { fact, forecast, editable, paid } } }\n\nfor (const r of rows) {\n  if (!r['year-month']) continue;\n\n  const monthKey = normMonth(r['year-month']);\n  const cat = String(r['Статья расходов'] ?? 'Прочее').trim() || 'Прочее';\n\n  out[monthKey] ??= {};\n  out[monthKey][cat] ??= { outcome: 0, income: 0, editable: false, paid: false };\n\n  //const income = Number(r['Тип']==\"Доход\" ?? r['Сумма'] ?? 0) || 0;\n  // const outcome = Number(r['Тип']==\"Расход\" ?? r['Сумма'] ?? 0) || 0;\n\n  out[monthKey][cat].income += Number(r.income);\n  out[monthKey][cat].outcome += Number(r.outcome);\n  //if (r.editable === true) out[monthKey][cat].editable = true;\n  out[monthKey][cat].editable=r.editable\n  out[monthKey][cat].comment=r.comment\n  if (r.paid === true) out[monthKey][cat].paid = true;\n}\n\nreturn [{ json: out }];\n",
    };

    @node({
        name: 'Respond to Webhook7',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [80, 64],
    })
    RespondToWebhook7 = {
        respondWith: 'text',
        responseBody: '={{ $json.toJsonString() }}',
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
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-1008, 272],
    })
    Merge = {
        numberInputs: 3,
    };

    @node({
        name: 'Терминал',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1888, 128],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Node1 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '=1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1812609692,
            mode: 'list',
            cachedResultName: 'n8n-терминал',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M/edit#gid=1812609692',
        },
        options: {
            outputFormatting: {
                values: {
                    general: 'UNFORMATTED_VALUE',
                    date: 'FORMATTED_STRING',
                },
            },
        },
    };

    @node({
        name: 'Поставщики',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1856, 320],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Node2 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1958659397,
            mode: 'list',
            cachedResultName: 'n8n-Поставщики',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M/edit#gid=1958659397',
        },
        options: {
            outputFormatting: {
                values: {
                    general: 'UNFORMATTED_VALUE',
                    date: 'FORMATTED_STRING',
                },
            },
        },
    };

    @node({
        name: 'Sort',
        type: 'n8n-nodes-base.sort',
        version: 1,
        position: [-336, 64],
    })
    Sort = {
        sortFieldsUi: {
            sortField: [
                {
                    fieldName: 'Статья расходов',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Edit Fields2',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1328, 288],
    })
    EditFields2 = {
        assignments: {
            assignments: [
                {
                    id: 'f94279c3-4847-4186-9c1e-ce5f984b599e',
                    name: 'editable',
                    value: false,
                    type: 'boolean',
                },
                {
                    id: 'eb5abad8-8da4-4d18-b9af-86fe7128b52f',
                    name: 'Тип',
                    value: 'Расход',
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Edit Fields4',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1248, 464],
    })
    EditFields4 = {
        assignments: {
            assignments: [
                {
                    id: 'f94279c3-4847-4186-9c1e-ce5f984b599e',
                    name: 'editable',
                    value: false,
                    type: 'boolean',
                },
                {
                    id: '6542744a-a99f-4fb4-a139-68f3b6bb73f3',
                    name: 'Тип',
                    value: 'Расход',
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Edit Fields5',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1328, -48],
    })
    EditFields5 = {
        assignments: {
            assignments: [
                {
                    id: 'f94279c3-4847-4186-9c1e-ce5f984b599e',
                    name: 'editable',
                    value: true,
                    type: 'boolean',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Date & Time',
        type: 'n8n-nodes-base.dateTime',
        version: 2,
        position: [-544, 64],
    })
    DateTime = {
        operation: 'formatDate',
        date: '={{ $json["year-month"] }}',
        format: 'yyyy-MM-dd',
        options: {
            includeInputFields: true,
        },
    };

    @node({
        name: 'getMonthsSummary',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1680, 848],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getmonthssummary = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 631924754,
            mode: 'list',
            cachedResultName: 'n8n-getMonthsSummary',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M/edit#gid=631924754',
        },
        options: {},
    };

    @node({
        name: 'В формат фронта1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1296, 912],
    })
    _1 = {
        jsCode: "// n8n Code node (Run Once for All Items)\n\nconst rows = $input.all().map(i => i.json);\n\nconst pad2 = n => String(n).padStart(2, '0');\nconst normMonth = (ym) => {\n  const parts = String(ym).split(\"-\");\n  if (parts.length >= 2) {\n    const y = parts[0];\n    const m = pad2(parseInt(parts[1], 10));\n    return `${y}-${m}-01`;\n  }\n  const d = new Date(ym);\n  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-01`;\n};\n\nconst out = {}; // { \"YYYY-MM-01\": { \"Статья расходов\": { fact, forecast, editable, paid } } }\n\nfor (const r of rows) {\n  if (!r['year-month']) continue;\n\n  const monthKey = normMonth(r['year-month']);\n  //const cat = String(r['Статья расходов'] ?? 'Прочее').trim() || 'Прочее';\n\n  out[monthKey] ??= {};\n  //out[monthKey] ??= { fact: 0, forecast: 0, editable: false, paid: false };\n\n  const income = Number( r['income'] ?? 0) || 0;\n  const outcome = Number(r['outcome']  ?? 0) || 0;\n  const profit = Number(r['Остаток']  ?? 0) || 0;\n\n  out[monthKey].income = income;\n  out[monthKey].outcome = outcome;\n    out[monthKey].profit = profit;\n  if (r.paid === true) out[monthKey].paid = true;\n}\n\nreturn [{ json: out }];\n",
    };

    @node({
        name: 'Edit Fields6',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1488, 832],
    })
    EditFields6 = {
        assignments: {
            assignments: [
                {
                    id: 'f94279c3-4847-4186-9c1e-ce5f984b599e',
                    name: 'year-month',
                    value: '={{ $json["Год"]+"-"+$json["Месяц"]}}-01',
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Respond to Webhook8',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-560, 1072],
    })
    RespondToWebhook8 = {
        respondWith: 'text',
        responseBody: '={{ $json.toJsonString() }}',
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
        name: 'getBudget1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1456, 1520],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getbudget1 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '=1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1236634822,
            mode: 'list',
            cachedResultName: 'Budget',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M/edit#gid=1236634822',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'Год',
                    lookupValue: '={{ $json.month.toDateTime().extract("year") }}',
                },
                {
                    lookupColumn: 'Месяц',
                    lookupValue: '={{ $json.month.toDateTime().extract("month") }}',
                },
                {
                    lookupColumn: 'Статья расходов',
                    lookupValue: '={{ $json["Статьяя расходов"] }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Rename Keys',
        type: 'n8n-nodes-base.renameKeys',
        version: 1,
        position: [-2256, 1120],
    })
    RenameKeys = {
        keys: {
            key: [
                {
                    currentKey: 'article',
                    newKey: 'Статьяя расходов',
                },
                {
                    currentKey: 'outcome',
                    newKey: 'Sum',
                },
            ],
        },
        additionalOptions: {},
    };

    @node({
        name: 'Split Out1',
        type: 'n8n-nodes-base.splitOut',
        version: 1,
        position: [-2496, 1104],
    })
    SplitOut1 = {
        fieldToSplitOut: 'body',
        options: {},
    };

    @node({
        name: 'Loop Over Items',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-1984, 1328],
    })
    LoopOverItems = {
        options: {},
    };

    @node({
        name: 'Edit Fields9',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1456, 1280],
    })
    EditFields9 = {
        assignments: {
            assignments: [
                {
                    id: '1b165228-23f1-4d21-b145-de831e5a6813',
                    name: 'Сумма',
                    value: '={{ $json[""][1].Sum }}',
                    type: 'number',
                },
                {
                    id: 'b63a7d95-2107-45aa-a606-d7377bd1f847',
                    name: 'row_number',
                    value: '={{ $json[""][0].row_number }}',
                    type: 'number',
                },
                {
                    id: 'c9835808-0392-425c-a3b7-fc7c8e0957db',
                    name: 'Вид',
                    value: '={{$json[""][1].paid  ? "Оплачено" : "Не оплачено" }}',
                    type: 'string',
                },
                {
                    id: 'd787a783-857c-46a8-b172-2bf2229e5ebf',
                    name: 'Комментарий',
                    value: '={{ $json[""][1]["comment"] }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Merge1',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-1296, 1408],
    })
    Merge1 = {};

    @node({
        name: 'Aggregate',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-1040, 1552],
    })
    Aggregate = {
        aggregate: 'aggregateAllItemData',
        destinationFieldName: '',
        options: {},
    };

    @node({
        name: 'Respond to Webhook9',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-704, 1344],
    })
    RespondToWebhook9 = {
        respondWith: 'text',
        responseBody: '={{ $json.toJsonString() }}',
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
        name: 'New_Or_Edit?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-1728, 1168],
    })
    NewOrEdit = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: '8d3efa5b-1c1c-4e02-b539-883af157ad64',
                    leftValue: '={{ $json[""][0].newArticle }}',
                    rightValue: '',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Edit Fields10',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1504, 1104],
    })
    EditFields10 = {
        assignments: {
            assignments: [
                {
                    id: '1b165228-23f1-4d21-b145-de831e5a6813',
                    name: 'Сумма',
                    value: '={{ $json[""][0].Sum }}',
                    type: 'number',
                },
                {
                    id: 'c9835808-0392-425c-a3b7-fc7c8e0957db',
                    name: 'Вид',
                    value: '={{$json[""][0].paid  ? "Оплачено" : "Не оплачено" }}',
                    type: 'string',
                },
                {
                    id: '17f8734c-e2a6-4564-ab49-25e0708c351f',
                    name: 'Дата',
                    value: '={{ $json[""][0].month.toDateTime().format(\'dd.MM.yyyy\') }}',
                    type: 'string',
                },
                {
                    id: '662ad791-6bae-4e73-bae4-1f07c42c4722',
                    name: 'Статья расходов',
                    value: '={{ $json[""][0]["Статьяя расходов"] }}',
                    type: 'string',
                },
                {
                    id: '6cf27ccc-0558-4824-828e-0d2b30fd2da1',
                    name: 'PaymentCashRegister',
                    value: 'Бюджет',
                    type: 'string',
                },
                {
                    id: '30f559f0-2eee-42bf-b6d2-f322b5ca179d',
                    name: 'Тип',
                    value: 'Расход',
                    type: 'string',
                },
                {
                    id: '4663b384-b387-4803-89e5-2a90b309182f',
                    name: '',
                    value: '',
                    type: 'string',
                },
                {
                    id: '3448acc9-75b0-40e5-9c7c-39459052323d',
                    name: 'countInBudget',
                    value: 1,
                    type: 'number',
                },
                {
                    id: 'e48fb669-4690-4d0a-a060-3ab62ad616f8',
                    name: 'Комментарий',
                    value: '={{ $json[""][0]["comment"] }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getBudget4',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2080, 848],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getbudget4 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '=1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 593501693,
            mode: 'list',
            cachedResultName: 'vocabulary',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M/edit#gid=593501693',
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'specifyRangeA1',
                    range: 'G1:G',
                },
            },
        },
    };

    @node({
        name: 'Edit Fields7',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1904, 992],
    })
    EditFields7 = {
        assignments: {
            assignments: [
                {
                    id: 'edf84564-966d-47b9-be1f-892efda53f4c',
                    name: 'activityBudget',
                    value: '={{ $json.activityBudget}}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Aggregate1',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-1296, 704],
    })
    Aggregate1 = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: 'activityBudget',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Edit Fields8',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1040, 688],
    })
    EditFields8 = {
        assignments: {
            assignments: [
                {
                    id: 'edf84564-966d-47b9-be1f-892efda53f4c',
                    name: '',
                    value: '={{ $json.activityBudget}}',
                    type: 'array',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook10',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-720, 672],
    })
    RespondToWebhook10 = {
        respondWith: 'text',
        responseBody: '={{ $json[""].toJsonString() }}',
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
        name: 'Append row',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1264, 1104],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    AppendRow = {
        authentication: 'serviceAccount',
        operation: 'append',
        documentId: {
            __rl: true,
            value: '=1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1236634822,
            mode: 'list',
            cachedResultName: 'Budget',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M/edit#gid=1236634822',
        },
        columns: {
            mappingMode: 'autoMapInputData',
            value: {},
            matchingColumns: ['row_number'],
            schema: [
                {
                    id: 'Дата',
                    displayName: 'Дата',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Время',
                    displayName: 'Время',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Вид',
                    displayName: 'Вид',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Тип',
                    displayName: 'Тип',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Сумма',
                    displayName: 'Сумма',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Бюджет',
                    displayName: 'Бюджет',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Статья расходов',
                    displayName: 'Статья расходов',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Год',
                    displayName: 'Год',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Месяц',
                    displayName: 'Месяц',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Комментарий',
                    displayName: 'Комментарий',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'username',
                    displayName: 'username',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'PaymentCashRegister',
                    displayName: 'PaymentCashRegister',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'id',
                    displayName: 'id',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'countInBudget',
                    displayName: 'countInBudget',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Столбец 15',
                    displayName: 'Столбец 15',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'Update Row',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1168, 1280],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    UpdateRow = {
        authentication: 'serviceAccount',
        operation: 'update',
        documentId: {
            __rl: true,
            value: '=1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1236634822,
            mode: 'list',
            cachedResultName: 'Budget',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M/edit#gid=1236634822',
        },
        columns: {
            mappingMode: 'autoMapInputData',
            value: {
                row_number: 0,
            },
            matchingColumns: ['row_number'],
            schema: [
                {
                    id: 'Дата',
                    displayName: 'Дата',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Время',
                    displayName: 'Время',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Вид',
                    displayName: 'Вид',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Тип',
                    displayName: 'Тип',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Сумма',
                    displayName: 'Сумма',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Бюджет',
                    displayName: 'Бюджет',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Статья расходов',
                    displayName: 'Статья расходов',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Год',
                    displayName: 'Год',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Месяц',
                    displayName: 'Месяц',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Комментарий',
                    displayName: 'Комментарий',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'username',
                    displayName: 'username',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'id',
                    displayName: 'id',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'number',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.Switch_.in(0));
        this.Switch_.out(0).to(this.Getbudget.in(0));
        this.Switch_.out(0).to(this.Node1.in(0));
        this.Switch_.out(0).to(this.Node2.in(0));
        this.Switch_.out(1).to(this.Getstoreid.in(0));
        this.Switch_.out(2).to(this.Getmonthssummary.in(0));
        this.Switch_.out(3).to(this.SplitOut1.in(0));
        this.Switch_.out(4).to(this.Getbudget4.in(0));
        this.WhenClickingTestWorkflow.out(0).to(this.Getmonthssummary.in(0));
        this.Webhook2.out(0).to(this.Switch_.in(0));
        this.Getstoreid.out(0).to(this.Getstorename.in(0));
        this.Getstorename.out(0).to(this.RespondToWebhook4.in(0));
        this.Jsondatabase.out(0).to(this.Jsondatabase1.in(0));
        this.Jsondatabase1.out(0).to(this.RespondToWebhook.in(0));
        this.EditFields1.out(0).to(this.Jsondatabase.in(0));
        this.Getbudget.out(0).to(this.EditFields5.in(0));
        this.EditFields3.out(0).to(this.DateTime.in(0));
        this.Node.out(0).to(this.RespondToWebhook7.in(0));
        this.Merge.out(0).to(this.EditFields3.in(0));
        this.Node1.out(0).to(this.EditFields2.in(0));
        this.Node2.out(0).to(this.EditFields4.in(0));
        this.Sort.out(0).to(this.Node.in(0));
        this.EditFields2.out(0).to(this.Merge.in(1));
        this.EditFields4.out(0).to(this.Merge.in(2));
        this.EditFields5.out(0).to(this.Merge.in(0));
        this.DateTime.out(0).to(this.Sort.in(0));
        this.Getmonthssummary.out(0).to(this.EditFields6.in(0));
        this._1.out(0).to(this.RespondToWebhook8.in(0));
        this.EditFields6.out(0).to(this._1.in(0));
        this.Getbudget1.out(0).to(this.Merge1.in(0));
        this.RenameKeys.out(0).to(this.LoopOverItems.in(0));
        this.SplitOut1.out(0).to(this.RenameKeys.in(0));
        this.LoopOverItems.out(0).to(this.NewOrEdit.in(0));
        this.LoopOverItems.out(1).to(this.Merge1.in(1));
        this.LoopOverItems.out(1).to(this.Getbudget1.in(0));
        this.Merge1.out(0).to(this.Aggregate.in(0));
        this.Aggregate.out(0).to(this.LoopOverItems.in(0));
        this.EditFields9.out(0).to(this.UpdateRow.in(0));
        this.NewOrEdit.out(0).to(this.EditFields10.in(0));
        this.NewOrEdit.out(1).to(this.EditFields9.in(0));
        this.EditFields10.out(0).to(this.AppendRow.in(0));
        this.Getbudget4.out(0).to(this.EditFields7.in(0));
        this.EditFields7.out(0).to(this.Aggregate1.in(0));
        this.Aggregate1.out(0).to(this.EditFields8.in(0));
        this.EditFields8.out(0).to(this.RespondToWebhook10.in(0));
        this.AppendRow.out(0).to(this.RespondToWebhook9.in(0));
        this.UpdateRow.out(0).to(this.RespondToWebhook9.in(0));
    }
}
