import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : CashRegister
// Nodes   : 10  |  Connections: 12
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// RespondToWebhook                   respondToWebhook
// Webhook                            webhook
// Switch_                            switch
// Getcash                            googleSheets               [creds]
// Getcash1                           googleSheets               [creds]
// EditFields                         set
// Getcash2                           googleSheets               [creds]
// Webhook1                           webhook
// Append                             googleSheets               [creds]
// EditFields1                        set
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Switch_
//      → Getcash
//        → RespondToWebhook
//     .out(1) → Getcash1
//        → EditFields
//          → RespondToWebhook (↩ loop)
//     .out(2) → Getcash2
//        → RespondToWebhook (↩ loop)
//     .out(3) → EditFields1
//        → Append
//          → RespondToWebhook (↩ loop)
// Webhook1
//    → Switch_ (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 't6SVNT2eaJMzNH1e',
    name: 'CashRegister',
    active: true,
    settings: { executionOrder: 'v1', availableInMCP: false },
})
export class CashregisterWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-1376, -320],
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
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [-2624, -288],
    })
    Webhook = {
        path: 'CashRegister',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
        },
    };

    @node({
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.4,
        position: [-2400, -256],
    })
    Switch_ = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 3,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.query.action }}',
                                rightValue: 'getCash',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                                id: '0b024535-2439-4a4f-bc6f-20a0affb4e42',
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'getCash',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 3,
                        },
                        conditions: [
                            {
                                id: '39855d46-a421-40ef-af2d-fc8ab96183f4',
                                leftValue: '={{ $json.query.action }}',
                                rightValue: 'getCashRegisterRecords',
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
                    outputKey: 'getCashRegisterRecords',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 3,
                        },
                        conditions: [
                            {
                                id: '4a0970ae-471b-4a02-a342-d9f15d15968e',
                                leftValue: '={{ $json.query.action }}',
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
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 3,
                        },
                        conditions: [
                            {
                                id: 'e4109c99-cf78-498c-a5fa-369cbcbd3048',
                                leftValue: '={{ $json.body.action }}',
                                rightValue: '=addCacheRegisterRecord',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'addCacheRegisterRecord',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getCash',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2096, -272],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getcash = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1C4D4tPQ7fJDcjxQTZxt7AmwTv5MhdON5v8giZUWHLPs',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 330385053,
            mode: 'list',
            cachedResultName: 'cashregister',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1C4D4tPQ7fJDcjxQTZxt7AmwTv5MhdON5v8giZUWHLPs/edit#gid=330385053',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'StoreID',
                    lookupValue: '={{ $json.query.storeId }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getCash1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2096, -80],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getcash1 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1C4D4tPQ7fJDcjxQTZxt7AmwTv5MhdON5v8giZUWHLPs',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: '={{ $json.query.sheetName_accounting }}',
            mode: 'name',
        },
        options: {},
    };

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1856, -176],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: 'd62a69c0-71f7-4e61-a494-0c44f15ebfd8',
                    name: 'Дата',
                    value: '={{ $json["Дата"] }}',
                    type: 'string',
                },
                {
                    id: '11865843-10d1-4621-ae72-774e3ac1e04c',
                    name: 'Время',
                    value: '={{ $json["Время"] }}',
                    type: 'string',
                },
                {
                    id: '52411819-f6e2-4ce6-b4d2-f40478c796ec',
                    name: 'Тип',
                    value: '={{ $json["Тип"] }}',
                    type: 'string',
                },
                {
                    id: 'db91109f-465e-4e11-a301-a10bfc78f644',
                    name: 'Сумма',
                    value: '={{  $json["Сумма"].toLocaleString("ru-RU") }}',
                    type: 'string',
                },
                {
                    id: '886f7573-0f62-4186-af77-749d40089a93',
                    name: 'Комментарий',
                    value: '={{ $json["Комментарий"] }}',
                    type: 'string',
                },
                {
                    id: 'de9efb8b-3c54-465d-843b-369e7b1740ff',
                    name: 'username',
                    value: '={{ $json.username }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getCash2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2080, 112],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getcash2 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 763737235,
            mode: 'list',
            cachedResultName: 'CashVocabulary',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=763737235',
        },
        options: {},
    };

    @node({
        name: 'Webhook1',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [-2624, -80],
    })
    Webhook1 = {
        httpMethod: 'POST',
        path: 'CashRegister',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
        },
    };

    @node({
        name: 'append',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2080, 288],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Append = {
        authentication: 'serviceAccount',
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1C4D4tPQ7fJDcjxQTZxt7AmwTv5MhdON5v8giZUWHLPs',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: '={{ $json.sheetName_accounting }}',
            mode: 'name',
        },
        columns: {
            mappingMode: 'autoMapInputData',
            value: {},
            matchingColumns: ['id'],
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
                },
                {
                    id: 'id',
                    displayName: 'id',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'countInBudget',
                    displayName: 'countInBudget',
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
                    id: 'Столбец 16',
                    displayName: 'Столбец 16',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Столбец 17',
                    displayName: 'Столбец 17',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'storeName',
                    displayName: 'storeName',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
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
                    id: 'storeId',
                    displayName: 'storeId',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'sheetName_accounting',
                    displayName: 'sheetName_accounting',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'accounting',
                    displayName: 'accounting',
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
        name: 'Edit Fields1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-2304, 96],
    })
    EditFields1 = {
        mode: 'raw',
        jsonOutput: '=\n {{ $json.body.value }}',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.Switch_.in(0));
        this.Switch_.out(0).to(this.Getcash.in(0));
        this.Switch_.out(1).to(this.Getcash1.in(0));
        this.Switch_.out(2).to(this.Getcash2.in(0));
        this.Switch_.out(3).to(this.EditFields1.in(0));
        this.Getcash.out(0).to(this.RespondToWebhook.in(0));
        this.Getcash1.out(0).to(this.EditFields.in(0));
        this.EditFields.out(0).to(this.RespondToWebhook.in(0));
        this.Getcash2.out(0).to(this.RespondToWebhook.in(0));
        this.Webhook1.out(0).to(this.Switch_.in(0));
        this.EditFields1.out(0).to(this.Append.in(0));
        this.Append.out(0).to(this.RespondToWebhook.in(0));
    }
}
