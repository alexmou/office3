import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Menu
// Nodes   : 7  |  Connections: 7
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// GetRowSInSheet                     googleSheets               [creds]
// GetRowSInSheet1                    googleSheets               [creds]
// Merge                              merge
// EditFields                         set
// Filter                             filter
// RespondToWebhook                   respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → GetRowSInSheet
//      → GetRowSInSheet1
//        → Merge
//          → Filter
//            → RespondToWebhook
//      → EditFields
//        → Merge.in(1) (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'hwR6rUBEyPfH3zRl',
    name: 'Menu',
    active: true,
    settings: { executionOrder: 'v1', availableInMCP: false },
})
export class MenuWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [-3344, -704],
    })
    Webhook = {
        path: 'Menu',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
        },
    };

    @node({
        name: 'Get row(s) in sheet',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-3072, -768],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GetRowSInSheet = {
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
                    lookupColumn: 'Name',
                    lookupValue: '={{ $json.query.username }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Get row(s) in sheet1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.7,
        position: [-2704, -752],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GetRowSInSheet1 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 66420331,
            mode: 'list',
            cachedResultName: 'Menu',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=66420331',
        },
        options: {},
    };

    @node({
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3.2,
        position: [-2384, -640],
    })
    Merge = {
        mode: 'combine',
        combineBy: 'combineAll',
        options: {},
    };

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-2704, -560],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: '7bfe4d35-7fdf-41da-b442-dd8ccc4a0f53',
                    name: 'РольПользователя',
                    value: '={{ $json["role"] }}',
                    type: 'number',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Filter',
        type: 'n8n-nodes-base.filter',
        version: 2.3,
        position: [-2176, -640],
    })
    Filter = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '0d939590-33fd-4f1a-b14c-3cdc500ac820',
                    leftValue: '={{ $json["РольПользователя"] }}',
                    rightValue: '={{ $json.role }}',
                    operator: {
                        type: 'number',
                        operation: 'gte',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.5,
        position: [-1904, -640],
    })
    RespondToWebhook = {
        respondWith: 'allIncomingItems',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.GetRowSInSheet.in(0));
        this.GetRowSInSheet.out(0).to(this.GetRowSInSheet1.in(0));
        this.GetRowSInSheet.out(0).to(this.EditFields.in(0));
        this.GetRowSInSheet1.out(0).to(this.Merge.in(0));
        this.EditFields.out(0).to(this.Merge.in(1));
        this.Merge.out(0).to(this.Filter.in(0));
        this.Filter.out(0).to(this.RespondToWebhook.in(0));
    }
}
