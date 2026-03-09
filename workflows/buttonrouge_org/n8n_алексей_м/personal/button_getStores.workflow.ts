import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/getStores
// Nodes   : 5  |  Connections: 4
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// Switch_                            switch
// Webhook2                           webhook
// RespondToWebhook7                  respondToWebhook
// Getstores                          executeWorkflow
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Switch_
//      → Getstores
//        → RespondToWebhook7
// Webhook2
//    → Switch_ (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'LnFR3805UOxKmVlx',
    name: 'button/getStores',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ButtonGetstoresWorkflow {
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
        path: 'stores',
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
        position: [-1920, -96],
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
                                rightValue: 'getStores',
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
                    outputKey: 'getStores',
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
        path: 'stores',
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
        name: 'Respond to Webhook7',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-1360, -96],
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
        name: 'getStores',
        type: 'n8n-nodes-base.executeWorkflow',
        version: 1.2,
        position: [-1632, -96],
    })
    Getstores = {
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
        mode: 'each',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.Switch_.in(0));
        this.Switch_.out(0).to(this.Getstores.in(0));
        this.Webhook2.out(0).to(this.Switch_.in(0));
        this.Getstores.out(0).to(this.RespondToWebhook7.in(0));
    }
}
