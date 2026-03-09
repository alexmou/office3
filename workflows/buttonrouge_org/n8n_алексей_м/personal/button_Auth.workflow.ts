import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/Auth
// Nodes   : 9  |  Connections: 10
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// Switch_                            switch
// Webhook2                           webhook
// Generateunid                       code
// RespondToWebhook7                  respondToWebhook
// Updaterow                          googleSheets               [creds]
// Merge                              merge
// Aggregate                          aggregate
// Updaterow1                         googleSheets               [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Switch_
//      → Updaterow1
//        → RespondToWebhook7
//     .out(1) → Generateunid
//        → Merge.in(1)
//          → Aggregate
//            → Updaterow
//              → RespondToWebhook7 (↩ loop)
//     .out(1) → Merge (↩ loop)
// Webhook2
//    → Switch_ (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'GJQ5EyXqLMJAK0uU',
    name: 'button/Auth',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ButtonAuthWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-2144, -96],
    })
    Webhook = {
        path: 'Auth',
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
        position: [-1904, -96],
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
                                rightValue: 'getAuthData',
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
                    outputKey: 'getAuthData',
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
                                leftValue: '={{ $json.body.action }}',
                                rightValue: 'setToken',
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
                    outputKey: 'setToken',
                },
            ],
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        name: 'Webhook2',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-2144, 64],
    })
    Webhook2 = {
        httpMethod: 'POST',
        path: 'Auth',
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
        name: 'GenerateUnid',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1584, 48],
    })
    Generateunid = {
        jsCode: "function generateGUID() {\n  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {\n    const r = Math.random() * 16 | 0,\n          v = c === 'x' ? r : (r & 0x3 | 0x8);\n    return v.toString(16);\n  });\n}\n\nconst token = generateGUID();\n\n\nreturn [{ json: { token } }];\n",
    };

    @node({
        name: 'Respond to Webhook7',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-784, 128],
    })
    RespondToWebhook7 = {
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
        name: 'updateRow',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-976, -192],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Updaterow = {
        authentication: 'serviceAccount',
        operation: 'update',
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
        columns: {
            mappingMode: 'defineBelow',
            value: {
                token: '={{ $json.data[1].token }}',
                loginpassword: '={{ $json.data[0].body.login }}{{ $json.data[0].body.password }}',
                store: '={{ $json.data[0].body.store }}',
            },
            matchingColumns: ['loginpassword'],
            schema: [
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
                    id: 'Описание',
                    displayName: 'Описание',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Роль',
                    displayName: 'Роль',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Пароль',
                    displayName: 'Пароль',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'token',
                    displayName: 'token',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'store',
                    displayName: 'store',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'loginpassword',
                    displayName: 'loginpassword',
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
                    type: 'number',
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
        version: 3.2,
        position: [-1408, -96],
    })
    Merge = {};

    @node({
        name: 'Aggregate',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-1152, -112],
    })
    Aggregate = {
        aggregate: 'aggregateAllItemData',
        options: {},
    };

    @node({
        name: 'updateRow1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1520, -224],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Updaterow1 = {
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
                    lookupValue: '={{ $json.query.token }}',
                },
            ],
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.Switch_.in(0));
        this.Switch_.out(0).to(this.Updaterow1.in(0));
        this.Switch_.out(1).to(this.Generateunid.in(0));
        this.Switch_.out(1).to(this.Merge.in(0));
        this.Webhook2.out(0).to(this.Switch_.in(0));
        this.Generateunid.out(0).to(this.Merge.in(1));
        this.Updaterow.out(0).to(this.RespondToWebhook7.in(0));
        this.Merge.out(0).to(this.Aggregate.in(0));
        this.Aggregate.out(0).to(this.Updaterow.in(0));
        this.Updaterow1.out(0).to(this.RespondToWebhook7.in(0));
    }
}
