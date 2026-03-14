import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/sklad
// Nodes   : 59  |  Connections: 66
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// RespondToWebhook                   respondToWebhook
// Switch_                            switch
// Getallitemsfromsklad1              googleSheets               [creds]
// WhenClickingTestWorkflow           manualTrigger
// Getallitemsfromsklad               googleSheets               [creds]
// Aggregate1                         aggregate
// Aggregate2                         aggregate
// Merge                              merge
// Aggregate                          aggregate
// Code                               code
// Webhook2                           webhook
// Updaterow                          googleSheets               [creds]
// Code1                              code
// Updaterow1                         googleSheets               [creds]
// RespondToWebhook1                  respondToWebhook
// Getallitemsfromsklad2              googleSheets               [creds]
// Summarize                          summarize
// EditFields1                        set
// Merge1                             merge
// Summarize1                         summarize
// Gettypes                           googleSheets               [creds]
// RespondToWebhook2                  respondToWebhook
// Getsubtypes                        googleSheets               [creds]
// Merge2                             merge
// Aggregate4                         aggregate
// Node                               code
// Aggregate6                         aggregate
// _1                                 code
// Code2                              code
// Aggregate5                         aggregate
// SkladHeader                        set
// RespondToWebhook3                  respondToWebhook
// Getskladheader                     googleSheets               [creds]
// Gettestenvironment                 set
// Getprodenvironment1                set
// Node1                              if
// RespondToWebhook5                  respondToWebhook
// _2                                 if
// Gettestenvironment2                set
// Getprodenvironment2                set
// Node2                              set
// Aarticle                           set
// Aarticle1                          set
// Code3                              code
// Updaterow2                         googleSheets               [creds]
// RespondToWebhook6                  respondToWebhook
// Updaterow3                         googleSheets               [creds]
// Aggregate8                         aggregate
// Aarticle2                          set
// EditFields                         set
// Merge3                             merge
// EditFields2                        set
// Aggregate9                         aggregate
// EditFields3                        set
// EditFields4                        set
// SkladHeader1                       set
// RespondToWebhook4                  respondToWebhook
// Getskladheader1                    googleSheets               [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Switch_
//     .out(1) → Node1
//        → Gettestenvironment
//          → Getallitemsfromsklad1
//            → Aggregate1
//              → Merge
//                → Aggregate
//                  → RespondToWebhook
//          → Getallitemsfromsklad
//            → Aggregate2
//              → Merge.in(1) (↩ loop)
//       .out(1) → Getprodenvironment1
//          → Getallitemsfromsklad1 (↩ loop)
//          → Getallitemsfromsklad (↩ loop)
//     .out(2) → Code
//        → Aarticle1
//          → Updaterow
//            → RespondToWebhook5
//     .out(3) → Code1
//        → Getallitemsfromsklad2
//          → Summarize
//            → Merge1.in(2)
//              → EditFields1
//                → Aarticle
//                  → Aarticle2
//                    → Merge3
//                      → Aggregate9
//                        → EditFields2
//                          → EditFields3
//                            → EditFields4
//                              → Updaterow1
//                                → RespondToWebhook1
//              → Aggregate8
//                → EditFields
//                  → Merge3.in(1) (↩ loop)
//          → Summarize1
//            → Merge1 (↩ loop)
//        → Merge1.in(1) (↩ loop)
//     .out(4) → Gettypes
//        → Aggregate5
//          → Node
//            → Merge2
//              → Aggregate6
//                → Code2
//                  → RespondToWebhook2
//     .out(4) → Getsubtypes
//        → Aggregate4
//          → _1
//            → Merge2.in(1) (↩ loop)
//     .out(5) → Getskladheader
//        → SkladHeader
//          → RespondToWebhook3
//     .out(6) → Code3
//        → Updaterow3
//          → Updaterow2
//            → RespondToWebhook6
//     .out(7) → Getskladheader1
//        → SkladHeader1
//          → RespondToWebhook4
// WhenClickingTestWorkflow
//    → Getskladheader1 (↩ loop)
// Webhook2
//    → _2
//      → Gettestenvironment2
//        → Node2
//          → Switch_ (↩ loop)
//     .out(1) → Getprodenvironment2
//        → Node2 (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '1rSHNYY8DuXZQJ1Y',
    name: 'button/sklad',
    active: true,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: false },
})
export class ButtonSkladWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1580, 740],
    })
    Webhook = {
        httpMethod: 'GET',
        path: 'sklad',
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
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [580, -201.5],
    })
    RespondToWebhook = {
        respondWith: 'json',
        responseBody: '={{ $json.data }}',
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
        position: [-960, 892],
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
                                rightValue: 'getSkladData',
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
                    outputKey: 'getSkladData',
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
                                leftValue: '={{ $json.query.action }}',
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
                                id: 'ca396694-ab72-4a0c-afd7-249fbe643565',
                                leftValue: '={{ $json.query.action }}',
                                rightValue: 'addItem',
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
                    outputKey: 'addItem',
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
                                id: '5377f5f8-1ee2-4f86-a1b5-88d3378dd8f1',
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
                                id: 'a1b3ee6c-7ad1-49fb-9994-3eb32e87202b',
                                leftValue: '={{ JSON.parse($json.query.data).query.action }}',
                                rightValue: 'getSkladHeader',
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
                    outputKey: 'getSkladHeader',
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
                                id: '5cbeb4ab-cd22-4fb0-85dd-d5fd3956d263',
                                leftValue: '={{ $json.query.action }}',
                                rightValue: 'deleteItem',
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
                    outputKey: 'deleteItem',
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
                                id: '7424ebf1-5451-48b4-bcc0-e7d0081fc560',
                                leftValue: '={{ $json.query.action }}',
                                rightValue: '=getHeader',
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
                    outputKey: '=getHeader',
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
        position: [-300, -301.5],
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
            value: '={{ $json.skladName1 }}',
            mode: 'name',
        },
        options: {},
    };

    @node({
        name: 'When clicking ‘Test workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1560, 1560],
    })
    WhenClickingTestWorkflow = {};

    @node({
        name: 'getAllItemsFromSklad',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-300, -101.5],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getallitemsfromsklad = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: '={{ $json.skladName2 }}',
            mode: 'name',
        },
        options: {},
    };

    @node({
        name: 'Aggregate1',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-80, -300],
    })
    Aggregate1 = {
        aggregate: 'aggregateAllItemData',
        destinationFieldName: 'data1',
        options: {},
    };

    @node({
        name: 'Aggregate2',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-80, -101.5],
    })
    Aggregate2 = {
        aggregate: 'aggregateAllItemData',
        destinationFieldName: 'data2',
        options: {},
    };

    @node({
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3.1,
        position: [140, -201.5],
    })
    Merge = {};

    @node({
        name: 'Aggregate',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [360, -201.5],
    })
    Aggregate = {
        aggregate: 'aggregateAllItemData',
        options: {},
    };

    @node({
        name: 'Code',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-520, 800],
    })
    Code = {
        jsCode: '\nreturn $input.first().json.body.data',
    };

    @node({
        name: 'Webhook2',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1580, 900],
    })
    Webhook2 = {
        httpMethod: 'POST',
        path: 'sklad',
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
        name: 'updateRow',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [160, 780],
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
            value: "={{ $('Какой склад?').item.json.SkladName }}",
            mode: 'name',
        },
        columns: {
            mappingMode: 'autoMapInputData',
            value: {},
            matchingColumns: ['num'],
            schema: [
                {
                    id: 'num',
                    displayName: 'num',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'article',
                    displayName: 'article',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
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
                    id: 'manufacturer',
                    displayName: 'manufacturer',
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
                    id: 'Delivery_date',
                    displayName: 'Delivery_date',
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
                    id: 'производитель',
                    displayName: 'производитель',
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
                    id: 'col_7',
                    displayName: 'col_7',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'data',
                    displayName: 'data',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'query',
                    displayName: 'query',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
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
        name: 'Code1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-720, 300],
    })
    Code1 = {
        jsCode: '\nreturn $input.first().json.body',
    };

    @node({
        name: 'updateRow1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [1700, 440],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Updaterow1 = {
        authentication: 'serviceAccount',
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: "={{ $('Какой склад?').item.json.SkladName }}",
            mode: 'name',
        },
        columns: {
            mappingMode: 'autoMapInputData',
            value: {},
            matchingColumns: [],
            schema: [
                {
                    id: 'num',
                    displayName: 'num',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'article',
                    displayName: 'article',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Brand',
                    displayName: 'Brand',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'type',
                    displayName: 'type',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'subtype',
                    displayName: 'subtype',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'description',
                    displayName: 'description',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Name',
                    displayName: 'Name',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'fabric',
                    displayName: 'fabric',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'color',
                    displayName: 'color',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'size',
                    displayName: 'size',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'manufacturer',
                    displayName: 'manufacturer',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'netprice',
                    displayName: 'netprice',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Delivery_date',
                    displayName: 'Delivery_date',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'quantity',
                    displayName: 'quantity',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'crope price',
                    displayName: 'crope price',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'price',
                    displayName: 'price',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'made in',
                    displayName: 'made in',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'discount_%',
                    displayName: 'discount_%',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'discount_Fix',
                    displayName: 'discount_Fix',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Comments',
                    displayName: 'Comments',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'netpriceFull',
                    displayName: 'netpriceFull',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'scladprice',
                    displayName: 'scladprice',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'salePrice',
                    displayName: 'salePrice',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Зал',
                    displayName: 'Зал',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Склад',
                    displayName: 'Склад',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Склад-вешалка',
                    displayName: 'Склад-вешалка',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Дом',
                    displayName: 'Дом',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Улица',
                    displayName: 'Улица',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook1',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [1900, 480],
    })
    RespondToWebhook1 = {
        respondWith: 'json',
        responseBody: '={{ $json.data }}',
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
        name: 'getAllItemsFromSklad2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-520, 373.5],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getallitemsfromsklad2 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: "={{ $('Какой склад?').item.json.SkladName }}",
            mode: 'name',
        },
        options: {},
    };

    @node({
        name: 'Summarize',
        type: 'n8n-nodes-base.summarize',
        version: 1.1,
        position: [-300, 330],
    })
    Summarize = {
        fieldsToSummarize: {
            values: [
                {
                    aggregation: 'max',
                    field: 'num',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Edit Fields1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [160, 280],
    })
    EditFields1 = {
        assignments: {
            assignments: [
                {
                    id: '8e828fa3-6da6-4403-a918-48fb062f9a19',
                    name: 'num',
                    value: '={{ $input.last().json.max_num.toNumber() +1 }}',
                    type: 'string',
                },
                {
                    id: 'd11c3f90-89ef-4264-b1c9-36d8327324b6',
                    name: 'row_number',
                    value: '={{ $input.first().json.max_row_number +1  }}',
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
        position: [-20, 320],
    })
    Merge1 = {
        numberInputs: 3,
    };

    @node({
        name: 'Summarize1',
        type: 'n8n-nodes-base.summarize',
        version: 1.1,
        position: [-300, 520],
    })
    Summarize1 = {
        fieldsToSummarize: {
            values: [
                {
                    aggregation: 'max',
                    field: 'row_number',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getTypes',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-740, 1130],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Gettypes = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 4332114,
            mode: 'list',
            cachedResultName: 'type',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k/edit#gid=4332114',
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'specifyRange',
                },
            },
        },
    };

    @node({
        name: 'Respond to Webhook2',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [580, 1173.5],
    })
    RespondToWebhook2 = {
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
        name: 'getSubTypes',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-740, 1330],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getsubtypes = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 745164943,
            mode: 'list',
            cachedResultName: 'subtype',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k/edit#gid=745164943',
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'specifyRange',
                },
            },
        },
    };

    @node({
        name: 'Merge2',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-80, 1173.5],
    })
    Merge2 = {};

    @node({
        name: 'Aggregate4',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-520, 1330],
    })
    Aggregate4 = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: '={{$json.keys()[1]}}',
                },
                {
                    fieldToAggregate: '={{$json.keys()[3]}}',
                },
            ],
        },
        options: {
            mergeLists: true,
        },
    };

    @node({
        name: 'Удаляем пустые значения',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-300, 1130],
    })
    Node = {
        jsCode: "// Получаем все элементы, пришедшие в ноду\nconst items = $input.all();\n\nfor (const item of items) {\n  // Проходим по всем полям объекта item.json\n  for (const [key, value] of Object.entries(item.json)) {\n    // Очищаем только те поля, которые являются массивами\n    if (Array.isArray(value)) {\n      // .filter(Boolean) убирает '', null, undefined, false\n      // Если хотите сохранить числа 0, замените на (v) => v !== '' && v != null\n      item.json[key] = value.filter(Boolean);\n    }\n  }\n}\n\n// Отдаём результат\nreturn items;\n",
    };

    @node({
        name: 'Aggregate6',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [140, 1173.5],
    })
    Aggregate6 = {
        aggregate: 'aggregateAllItemData',
        destinationFieldName: '',
        options: {},
    };

    @node({
        name: 'Удаляем пустые значения1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-300, 1330],
    })
    _1 = {
        jsCode: "// Получаем все элементы, пришедшие в ноду\nconst items = $input.all();\n\nfor (const item of items) {\n  // Проходим по всем полям объекта item.json\n  for (const [key, value] of Object.entries(item.json)) {\n    // Очищаем только те поля, которые являются массивами\n    if (Array.isArray(value)) {\n      // .filter(Boolean) убирает '', null, undefined, false\n      // Если хотите сохранить числа 0, замените на (v) => v !== '' && v != null\n      item.json[key] = value.filter(Boolean);\n    }\n  }\n}\n\n// Отдаём результат\nreturn items;\n",
    };

    @node({
        name: 'Code2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [360, 1173.5],
    })
    Code2 = {
        jsCode: 'const out = {};\nfor (const o of $json[""] || []) {\n  for (const [k, v] of Object.entries(o)) {\n    if (Array.isArray(v))\n      out[k] = [...(out[k] || []), ...v.filter(Boolean)];\n  }\n}\nfor (const k of Object.keys(out)) out[k] = [...new Set(out[k])];\nreturn [{ json: out }];\n',
    };

    @node({
        name: 'Aggregate5',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-520, 1130],
    })
    Aggregate5 = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: '={{$json.keys()[1]}}',
                },
                {
                    fieldToAggregate: '={{$json.keys()[3]}}',
                },
                {
                    fieldToAggregate: '={{$json.keys()[5]}}',
                },
                {
                    fieldToAggregate: '={{$json.keys()[7]}}',
                },
                {
                    fieldToAggregate: '={{$json.keys()[9]}}',
                },
                {
                    fieldToAggregate: '={{$json.keys()[11]}}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'sklad_header',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-520, 1560],
    })
    SkladHeader = {
        assignments: {
            assignments: [
                {
                    id: 'ff0d2757-b4c0-4496-a5a2-a2bb2556de82',
                    name: '=sklad_header',
                    value: '={{ $json.keys() }}',
                    type: 'array',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook3',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-300, 1555],
    })
    RespondToWebhook3 = {
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
        name: 'getSkladHeader',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-740, 1560],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getskladheader = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1769905694,
            mode: 'list',
            cachedResultName: 'Sklad',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k/edit#gid=1769905694',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'num',
                    lookupValue: '001',
                },
            ],
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'specifyRange',
                },
            },
            returnFirstMatch: true,
        },
    };

    @node({
        name: 'getTestEnvironment',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-520, -320],
    })
    Gettestenvironment = {
        assignments: {
            assignments: [
                {
                    id: '568c9d1d-da8e-4dcd-b9c5-63580f1a3bb0',
                    name: 'skladName1',
                    value: "={{ (() => { const raw = (($json.query || {}).data); let query = {}; if (typeof raw === 'string' && raw) { try { query = (JSON.parse(raw) || {}).query || {}; } catch (error) { query = {}; } } return query.sheetName_sklad || query.sklad || query.skladName1 || 'Sklad3'; })() }}",
                    type: 'string',
                },
                {
                    id: '3de5d333-7354-419d-94be-1b296c953f71',
                    name: 'skladName2',
                    value: "={{ (() => { const raw = (($json.query || {}).data); let query = {}; if (typeof raw === 'string' && raw) { try { query = (JSON.parse(raw) || {}).query || {}; } catch (error) { query = {}; } } return query.sheetName_sklad_2 || query.sklad2 || query.skladName2 || 'Sklad4'; })() }}",
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getProdEnvironment1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-520, -20],
    })
    Getprodenvironment1 = {
        assignments: {
            assignments: [
                {
                    id: '568c9d1d-da8e-4dcd-b9c5-63580f1a3bb0',
                    name: 'skladName1',
                    value: "={{ (() => { const raw = (($json.query || {}).data); let query = {}; if (typeof raw === 'string' && raw) { try { query = (JSON.parse(raw) || {}).query || {}; } catch (error) { query = {}; } } return query.sheetName_sklad || query.sklad || query.skladName1 || 'Sklad'; })() }}",
                    type: 'string',
                },
                {
                    id: '3de5d333-7354-419d-94be-1b296c953f71',
                    name: 'skladName2',
                    value: "={{ (() => { const raw = (($json.query || {}).data); let query = {}; if (typeof raw === 'string' && raw) { try { query = (JSON.parse(raw) || {}).query || {}; } catch (error) { query = {}; } } return query.sheetName_sklad_2 || query.sklad2 || query.skladName2 || 'Sklad2'; })() }}",
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Тест или прод?',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-740, -201.5],
    })
    Node1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: '7cddd27c-1676-49ec-85ea-7f01deaccfeb',
                    leftValue: '={{ $json.query.data.parseJson().query.TESTING }}',
                    rightValue: 1,
                    operator: {
                        type: 'number',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook5',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [400, 780],
    })
    RespondToWebhook5 = {
        respondWith: 'json',
        responseBody: '={{ $json.data }}',
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
        name: 'Тест или прод?2',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-1600, 1200],
    })
    _2 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: '7cddd27c-1676-49ec-85ea-7f01deaccfeb',
                    leftValue: '={{ $json.body.query.TESTING }}',
                    rightValue: 1,
                    operator: {
                        type: 'number',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'getTestEnvironment2',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1320, 1120],
    })
    Gettestenvironment2 = {
        assignments: {
            assignments: [
                {
                    id: '568c9d1d-da8e-4dcd-b9c5-63580f1a3bb0',
                    name: 'skladName1',
                    value: "={{ (($json.body || {}).query || {}).sheetName_sklad || (($json.body || {}).query || {}).sklad || (($json.body || {}).query || {}).skladName1 || 'Sklad3' }}",
                    type: 'string',
                },
                {
                    id: '3de5d333-7354-419d-94be-1b296c953f71',
                    name: 'skladName2',
                    value: "={{ (($json.body || {}).query || {}).sheetName_sklad_2 || (($json.body || {}).query || {}).sklad2 || (($json.body || {}).query || {}).skladName2 || 'Sklad4' }}",
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'getProdEnvironment2',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1320, 1380],
    })
    Getprodenvironment2 = {
        assignments: {
            assignments: [
                {
                    id: '568c9d1d-da8e-4dcd-b9c5-63580f1a3bb0',
                    name: 'skladName1',
                    value: "={{ (($json.body || {}).query || {}).sheetName_sklad || (($json.body || {}).query || {}).sklad || (($json.body || {}).query || {}).skladName1 || 'Sklad' }}",
                    type: 'string',
                },
                {
                    id: '3de5d333-7354-419d-94be-1b296c953f71',
                    name: 'skladName2',
                    value: "={{ (($json.body || {}).query || {}).sheetName_sklad_2 || (($json.body || {}).query || {}).sklad2 || (($json.body || {}).query || {}).skladName2 || 'Sklad2' }}",
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Какой склад?',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1100, 1220],
    })
    Node2 = {
        assignments: {
            assignments: [
                {
                    id: 'cb0c171d-9a59-40e7-b739-7ef99c1be280',
                    name: '=SkladName',
                    value: '={{ $json["skladName"+$json.body.query.wid] }}',
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Формула для aarticle',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [340, 280],
    })
    Aarticle = {
        assignments: {
            assignments: [
                {
                    id: 'bd97c45b-4c25-41df-b9d5-7e6520a76b7a',
                    name: 'article',
                    value: "={{'=IFERROR(VLOOKUP(C'+$json.row_number+';type!A:B;2;0)&\"\"&VLOOKUP(D'+$json.row_number+';subtype!A:B;2;0)&VLOOKUP(E'+$json.row_number+';subtype!C:D;2;0)&G'+$json.row_number+'&\"\"&A'+$json.row_number+')'\n}}",
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Формула для aarticle1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-240, 800],
    })
    Aarticle1 = {
        assignments: {
            assignments: [
                {
                    id: 'bd97c45b-4c25-41df-b9d5-7e6520a76b7a',
                    name: 'article',
                    value: "={{'=IFERROR(VLOOKUP(C'+$json.row_number+';type!A:B;2;0)&\"\"&VLOOKUP(D'+$json.row_number+';subtype!A:B;2;0)&VLOOKUP(E'+$json.row_number+';subtype!C:D;2;0)&G'+$json.row_number+'&\"\"&A'+$json.row_number+')'\n}}",
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Code3',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-580, 1800],
    })
    Code3 = {
        jsCode: '\nreturn $input.first().json.body.data',
    };

    @node({
        name: 'updateRow2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-220, 1820],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Updaterow2 = {
        authentication: 'serviceAccount',
        operation: 'delete',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: "={{ $('Какой склад?').item.json.SkladName }}",
            mode: 'name',
        },
        startIndex: '={{ $json.row_number }}',
    };

    @node({
        name: 'Respond to Webhook6',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [140, 1840],
    })
    RespondToWebhook6 = {
        respondWith: 'json',
        responseBody: '={{ $json.data }}',
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
        name: 'updateRow3',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-460, 1940],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Updaterow3 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: "={{ $('Какой склад?').item.json.SkladName }}",
            mode: 'name',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'article',
                    lookupValue: '={{ $json.article }}',
                },
            ],
        },
        combineFilters: '=',
        options: {},
    };

    @node({
        name: 'Aggregate8',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [180, 540],
    })
    Aggregate8 = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: 'data',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Формула для aarticle2',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [560, 60],
    })
    Aarticle2 = {
        assignments: {
            assignments: [
                {
                    id: '113a9d79-acd7-4cff-9f66-62bcb7ad3357',
                    name: 'data.num',
                    value: '={{ $json.num }}',
                    type: 'string',
                },
                {
                    id: '69b85ba7-a95c-4f1d-9023-34670dacf47e',
                    name: 'data.article',
                    value: '={{ $json.article }}',
                    type: 'string',
                },
            ],
        },
        options: {
            ignoreConversionErrors: false,
        },
    };

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [440, 580],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: 'a7601c47-9be7-4157-b4aa-efcba695e248',
                    name: 'data2',
                    value: '={{ $json.data.first().toJsonString() }}\n',
                    type: 'object',
                },
            ],
        },
        options: {
            ignoreConversionErrors: true,
        },
    };

    @node({
        name: 'Merge3',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [700, 340],
    })
    Merge3 = {};

    @node({
        name: 'Edit Fields2',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [960, 520],
    })
    EditFields2 = {
        assignments: {
            assignments: [
                {
                    id: '0e8e8eeb-f93c-4efb-828b-98695694b7c1',
                    name: '[""][1].data2.article',
                    value: '={{ $json[""][0].data.article }}',
                    type: 'string',
                },
                {
                    id: '4cf40556-7354-4547-b720-5ba9b4dc7f7b',
                    name: '[""][1].data2.num',
                    value: '={{ $json[""][0].data.num }}',
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {
            ignoreConversionErrors: false,
        },
    };

    @node({
        name: 'Aggregate9',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [800, 540],
    })
    Aggregate9 = {
        aggregate: 'aggregateAllItemData',
        destinationFieldName: '',
        options: {},
    };

    @node({
        name: 'Edit Fields3',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [1180, 520],
    })
    EditFields3 = {
        assignments: {
            assignments: [
                {
                    id: '264ff8dc-41a8-45bb-a900-1bbb77c460a2',
                    name: '',
                    value: '={{ $json[""][1].data2 }}',
                    type: 'object',
                },
            ],
        },
        options: {
            ignoreConversionErrors: false,
        },
    };

    @node({
        name: 'Edit Fields4',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [1440, 500],
    })
    EditFields4 = {
        mode: 'raw',
        jsonOutput: '={{ $json[""] }}\n\n',
        options: {},
    };

    @node({
        name: 'sklad_header1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1080, 2000],
    })
    SkladHeader1 = {
        assignments: {
            assignments: [
                {
                    id: 'ff0d2757-b4c0-4496-a5a2-a2bb2556de82',
                    name: '=sklad_header',
                    value: '={{ $json.keys() }}',
                    type: 'array',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook4',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-960, 2380],
    })
    RespondToWebhook4 = {
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
        name: 'getSkladHeader1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1000, 1660],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getskladheader1 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1769905694,
            mode: 'list',
            cachedResultName: 'Sklad',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k/edit#gid=1769905694',
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'detectAutomatically',
                },
            },
            returnFirstMatch: false,
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.Switch_.in(0));
        this.Switch_.out(1).to(this.Node1.in(0));
        this.Switch_.out(2).to(this.Code.in(0));
        this.Switch_.out(3).to(this.Code1.in(0));
        this.Switch_.out(4).to(this.Gettypes.in(0));
        this.Switch_.out(4).to(this.Getsubtypes.in(0));
        this.Switch_.out(5).to(this.Getskladheader.in(0));
        this.Switch_.out(6).to(this.Code3.in(0));
        this.Switch_.out(7).to(this.Getskladheader1.in(0));
        this.Getallitemsfromsklad1.out(0).to(this.Aggregate1.in(0));
        this.WhenClickingTestWorkflow.out(0).to(this.Getskladheader1.in(0));
        this.Getallitemsfromsklad.out(0).to(this.Aggregate2.in(0));
        this.Aggregate1.out(0).to(this.Merge.in(0));
        this.Aggregate2.out(0).to(this.Merge.in(1));
        this.Merge.out(0).to(this.Aggregate.in(0));
        this.Aggregate.out(0).to(this.RespondToWebhook.in(0));
        this.Code.out(0).to(this.Aarticle1.in(0));
        this.Webhook2.out(0).to(this._2.in(0));
        this.Updaterow.out(0).to(this.RespondToWebhook5.in(0));
        this.Code1.out(0).to(this.Getallitemsfromsklad2.in(0));
        this.Code1.out(0).to(this.Merge1.in(1));
        this.Updaterow1.out(0).to(this.RespondToWebhook1.in(0));
        this.Getallitemsfromsklad2.out(0).to(this.Summarize.in(0));
        this.Getallitemsfromsklad2.out(0).to(this.Summarize1.in(0));
        this.Summarize.out(0).to(this.Merge1.in(2));
        this.Merge1.out(0).to(this.EditFields1.in(0));
        this.Merge1.out(0).to(this.Aggregate8.in(0));
        this.EditFields1.out(0).to(this.Aarticle.in(0));
        this.Summarize1.out(0).to(this.Merge1.in(0));
        this.Gettypes.out(0).to(this.Aggregate5.in(0));
        this.Getsubtypes.out(0).to(this.Aggregate4.in(0));
        this.Merge2.out(0).to(this.Aggregate6.in(0));
        this.Aggregate4.out(0).to(this._1.in(0));
        this.Node.out(0).to(this.Merge2.in(0));
        this.Aggregate6.out(0).to(this.Code2.in(0));
        this._1.out(0).to(this.Merge2.in(1));
        this.Code2.out(0).to(this.RespondToWebhook2.in(0));
        this.Aggregate5.out(0).to(this.Node.in(0));
        this.SkladHeader.out(0).to(this.RespondToWebhook3.in(0));
        this.Getskladheader.out(0).to(this.SkladHeader.in(0));
        this.Getprodenvironment1.out(0).to(this.Getallitemsfromsklad1.in(0));
        this.Getprodenvironment1.out(0).to(this.Getallitemsfromsklad.in(0));
        this.Gettestenvironment.out(0).to(this.Getallitemsfromsklad1.in(0));
        this.Gettestenvironment.out(0).to(this.Getallitemsfromsklad.in(0));
        this.Node1.out(0).to(this.Gettestenvironment.in(0));
        this.Node1.out(1).to(this.Getprodenvironment1.in(0));
        this._2.out(0).to(this.Gettestenvironment2.in(0));
        this._2.out(1).to(this.Getprodenvironment2.in(0));
        this.Gettestenvironment2.out(0).to(this.Node2.in(0));
        this.Getprodenvironment2.out(0).to(this.Node2.in(0));
        this.Node2.out(0).to(this.Switch_.in(0));
        this.Aarticle.out(0).to(this.Aarticle2.in(0));
        this.Aarticle1.out(0).to(this.Updaterow.in(0));
        this.Code3.out(0).to(this.Updaterow3.in(0));
        this.Updaterow2.out(0).to(this.RespondToWebhook6.in(0));
        this.Updaterow3.out(0).to(this.Updaterow2.in(0));
        this.Aggregate8.out(0).to(this.EditFields.in(0));
        this.Aarticle2.out(0).to(this.Merge3.in(0));
        this.EditFields.out(0).to(this.Merge3.in(1));
        this.Merge3.out(0).to(this.Aggregate9.in(0));
        this.Aggregate9.out(0).to(this.EditFields2.in(0));
        this.EditFields2.out(0).to(this.EditFields3.in(0));
        this.EditFields3.out(0).to(this.EditFields4.in(0));
        this.EditFields4.out(0).to(this.Updaterow1.in(0));
        this.SkladHeader1.out(0).to(this.RespondToWebhook4.in(0));
        this.Getskladheader1.out(0).to(this.SkladHeader1.in(0));
    }
}
