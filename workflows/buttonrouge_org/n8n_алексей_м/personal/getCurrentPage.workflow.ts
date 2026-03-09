import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : getCurrentPage
// Nodes   : 7  |  Connections: 6
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WhenClickingExecuteWorkflow        manualTrigger
// EditFields                         set
// Jsondatabase                       JsonDatabase
// Jsondatabase1                      JsonDatabase
// Webhook                            webhook
// Webhook1                           webhook
// RespondToWebhook                   respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenClickingExecuteWorkflow
//    → EditFields
//      → Jsondatabase
//        → Jsondatabase1
//          → RespondToWebhook
// Webhook
//    → Jsondatabase (↩ loop)
// Webhook1
//    → Jsondatabase (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'w56q5GdHlbgzpE7E',
    name: 'getCurrentPage',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class GetcurrentpageWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'When clicking ‘Execute workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1300, -240],
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-940, -240],
    })
    EditFields = {
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
        name: 'JsonDatabase',
        type: '@n-octo-n/n8n-nodes-json-database.JsonDatabase',
        version: 1,
        position: [-640, -380],
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
        position: [-320, -380],
    })
    Jsondatabase1 = {
        queryPath: 'settings',
    };

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1320, -660],
    })
    Webhook = {
        path: 'getCurrentPage',
        options: {},
    };

    @node({
        name: 'Webhook1',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1380, -500],
    })
    Webhook1 = {
        httpMethod: 'POST',
        path: 'setCurrentPage',
        options: {},
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.4,
        position: [20, -440],
    })
    RespondToWebhook = {
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenClickingExecuteWorkflow.out(0).to(this.EditFields.in(0));
        this.EditFields.out(0).to(this.Jsondatabase.in(0));
        this.Jsondatabase.out(0).to(this.Jsondatabase1.in(0));
        this.Webhook.out(0).to(this.Jsondatabase.in(0));
        this.Webhook1.out(0).to(this.Jsondatabase.in(0));
        this.Jsondatabase1.out(0).to(this.RespondToWebhook.in(0));
    }
}
