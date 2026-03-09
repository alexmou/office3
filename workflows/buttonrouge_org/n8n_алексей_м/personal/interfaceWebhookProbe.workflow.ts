import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : interfaceWebhookProbe
// Nodes   : 3  |  Connections: 2
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// BuildResponse                      code
// RespondToWebhook                   respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → BuildResponse
//      → RespondToWebhook
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'KXGzvacCW7C6Jmwf',
    name: 'interfaceWebhookProbe',
    active: true,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: false },
})
export class InterfacewebhookprobeWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [-420, 0],
    })
    Webhook = {
        path: 'interfaceWebhookProbe',
        httpMethod: 'POST',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'Build Response',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-120, 0],
    })
    BuildResponse = {
        mode: 'runOnceForAllItems',
        language: 'javaScript',
        jsCode: "const now = new Date().toISOString();\nconst endpoint = 'interfaceWebhookProbe';\n\nreturn $input.all().map((item, index) => ({\n  json: {\n    ok: true,\n    endpoint,\n    receivedAt: now,\n    itemIndex: index,\n    received: item.json\n  }\n}));",
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [140, 0],
    })
    RespondToWebhook = {
        respondWith: 'json',
        responseBody: '={{ $json }}',
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

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.BuildResponse.in(0));
        this.BuildResponse.out(0).to(this.RespondToWebhook.in(0));
    }
}
