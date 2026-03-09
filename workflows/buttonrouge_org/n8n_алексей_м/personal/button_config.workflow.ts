import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/config
// Nodes   : 27  |  Connections: 21
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// Switch_                            switch
// WhenClickingTestWorkflow           manualTrigger
// Webhook2                           webhook
// RespondToWebhook3                  respondToWebhook
// Getconfig                          googleSheets               [creds]
// Aggregate7                         aggregate
// EditFields                         set
// Getstoreid                         googleSheets               [creds]
// Getstorename                       googleSheets               [creds]
// RespondToWebhook4                  respondToWebhook
// Jsondatabase                       JsonDatabase
// Jsondatabase1                      JsonDatabase
// RespondToWebhook                   respondToWebhook
// EditFields1                        set
// Getstoreid1                        googleSheets               [creds]
// RespondToWebhook6                  respondToWebhook
// Kvstorage                          kvStorage
// Kvstorage1                         kvStorage
// Kvstorage2                         kvStorage
// CacheFound1                        if
// Kvstorage3                         kvStorage
// EditFields5                        set
// CacheFound2                        if
// Kvstorage4                         kvStorage
// EditFields2                        set
// ScheduleTrigger                    scheduleTrigger
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Switch_
//      → Kvstorage1
//        → Getconfig
//          → Aggregate7
//            → EditFields
//              → RespondToWebhook3
//                → Kvstorage
//     .out(1) → Kvstorage2
//        → Getstoreid
//          → Getstorename
//            → RespondToWebhook4
//              → Kvstorage3
//     .out(2) → Getstoreid1
//        → RespondToWebhook6
// WhenClickingTestWorkflow
//    → EditFields2
//      → Kvstorage4
// Webhook2
//    → Switch_ (↩ loop)
// CacheFound1
//    → EditFields5
//      → RespondToWebhook4 (↩ loop)
//   .out(1) → Getstoreid (↩ loop)
// CacheFound2
//   .out(1) → Getconfig (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'bT8hmBOQFVQk7iJ9',
    name: 'button/config',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ButtonConfigWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1700, 740],
    })
    Webhook = {
        path: 'config',
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
        position: [-1500, 820],
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
                                rightValue: 'getConfig',
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
                    outputKey: 'getConfig',
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
                                rightValue: 'getUserStoreByToken',
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
                    outputKey: 'getUserStoreByToken',
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
                                rightValue: 'updateConfig',
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
                    outputKey: 'updateConfig',
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
        position: [-1960, 20],
    })
    WhenClickingTestWorkflow = {};

    @node({
        name: 'Webhook2',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1700, 900],
    })
    Webhook2 = {
        httpMethod: 'POST',
        path: 'config',
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
        name: 'Respond to Webhook3',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [260, 260],
    })
    RespondToWebhook3 = {
        respondWith: 'json',
        responseBody: "={{ $json[''] }}",
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
        name: 'getConfig',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-700, 340],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getconfig = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1238827516,
            mode: 'list',
            cachedResultName: 'Config (Настройки)',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=1238827516',
        },
        options: {},
    };

    @node({
        name: 'Aggregate7',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-280, 320],
    })
    Aggregate7 = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: 'Id',
                },
                {
                    fieldToAggregate: 'Значение',
                },
            ],
        },
        options: {
            mergeLists: false,
        },
    };

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-80, 320],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: '8327125b-0f76-413f-81e2-4b38ba54ac84',
                    name: '',
                    value: '={{ (() => {   const [keysField, valuesField] = Object.keys($json);   return Object.fromEntries(     ($json[keysField] || []).map((k, i) => [k, ($json[valuesField] || [])[i]])   ); })() }}',
                    type: 'object',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getStoreId',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-620, 800],
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
                    lookupValue: "={{ $('Switch').item.json.query.data.parseJson().query.token }}",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'getStoreName',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-440, 800],
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
        position: [-200, 820],
    })
    RespondToWebhook4 = {
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
        position: [-900, 1840],
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
        position: [-580, 1820],
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
        position: [-1200, 1960],
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
        name: 'getStoreId1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-620, 980],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getstoreid1 = {
        authentication: 'serviceAccount',
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: '1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1238827516,
            mode: 'list',
            cachedResultName: 'Config (Настройки)',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=1238827516',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Id: '={{ $json.body.keys()[0] }}',
                Значение: '={{ $json.body.values()[0] }}',
            },
            matchingColumns: ['Id'],
            schema: [
                {
                    id: 'Id',
                    displayName: 'Id',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Описание',
                    displayName: 'Описание',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Включено',
                    displayName: 'Включено',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Значение',
                    displayName: 'Значение',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'update_id',
                    displayName: 'update_id',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'message',
                    displayName: 'message',
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
        name: 'Respond to Webhook6',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-200, 980],
    })
    RespondToWebhook6 = {
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
        name: 'KVStorage',
        type: '@telepilotco/n8n-nodes-kv-storage.kvStorage',
        version: 1,
        position: [600, 240],
    })
    Kvstorage = {
        operation: 'setValue',
        key: '=getConfig',
        val: '={{$json}}',
        expire: false,
    };

    @node({
        name: 'KVStorage1',
        type: '@telepilotco/n8n-nodes-kv-storage.kvStorage',
        version: 1,
        position: [-1160, 200],
    })
    Kvstorage1 = {
        key: '=getConfig',
    };

    @node({
        name: 'KVStorage2',
        type: '@telepilotco/n8n-nodes-kv-storage.kvStorage',
        version: 1,
        position: [-1200, 620],
    })
    Kvstorage2 = {
        key: '=getUserStoreByToken',
    };

    @node({
        name: 'Cache found?1',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-960, 600],
    })
    CacheFound1 = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'loose',
                version: 2,
            },
            conditions: [
                {
                    id: '905d8257-149a-48be-9480-97b43692cf62',
                    leftValue: '={{ $json.val[0][""]}}',
                    rightValue: 'null',
                    operator: {
                        type: 'boolean',
                        operation: 'false',
                        singleValue: true,
                    },
                },
                {
                    id: '56a3e24d-2f0e-4101-a364-4b567b018778',
                    leftValue: '={{ $json.val[0].row_number}}',
                    rightValue: 0,
                    operator: {
                        type: 'string',
                        operation: 'notEmpty',
                        singleValue: true,
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {
            ignoreCase: true,
        },
    };

    @node({
        name: 'KVStorage3',
        type: '@telepilotco/n8n-nodes-kv-storage.kvStorage',
        version: 1,
        position: [140, 620],
    })
    Kvstorage3 = {
        operation: 'setValue',
        key: '=getUserStoreByToken',
        val: '={{$json}}',
        expire: false,
    };

    @node({
        name: 'Edit Fields5',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-540, 600],
    })
    EditFields5 = {
        assignments: {
            assignments: [
                {
                    id: 'b921ab8e-6f74-4571-9ba7-2bc41620cb80',
                    name: '',
                    value: '={{ $json.val.first()[""] }}',
                    type: 'object',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Cache found?2',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-900, 140],
    })
    CacheFound2 = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'loose',
                version: 2,
            },
            conditions: [
                {
                    id: '905d8257-149a-48be-9480-97b43692cf62',
                    leftValue: '={{ $json.val[0][""]}}',
                    rightValue: 'null',
                    operator: {
                        type: 'boolean',
                        operation: 'true',
                        singleValue: true,
                    },
                },
                {
                    id: 'f4472bee-ad8b-4744-a042-982a89321345',
                    leftValue: '={{ $json.val[0][""].Email }}',
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
        looseTypeValidation: true,
        options: {
            ignoreCase: true,
        },
    };

    @node({
        name: 'KVStorage4',
        type: '@telepilotco/n8n-nodes-kv-storage.kvStorage',
        version: 1,
        position: [-1220, -140],
    })
    Kvstorage4 = {
        operation: 'setValue',
        key: '={{ $json.Cache }}',
        val: '=""',
        expire: false,
    };

    @node({
        name: 'Edit Fields2',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1560, -120],
    })
    EditFields2 = {
        assignments: {
            assignments: [
                {
                    id: '71018caa-0a50-4031-9dbc-6a1e12877fbb',
                    name: 'Cache',
                    value: '["getConfig", "getUserStoreByToken"]',
                    type: 'array',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [-1840, 220],
    })
    ScheduleTrigger = {
        rule: {
            interval: [
                {
                    field: 'minutes',
                },
            ],
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.Switch_.in(0));
        this.Switch_.out(0).to(this.Kvstorage1.in(0));
        this.Switch_.out(1).to(this.Kvstorage2.in(0));
        this.Switch_.out(2).to(this.Getstoreid1.in(0));
        this.WhenClickingTestWorkflow.out(0).to(this.EditFields2.in(0));
        this.Webhook2.out(0).to(this.Switch_.in(0));
        this.RespondToWebhook3.out(0).to(this.Kvstorage.in(0));
        this.Getconfig.out(0).to(this.Aggregate7.in(0));
        this.Aggregate7.out(0).to(this.EditFields.in(0));
        this.EditFields.out(0).to(this.RespondToWebhook3.in(0));
        this.Getstoreid.out(0).to(this.Getstorename.in(0));
        this.Getstorename.out(0).to(this.RespondToWebhook4.in(0));
        this.Getstoreid1.out(0).to(this.RespondToWebhook6.in(0));
        this.Kvstorage1.out(0).to(this.Getconfig.in(0));
        this.Kvstorage2.out(0).to(this.Getstoreid.in(0));
        this.CacheFound1.out(0).to(this.EditFields5.in(0));
        this.CacheFound1.out(1).to(this.Getstoreid.in(0));
        this.RespondToWebhook4.out(0).to(this.Kvstorage3.in(0));
        this.EditFields5.out(0).to(this.RespondToWebhook4.in(0));
        this.CacheFound2.out(1).to(this.Getconfig.in(0));
        this.EditFields2.out(0).to(this.Kvstorage4.in(0));
    }
}
