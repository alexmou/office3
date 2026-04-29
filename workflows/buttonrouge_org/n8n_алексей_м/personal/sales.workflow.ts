import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : sales
// Nodes   : 21  |  Connections: 21
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// Switch_                            switch
// Getallitemsfromsklad1              googleSheets               [creds]
// WhenClickingTestWorkflow           manualTrigger
// Code                               code
// RenderHtml                         html
// Webhook2                           webhook
// Updaterow                          googleSheets               [creds]
// Merge                              merge
// Aggregate2                         aggregate
// Node                               code
// ObjectToArray                      code
// RespondToWebhook                   respondToWebhook
// EditFields                         set
// Aggregate                          aggregate
// Sort                               sort
// ConvertDate                        code
// JsonToArray                        code
// Node1                              set
// Limit                              limit
// Limit1                             limit
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Switch_
//     .out(1) → Getallitemsfromsklad1
//        → Node1
//          → Limit
//            → ObjectToArray
//              → Merge
//                → Aggregate
//                  → EditFields
//                    → RespondToWebhook
//          → Limit1
//            → ConvertDate
//              → Sort
//                → JsonToArray
//                  → Merge.in(1) (↩ loop)
//            → Aggregate2
//              → Node
//                → Merge.in(2) (↩ loop)
//     .out(2) → Code
//        → Updaterow
// WhenClickingTestWorkflow
//    → Getallitemsfromsklad1 (↩ loop)
// Webhook2
//    → Switch_ (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'S8psazYZnXdCAT0B',
    name: 'sales',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class SalesWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-688, -368],
    })
    Webhook = {
        path: 'sales',
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
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-464, -368],
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
                                rightValue: 'getArticle',
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
                    outputKey: 'getArticle',
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
                                id: '0f9b14f9-bbf6-454a-857e-e3c27ba2f225',
                                leftValue: '={{ JSON.parse($json.query.data).query.action }}',
                                rightValue: 'getSalesData',
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
                    outputKey: 'getSalesData',
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
                                id: '424c332f-6747-495e-ade8-26932dc313aa',
                                leftValue: '={{ JSON.parse($json.query.data).query.action }}',
                                rightValue: 'editItem',
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
                    outputKey: 'editItem',
                },
            ],
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        name: 'getAllItemsFromSklad1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-176, -368],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getallitemsfromsklad1 = {
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
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'specifyRange',
                    firstDataRow: 1,
                },
            },
            outputFormatting: {
                values: {
                    general: 'FORMATTED_VALUE',
                    date: 'SERIAL_NUMBER',
                },
            },
        },
    };

    @node({
        name: 'When clicking ‘Test workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-464, -64],
    })
    WhenClickingTestWorkflow = {};

    @node({
        name: 'Code',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-160, 80],
    })
    Code = {
        jsCode: '\nreturn $input.first().json.body',
    };

    @node({
        name: 'render html',
        type: 'n8n-nodes-base.html',
        version: 1.2,
        position: [-688, 208],
    })
    RenderHtml = {
        html: '<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Управление складами</title>\n\n<!-- Bootstrap + иконки -->\n<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">\n\n{{ $json.css }}\n</head>\n \n<body>\n {{ $json.html }}\n {{ $json.js }}\n</body>\n</html>\n',
    };

    @node({
        name: 'Webhook2',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-688, -160],
    })
    Webhook2 = {
        httpMethod: 'POST',
        path: '63576d29-fbfa-4887-8cc5-f2aa08384e13',
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
        name: 'updateRow',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [64, 80],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Updaterow = {
        authentication: 'serviceAccount',
        operation: 'update',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 842138658,
            mode: 'list',
            cachedResultName: 'Sklad3',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k/edit#gid=842138658',
        },
        columns: {
            mappingMode: 'autoMapInputData',
            value: {},
            matchingColumns: ['article'],
            schema: [
                {
                    id: 'num',
                    displayName: 'num',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'article',
                    displayName: 'article',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Brand',
                    displayName: 'Brand',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'type',
                    displayName: 'type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'subtype',
                    displayName: 'subtype',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'description',
                    displayName: 'description',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Name',
                    displayName: 'Name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'fabric',
                    displayName: 'fabric',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'color',
                    displayName: 'color',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'size',
                    displayName: 'size',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'производитель',
                    displayName: 'производитель',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'netprice',
                    displayName: 'netprice',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'отгрузка',
                    displayName: 'отгрузка',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'quantity',
                    displayName: 'quantity',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'crope price',
                    displayName: 'crope price',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'price',
                    displayName: 'price',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'discount_%',
                    displayName: 'discount_%',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'discount_Fix',
                    displayName: 'discount_Fix',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Comments',
                    displayName: 'Comments',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'netpriceFull',
                    displayName: 'netpriceFull',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'scladprice',
                    displayName: 'scladprice',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'salePrice',
                    displayName: 'salePrice',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Зал',
                    displayName: 'Зал',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Склад',
                    displayName: 'Склад',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Склад-вешалка',
                    displayName: 'Склад-вешалка',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Дом',
                    displayName: 'Дом',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Улица',
                    displayName: 'Улица',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'headers',
                    displayName: 'headers',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'params',
                    displayName: 'params',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'query',
                    displayName: 'query',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'body',
                    displayName: 'body',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'webhookUrl',
                    displayName: 'webhookUrl',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'executionMode',
                    displayName: 'executionMode',
                    required: false,
                    defaultMatch: false,
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
                    type: 'string',
                    canBeUsedToMatch: true,
                    readOnly: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3.1,
        position: [1088, -256],
    })
    Merge = {
        numberInputs: 3,
    };

    @node({
        name: 'Aggregate2',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [640, -64],
    })
    Aggregate2 = {
        aggregate: 'aggregateAllItemData',
        options: {},
    };

    @node({
        name: 'Фильтры',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [864, -64],
    })
    Node = {
        jsCode: "const data = $json.data;\nconst filters = {};\nconst rowNumbers = {}; // Объект для хранения row_number\nconst filtersSettings = $('Выбор полей').params.assignments.assignments;\n\n// Инициализируем фильтры (исключая row_number)\nfiltersSettings.forEach(item => {\n  if (item.name !== 'row_number') { // Пропускаем поле row_number\n    filters[item.name] = [];\n    rowNumbers[item.name] = [];\n  }\n});\n\n// Заполняем фильтры уникальными значениями\ndata.forEach(item => {\n  for (const key in item) {\n    if (filters[key] && !filters[key].includes(item[key])) {\n      filters[key].push(item[key]);\n      rowNumbers[key].push(item.row_number); // Сохраняем row_number\n    }\n  }\n});\n\n// Форматируем вывод (без создания объекта для row_number)\n\nconst filterOptions = [];\nfor (const key in filters) {\n  if (filters[key].length > 0) {\n    filterOptions.push({\n      header: key,\n      values: filters[key].map(value => `\"${value}\"`)\n    });\n  }\n}\n\n\nfor (var i = 0; i < filterOptions.length; i++) {\n    filterOptions[i].index = i;\n}\n\n\n\n\n      \nreturn { filterOptions };",
    };

    @node({
        name: 'object to array',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [864, -464],
    })
    ObjectToArray = {
        mode: 'runOnceForEachItem',
        jsCode: 'var header = [];\n//console.log("input",$input)\n//console.log("json",$json)\n\n\nfor (const key in $json) {\n  if(key!="row_number") {\n  header.push(key);\n  }\n  //console.log(key)\n}\nreturn {header}',
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [1744, -256],
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
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [1520, -256],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: '29925d3a-ec88-47bc-8293-328fdf334847',
                    name: 'header',
                    value: '={{ $json.data[0].header }}',
                    type: 'array',
                },
                {
                    id: '6a0e90c6-156e-41de-9fae-dcccc2bad12f',
                    name: 'values',
                    value: '={{ $json.data[1].values }}',
                    type: 'array',
                },
                {
                    id: '1c600dbc-7f60-4479-8bbe-4921a03e4013',
                    name: 'filterOptions',
                    value: '={{ $json.data[2].filterOptions }}',
                    type: 'array',
                },
                {
                    id: '3d5ab357-9d96-46eb-8c65-b9ba168cd562',
                    name: 'query',
                    value: 'All',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Aggregate',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [1312, -256],
    })
    Aggregate = {
        aggregate: 'aggregateAllItemData',
        options: {},
    };

    @node({
        name: 'Sort',
        type: 'n8n-nodes-base.sort',
        version: 1,
        position: [640, -256],
    })
    Sort = {
        sortFieldsUi: {
            sortField: [
                {
                    fieldName: '=dateConverted',
                    order: 'descending',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'convert date',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [432, -256],
    })
    ConvertDate = {
        jsCode: "// Loop over input items and add a new field called 'myNewField' to the JSON of each one\nfunction parseDate(dateString) {\n    const [day, month, year] = dateString.split('.');\n    return new Date(year, month - 1, day);\n}\n\nfor (const item of $input.all()) {\n  item.json.dateConverted = parseDate(item.json.date);\n}\n\n\nreturn $input.all();",
    };

    @node({
        name: 'json to array',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [816, -240],
    })
    JsonToArray = {
        jsCode: "const EXCLUDE_FIELDS = ['row_number', 'dateConverted'];\n\nconst data = $input.all().map(item => item.json);\n\nconst allValues = data.map(obj => {\n  const filteredObj = Object.fromEntries(\n    Object.entries(obj).filter(([key]) => !EXCLUDE_FIELDS.includes(key))\n  );\n  return Object.values(filteredObj);\n});\n\nreturn [\n  {\n    json: {\n      values: allValues\n    }\n  }\n];\n",
    };

    @node({
        name: 'Выбор полей',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-16, -368],
    })
    Node1 = {
        assignments: {
            assignments: [
                {
                    id: '77c7cb77-36c1-47f0-84fe-d2f06e16c550',
                    name: 'row_number',
                    value: '={{ $json.row_number }}',
                    type: 'string',
                },
                {
                    id: '6de60ebf-9cdb-46cd-a850-b32105e2bd1b',
                    name: 'article',
                    value: '={{ $json.article }}',
                    type: 'string',
                },
                {
                    id: '3b6d1d00-d2bb-4cd8-869e-7915718a9ac1',
                    name: 'Name',
                    value: '={{ $json.Name }}',
                    type: 'string',
                },
                {
                    id: '8b9219ea-4943-44ed-85f5-f732d75b1330',
                    name: 'size',
                    value: '={{ $json.size }}',
                    type: 'string',
                },
                {
                    id: '53f3189d-3b25-4f2a-97b3-d3a7cc5536dd',
                    name: 'color',
                    value: '={{ $json.color }}',
                    type: 'string',
                },
                {
                    id: 'c74e3eec-6cfa-4918-8588-50972a99e452',
                    name: 'description',
                    value: '={{ $json.description }}',
                    type: 'string',
                },
                {
                    id: '2c4e61a9-0397-431e-99c7-2b983f40ef4b',
                    name: 'date',
                    value: '={{ $json.date }}',
                    type: 'string',
                },
                {
                    id: '675fba31-ba38-4593-90ca-9632cfdd406e',
                    name: 'time',
                    value: '={{ $json.time }}',
                    type: 'string',
                },
                {
                    id: '14e049c3-f862-4407-ab06-91c69e4039ca',
                    name: 'store',
                    value: '={{ $json.store }}',
                    type: 'string',
                },
                {
                    id: 'b799e5ed-4aca-4960-98d2-90208fb683e8',
                    name: 'price',
                    value: '={{ $json.price }}',
                    type: 'string',
                },
                {
                    id: 'e8d72184-9473-4e53-a12b-21a4663a0971',
                    name: 'finalPriceVND',
                    value: '={{ $json.finalPriceVND }}',
                    type: 'string',
                },
                {
                    id: '3b25da17-beac-4396-b67e-acb0c611e7e7',
                    name: 'Brand',
                    value: '={{ $json.Brand }}',
                    type: 'string',
                },
                {
                    id: 'a91c3877-e4ff-437a-9336-c51824890768',
                    name: 'username',
                    value: '={{ $json.username }}',
                    type: 'string',
                },
                {
                    id: '39b35725-ddd5-4b68-ad97-4039899bc44f',
                    name: 'paymentmethod',
                    value: '={{ $json.paymentmethod }}',
                    type: 'string',
                },
                {
                    id: '25daa6f1-b98c-43a3-a559-43ef91cac5f8',
                    name: 'Comments',
                    value: '={{ $json.Comments }}',
                    type: 'string',
                },
                {
                    id: 'ret-basketid',
                    name: 'basketid',
                    value: '={{ $json.basketid }}',
                    type: 'string',
                },
                {
                    id: 'ret-is_return',
                    name: 'is_return',
                    value: '={{ $json.is_return }}',
                    type: 'string',
                },
                {
                    id: 'ret-return_status',
                    name: 'return_status',
                    value: '={{ $json.return_status }}',
                    type: 'string',
                },
                {
                    id: 'ret-return_reason',
                    name: 'return_reason',
                    value: '={{ $json.return_reason }}',
                    type: 'string',
                },
                {
                    id: 'ret-return_comment',
                    name: 'return_comment',
                    value: '={{ $json.return_comment }}',
                    type: 'string',
                },
                {
                    id: 'ret-return_approved_by',
                    name: 'return_approved_by',
                    value: '={{ $json.return_approved_by }}',
                    type: 'string',
                },
                {
                    id: 'ret-return_date',
                    name: 'return_date',
                    value: '={{ $json.return_date }}',
                    type: 'string',
                },
                {
                    id: 'ret-return_time',
                    name: 'return_time',
                    value: '={{ $json.return_time }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Limit',
        type: 'n8n-nodes-base.limit',
        version: 1,
        position: [640, -464],
    })
    Limit = {
        maxItems: '={{ 1 }}',
    };

    @node({
        name: 'Limit1',
        type: 'n8n-nodes-base.limit',
        version: 1,
        position: [208, -160],
    })
    Limit1 = {
        maxItems: '={{ $input.all().length -1}}',
        keep: 'lastItems',
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.Switch_.in(0));
        this.Switch_.out(1).to(this.Getallitemsfromsklad1.in(0));
        this.Switch_.out(2).to(this.Code.in(0));
        this.Getallitemsfromsklad1.out(0).to(this.Node1.in(0));
        this.WhenClickingTestWorkflow.out(0).to(this.Getallitemsfromsklad1.in(0));
        this.Code.out(0).to(this.Updaterow.in(0));
        this.Webhook2.out(0).to(this.Switch_.in(0));
        this.Merge.out(0).to(this.Aggregate.in(0));
        this.Aggregate2.out(0).to(this.Node.in(0));
        this.Node.out(0).to(this.Merge.in(2));
        this.ObjectToArray.out(0).to(this.Merge.in(0));
        this.EditFields.out(0).to(this.RespondToWebhook.in(0));
        this.Aggregate.out(0).to(this.EditFields.in(0));
        this.ConvertDate.out(0).to(this.Sort.in(0));
        this.JsonToArray.out(0).to(this.Merge.in(1));
        this.Sort.out(0).to(this.JsonToArray.in(0));
        this.Node1.out(0).to(this.Limit.in(0));
        this.Node1.out(0).to(this.Limit1.in(0));
        this.Limit.out(0).to(this.ObjectToArray.in(0));
        this.Limit1.out(0).to(this.ConvertDate.in(0));
        this.Limit1.out(0).to(this.Aggregate2.in(0));
    }
}
