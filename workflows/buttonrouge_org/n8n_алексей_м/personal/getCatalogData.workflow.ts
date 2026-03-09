import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : getCatalogData
// Nodes   : 13  |  Connections: 15
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// GoogleSheets                       googleSheets               [creds]
// RespondToWebhook                   respondToWebhook
// CodeInJavascript                   code
// GoogleSheets1                      googleSheets               [creds]
// Switch_                            switch
// If_                                if
// Articlenotfound                    set
// Outofstock                         set
// If1                                if
// GoogleSheets2                      googleSheets               [creds]
// RespondToWebhook1                  respondToWebhook
// RespondToWebhook2                  respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Switch_
//      → GoogleSheets
//        → CodeInJavascript
//          → RespondToWebhook
//     .out(1) → GoogleSheets1
//        → If1
//          → Articlenotfound
//            → RespondToWebhook (↩ loop)
//         .out(1) → If_
//            → Outofstock
//              → RespondToWebhook (↩ loop)
//           .out(1) → RespondToWebhook (↩ loop)
//     .out(2) → GoogleSheets2
//        → RespondToWebhook1
//          → RespondToWebhook2
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'hUNAzAUPzoSKPnVfY5hCx',
    name: 'getCatalogData',
    active: true,
    settings: { executionOrder: 'v1', availableInMCP: false },
})
export class GetcatalogdataWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [-176, -256],
    })
    Webhook = {
        path: 'getCatalogData',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'Google Sheets',
        type: 'n8n-nodes-base.googleSheets',
        version: 3,
        position: [336, -288],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GoogleSheets = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: '={{ $json.query.sheetName_sklad }}',
            mode: 'name',
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'specifyRangeA1',
                    range: 'A1:Z3',
                },
            },
        },
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1,
        position: [992, -208],
    })
    RespondToWebhook = {
        respondWith: 'allIncomingItems',
        options: {},
    };

    @node({
        name: 'Code in JavaScript',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [544, -288],
    })
    CodeInJavascript = {
        jsCode: '// items[0].json и items[1].json — видимость/редактируемость\nconst first = items[0]?.json || {};\nconst second = items[1]?.json || {};\n\n// убираем служебные поля\nconst skip = new Set(["row_number"]);\nconst headers = Object.keys(first).filter(k => !skip.has(k));\n\n// порядок по headers\nconst visible = headers.map(k => first[k]);\nconst editable = headers.map(k => second[k]);\n\nreturn [\n  {\n    json: {\n      data: [headers, visible, editable]\n    }\n  }\n];\n',
    };

    @node({
        name: 'Google Sheets1',
        type: 'n8n-nodes-base.googleSheets',
        version: 3,
        position: [336, -96],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GoogleSheets1 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: '={{ $json.query.sheetName_sklad }}',
            mode: 'name',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'article',
                    lookupValue: '={{ $json.query.value }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [64, -256],
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
                                leftValue: '={{ $json.query.action }}',
                                rightValue: 'getHeader',
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
                    outputKey: 'getHeader',
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
                                leftValue: '={{ $json.query.action }}',
                                rightValue: 'getItemByArticleName',
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
                    outputKey: 'getItemByArticleName',
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
                                id: 'afc5934c-96f8-4e86-833e-fcf03d9d08aa',
                                leftValue: '={{ $json.query.action }}',
                                rightValue: 'getAllItemsFromCatalogByQuery',
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
                    outputKey: 'getAllItemsFromCatalogByQuery',
                },
            ],
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [672, -32],
    })
    If_ = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '77760589-13b3-4006-bfc4-937f813991de',
                    leftValue: '={{ $json.quantity }}',
                    rightValue: 0,
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
        name: 'articlenotfound',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [912, 32],
    })
    Articlenotfound = {
        assignments: {
            assignments: [
                {
                    id: 'bd8a0c1f-c6c4-4914-bfa1-a4175b01e26a',
                    name: 'error',
                    value: 'articlenotfound',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'outofstock',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [784, -176],
    })
    Outofstock = {
        assignments: {
            assignments: [
                {
                    id: 'bd8a0c1f-c6c4-4914-bfa1-a4175b01e26a',
                    name: 'error',
                    value: 'outofstock',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'If1',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [512, -80],
    })
    If1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '77760589-13b3-4006-bfc4-937f813991de',
                    leftValue: '={{ $json.isEmpty() }}',
                    rightValue: 0,
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
        name: 'Google Sheets2',
        type: 'n8n-nodes-base.googleSheets',
        version: 3,
        position: [272, 112],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GoogleSheets2 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: '={{ $json.query.sheetName_sklad }}',
            mode: 'name',
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'detectAutomatically',
                },
            },
        },
    };

    @node({
        name: 'Respond to Webhook1',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1,
        position: [512, 144],
    })
    RespondToWebhook1 = {
        respondWith: 'allIncomingItems',
        options: {},
    };

    @node({
        name: 'Respond to Webhook2',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1,
        position: [768, 192],
    })
    RespondToWebhook2 = {
        respondWith: 'allIncomingItems',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.Switch_.in(0));
        this.GoogleSheets.out(0).to(this.CodeInJavascript.in(0));
        this.CodeInJavascript.out(0).to(this.RespondToWebhook.in(0));
        this.Switch_.out(0).to(this.GoogleSheets.in(0));
        this.Switch_.out(1).to(this.GoogleSheets1.in(0));
        this.Switch_.out(2).to(this.GoogleSheets2.in(0));
        this.GoogleSheets1.out(0).to(this.If1.in(0));
        this.If_.out(0).to(this.Outofstock.in(0));
        this.If_.out(1).to(this.RespondToWebhook.in(0));
        this.Articlenotfound.out(0).to(this.RespondToWebhook.in(0));
        this.Outofstock.out(0).to(this.RespondToWebhook.in(0));
        this.If1.out(0).to(this.Articlenotfound.in(0));
        this.If1.out(1).to(this.If_.in(0));
        this.GoogleSheets2.out(0).to(this.RespondToWebhook1.in(0));
        this.RespondToWebhook1.out(0).to(this.RespondToWebhook2.in(0));
    }
}
