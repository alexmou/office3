import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/schedule
// Nodes   : 25  |  Connections: 26
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Switch_                            switch
// Post                               webhook
// Get                                webhook
// RespondToWebhook1                  respondToWebhook
// RespondToWebhook2                  respondToWebhook
// WhenClickingExecuteWorkflow        manualTrigger
// Aggregate                          aggregate
// Aggregate1                         aggregate
// EditFields1                        set
// Merge                              merge
// AppendOrUpdateRowInSheet           googleSheets               [creds]
// EditFields2                        set
// SplitOut                           splitOut
// GetRowSInSheet                     googleSheets               [creds]
// EditFields3                        set
// RespondToWebhook                   respondToWebhook
// RespondToWebhook9                  respondToWebhook
// Node                               filter
// Node1                              filter
// GetRowToDelete                     googleSheets               [creds]
// LoopOverItems                      splitInBatches
// DeleteRowsOrColumnsFromSheet       googleSheets               [creds]
// Node2                              executeWorkflow
// Node3                              set
// GetUsers                           googleSheets               [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Post
//    → Switch_
//      → EditFields3
//        → GetRowSInSheet
//          → RespondToWebhook
//     .out(2) → Node2
//        → EditFields1
//          → Aggregate1
//            → Merge.in(1)
//              → RespondToWebhook2
//     .out(2) → GetUsers
//        → Node3
//          → Aggregate
//            → Merge (↩ loop)
//     .out(3) → EditFields2
//        → SplitOut
//          → Node1
//            → LoopOverItems
//              → RespondToWebhook9
//             .out(1) → GetRowToDelete
//                → DeleteRowsOrColumnsFromSheet
//                  → LoopOverItems (↩ loop)
//          → Node
//            → AppendOrUpdateRowInSheet
//              → RespondToWebhook9 (↩ loop)
// Get
//    → Switch_ (↩ loop)
// WhenClickingExecuteWorkflow
//    → Node2 (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '9z0Gg2KId6ieywKg',
    name: 'button/schedule',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ButtonScheduleWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-6592, -2000],
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
                                rightValue: 'getSchedule',
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
                    outputKey: 'getSchedule',
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
                                rightValue: 'computePayroll',
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
                    outputKey: 'computePayroll',
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
                                rightValue: 'getScheduleMeta',
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
                    outputKey: 'getScheduleMeta',
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
                                rightValue: 'upsertShifts',
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
                    outputKey: 'upsertShifts',
                },
            ],
        },
        options: {
            ignoreCase: true,
        },
    };

    @node({
        name: 'Post',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-6704, -1968],
    })
    Post = {
        httpMethod: 'POST',
        path: 'schedule',
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
        name: 'GET',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-6704, -2128],
    })
    Get = {
        path: 'schedule',
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
        name: 'Respond to Webhook1',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.4,
        position: [-5712, -2208],
    })
    RespondToWebhook1 = {
        respondWith: 'json',
        responseBody:
            '[\n         {\n           "DateISO":"2025-09-01","Store":"Boho","Employee":"Анна",\n    "PlanStart":"10:00","PlanEnd":"18:00",\n         "ActualStart":"10:05","ActualEnd":"18:05","ActualHours":8,\n        "SalesAmount":3500000,"CommissionPct":0.05,"FixedRatePerHour":40000,\n        "Status":"", "Note":"..."\n        },\n           {\n           "DateISO":"2025-09-01","Store":"Boho","Employee":"Таня",\n    "PlanStart":"10:00","PlanEnd":"18:00",\n         "ActualStart":"10:05","ActualEnd":"18:05","ActualHours":8,\n        "SalesAmount":3500000,"CommissionPct":0.05,"FixedRatePerHour":40000,\n        "Status":"", "Note":"..."\n        },\n\n          {   "DateISO":"2025-09-02","Store":"Urban","Employee":"Анна",\n    "PlanStart":"10:00","PlanEnd":"18:00",\n         "ActualStart":"10:05","ActualEnd":"18:05","ActualHours":8,\n        "SalesAmount":3500000,"CommissionPct":0.05,"FixedRatePerHour":40000,\n        "Status":"", "Note":"..."\n        }\n]',
        options: {},
    };

    @node({
        name: 'Respond to Webhook2',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.4,
        position: [-5456, -1728],
    })
    RespondToWebhook2 = {
        respondWith: 'allIncomingItems',
        options: {},
    };

    @node({
        name: 'When clicking ‘Execute workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-6656, -1744],
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        name: 'Aggregate',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-5840, -1840],
    })
    Aggregate = {
        aggregate: 'aggregateAllItemData',
        destinationFieldName: 'employees',
        options: {},
    };

    @node({
        name: 'Aggregate1',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [-5840, -1616],
    })
    Aggregate1 = {
        aggregate: 'aggregateAllItemData',
        destinationFieldName: 'stores',
        options: {},
    };

    @node({
        name: 'Edit Fields1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-6048, -1616],
    })
    EditFields1 = {
        assignments: {
            assignments: [
                {
                    id: '755083be-1b8f-4e8d-b4ce-6ea7ce09a61d',
                    name: 'store',
                    value: '={{ $json.storeName }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-5648, -1728],
    })
    Merge = {};

    @node({
        name: 'Append or update row in sheet',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.6,
        position: [-5264, -1344],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    AppendOrUpdateRowInSheet = {
        authentication: 'serviceAccount',
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: '1lY5uPebaKLu3JdeKUHQ7FdtNizCYOHtFM9MG9lxuY_Q',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'gid=0',
            mode: 'list',
            cachedResultName: 'Shedule',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1lY5uPebaKLu3JdeKUHQ7FdtNizCYOHtFM9MG9lxuY_Q/edit#gid=0',
        },
        columns: {
            mappingMode: 'autoMapInputData',
            value: {},
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
                    id: 'DateISO',
                    displayName: 'DateISO',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Year',
                    displayName: 'Year',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Month',
                    displayName: 'Month',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Store',
                    displayName: 'Store',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Employee',
                    displayName: 'Employee',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'ActualStart',
                    displayName: 'ActualStart',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'ActualEnd',
                    displayName: 'ActualEnd',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'SalaryFix',
                    displayName: 'SalaryFix',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Note',
                    displayName: 'Note',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'ToDelete',
                    displayName: 'ToDelete',
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
        name: 'Edit Fields2',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-6496, -1440],
    })
    EditFields2 = {
        assignments: {
            assignments: [
                {
                    id: 'def16176-04c5-43f0-9df4-70e7f63ff0b9',
                    name: 'body',
                    value: '={{ $json.body }}',
                    type: 'array',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Split Out',
        type: 'n8n-nodes-base.splitOut',
        version: 1,
        position: [-5936, -1344],
    })
    SplitOut = {
        fieldToSplitOut: 'body',
        options: {},
    };

    @node({
        name: 'Get row(s) in sheet',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.6,
        position: [-5760, -2016],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GetRowSInSheet = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1lY5uPebaKLu3JdeKUHQ7FdtNizCYOHtFM9MG9lxuY_Q',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'gid=0',
            mode: 'list',
            cachedResultName: 'Shedule',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1lY5uPebaKLu3JdeKUHQ7FdtNizCYOHtFM9MG9lxuY_Q/edit#gid=0',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'Year',
                    lookupValue: '={{ $json[\'\'].query.Ym.split("-")[0];\n}}',
                },
                {
                    lookupColumn: 'Month',
                    lookupValue: '={{ $json[\'\'].query.Ym.split("-")[1].toNumber() }}',
                },
            ],
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
        position: [-6208, -2064],
    })
    EditFields3 = {
        assignments: {
            assignments: [
                {
                    id: 'f305e21f-2fc3-4bb6-a7b4-2062edba3268',
                    name: '',
                    value: '={{ $json.query.data.parseJson() }}',
                    type: 'object',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.4,
        position: [-5488, -1904],
    })
    RespondToWebhook = {
        respondWith: 'allIncomingItems',
        options: {},
    };

    @node({
        name: 'Respond to Webhook9',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-3776, -1360],
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
        name: 'Добавить',
        type: 'n8n-nodes-base.filter',
        version: 2.2,
        position: [-5696, -1264],
    })
    Node = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 2,
            },
            conditions: [
                {
                    id: 'a8a45588-1b73-4ae7-b774-f0210722d164',
                    leftValue: '={{ $json.ToDelete }}',
                    rightValue: 0,
                    operator: {
                        type: 'number',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        name: 'Удалить',
        type: 'n8n-nodes-base.filter',
        version: 2.2,
        position: [-5728, -1424],
    })
    Node1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'loose',
                version: 2,
            },
            conditions: [
                {
                    id: 'a8a45588-1b73-4ae7-b774-f0210722d164',
                    leftValue: '={{ $json.ToDelete }}',
                    rightValue: '1',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        looseTypeValidation: true,
        options: {},
    };

    @node({
        name: 'Get row to delete',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.6,
        position: [-4384, -1520],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GetRowToDelete = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1lY5uPebaKLu3JdeKUHQ7FdtNizCYOHtFM9MG9lxuY_Q',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'gid=0',
            mode: 'list',
            cachedResultName: 'Shedule',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1lY5uPebaKLu3JdeKUHQ7FdtNizCYOHtFM9MG9lxuY_Q/edit#gid=0',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'Id',
                    lookupValue: '={{ $json.Id }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Loop Over Items',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [-4896, -1536],
    })
    LoopOverItems = {
        options: {
            reset: false,
        },
    };

    @node({
        name: 'Delete rows or columns from sheet',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.6,
        position: [-4128, -1520],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    DeleteRowsOrColumnsFromSheet = {
        authentication: 'serviceAccount',
        operation: 'delete',
        documentId: {
            __rl: true,
            value: '1lY5uPebaKLu3JdeKUHQ7FdtNizCYOHtFM9MG9lxuY_Q',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 'gid=0',
            mode: 'list',
            cachedResultName: 'Shedule',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1lY5uPebaKLu3JdeKUHQ7FdtNizCYOHtFM9MG9lxuY_Q/edit#gid=0',
        },
        startIndex: '={{ $json.row_number }}',
    };

    @node({
        name: 'список магазинов',
        type: 'n8n-nodes-base.executeWorkflow',
        version: 1.2,
        position: [-6224, -1616],
    })
    Node2 = {
        workflowId: {
            __rl: true,
            value: 'ZdvNHW0oFoJSqbjT',
            mode: 'list',
            cachedResultUrl: '/n8n/workflow/ZdvNHW0oFoJSqbjT',
            cachedResultName: 'button/stores',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {},
            matchingColumns: [],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: true,
        },
        options: {},
    };

    @node({
        name: 'Фиксированная ставка',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-6048, -1840],
    })
    Node3 = {
        assignments: {
            assignments: [
                {
                    id: '36f29ff5-57ab-494c-a6aa-5365ea857c48',
                    name: 'fixedRate',
                    value: '={{ $json.salaryFixHour }}',
                    type: 'string',
                },
                {
                    id: '4b87ed54-c1e2-4614-8b8d-c953faadbdc7',
                    name: 'employee',
                    value: '={{ $json.Name }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'get users',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-6256, -1840],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GetUsers = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '=1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
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
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Switch_.out(0).to(this.EditFields3.in(0));
        this.Switch_.out(2).to(this.Node2.in(0));
        this.Switch_.out(2).to(this.GetUsers.in(0));
        this.Switch_.out(3).to(this.EditFields2.in(0));
        this.Post.out(0).to(this.Switch_.in(0));
        this.Get.out(0).to(this.Switch_.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.Node2.in(0));
        this.Aggregate.out(0).to(this.Merge.in(0));
        this.EditFields1.out(0).to(this.Aggregate1.in(0));
        this.Aggregate1.out(0).to(this.Merge.in(1));
        this.Merge.out(0).to(this.RespondToWebhook2.in(0));
        this.EditFields2.out(0).to(this.SplitOut.in(0));
        this.SplitOut.out(0).to(this.Node1.in(0));
        this.SplitOut.out(0).to(this.Node.in(0));
        this.GetRowSInSheet.out(0).to(this.RespondToWebhook.in(0));
        this.EditFields3.out(0).to(this.GetRowSInSheet.in(0));
        this.AppendOrUpdateRowInSheet.out(0).to(this.RespondToWebhook9.in(0));
        this.Node.out(0).to(this.AppendOrUpdateRowInSheet.in(0));
        this.Node1.out(0).to(this.LoopOverItems.in(0));
        this.GetRowToDelete.out(0).to(this.DeleteRowsOrColumnsFromSheet.in(0));
        this.LoopOverItems.out(0).to(this.RespondToWebhook9.in(0));
        this.LoopOverItems.out(1).to(this.GetRowToDelete.in(0));
        this.DeleteRowsOrColumnsFromSheet.out(0).to(this.LoopOverItems.in(0));
        this.Node2.out(0).to(this.EditFields1.in(0));
        this.Node3.out(0).to(this.Aggregate.in(0));
        this.GetUsers.out(0).to(this.Node3.in(0));
    }
}
