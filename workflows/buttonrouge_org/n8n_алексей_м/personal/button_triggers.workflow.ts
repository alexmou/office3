import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/triggers
// Nodes   : 7  |  Connections: 7
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
// EditFields                         set
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Post
//    → Switch_
//      → RespondToWebhook1
//     .out(2) → RespondToWebhook2
// Get
//    → Switch_ (↩ loop)
// WhenClickingExecuteWorkflow
//    → Switch_ (↩ loop)
//    → EditFields
//      → RespondToWebhook1 (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'TTxnAmbqpk1QPvwx',
    name: 'button/triggers',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class ButtonTriggersWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-6500, -2040],
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
                                rightValue: 'getMeta',
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
                    outputKey: 'getMeta',
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
        position: [-6700, -1960],
    })
    Post = {
        httpMethod: 'POST',
        path: '9dfa2efa-d311-474a-a18f-93c7a180c1fe',
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
        position: [-6700, -2120],
    })
    Get = {
        path: '91a7a36e-9cab-4957-aee8-3ada47ceaaa0',
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
        position: [-5540, -2060],
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
        position: [-6040, -1920],
    })
    RespondToWebhook2 = {
        respondWith: 'json',
        responseBody:
            '{ \n         "stores":[ {"store":"Boho"},{"store":"Urban"} ],\n         "employees":[ \n           {"employee":"Анна","store":"Boho","fixedRate":40000,"commissionPct":0.05},\n          {"employee":"Alex","store":"Boho","fixedRate":40000,"commissionPct":0.05}\n         ]\n}',
        options: {},
    };

    @node({
        name: 'When clicking ‘Execute workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-6720, -2320],
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-6340, -2240],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: '5c654723-d1da-42b6-b12a-c78948e513df',
                    name: 'swwww',
                    value: 'wwwww',
                    type: 'string',
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
        this.Switch_.out(0).to(this.RespondToWebhook1.in(0));
        this.Switch_.out(2).to(this.RespondToWebhook2.in(0));
        this.Post.out(0).to(this.Switch_.in(0));
        this.Get.out(0).to(this.Switch_.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.Switch_.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.EditFields.in(0));
        this.EditFields.out(0).to(this.RespondToWebhook1.in(0));
    }
}
