import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/tags
// Nodes   : 8  |  Connections: 5
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// Webhook2                           webhook
// RespondToWebhook6                  respondToWebhook
// RespondToWebhook4                  respondToWebhook
// SetRow                             set
// Savechanges                        googleSheets               [creds]
// Getconfig1                         googleSheets               [creds]
// RespondToWebhook7                  respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Getconfig1
//      → RespondToWebhook7
// Webhook2
//    → SetRow
//      → Savechanges
//        → RespondToWebhook4
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'TBIyzil82lShTiqx',
    name: 'button/tags',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ButtonTagsWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1440, 944],
    })
    Webhook = {
        path: 'tags',
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
        name: 'Webhook2',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1440, 720],
    })
    Webhook2 = {
        httpMethod: 'POST',
        path: 'tags',
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
        name: 'Respond to Webhook6',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [144, 1840],
    })
    RespondToWebhook6 = {
        respondWith: 'json',
        responseBody: '={{ $json.data }}',
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
        name: 'Respond to Webhook4',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-688, 784],
    })
    RespondToWebhook4 = {
        respondWith: 'json',
        responseBody: '{\n  "resp": "true"\n}',
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
        name: 'set row',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-1104, 720],
    })
    SetRow = {
        assignments: {
            assignments: [
                {
                    id: 'ff0d2757-b4c0-4496-a5a2-a2bb2556de82',
                    name: '=row_number',
                    value: '=1',
                    type: 'number',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'saveChanges',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-928, 768],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Savechanges = {
        authentication: 'serviceAccount',
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: '1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 145359037,
            mode: 'list',
            cachedResultName: 'tagsConfig',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=145359037',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                body: '={{ $json.body }}',
                row_number: '={{ $json.row_number }}',
            },
            matchingColumns: ['row_number'],
            schema: [
                {
                    id: 'row_number',
                    displayName: 'row_number',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'body',
                    displayName: 'body',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'headers',
                    displayName: 'headers',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'params',
                    displayName: 'params',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'query',
                    displayName: 'query',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'webhookUrl',
                    displayName: 'webhookUrl',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'executionMode',
                    displayName: 'executionMode',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'getConfig1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-1104, 960],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getconfig1 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 145359037,
            mode: 'list',
            cachedResultName: 'tagsConfig',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=145359037',
        },
        options: {
            returnFirstMatch: false,
        },
    };

    @node({
        name: 'Respond to Webhook7',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-688, 960],
    })
    RespondToWebhook7 = {
        respondWith: 'text',
        responseBody: '={{ JSON.stringify($json.body) }}',
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
        this.Webhook.out(0).to(this.Getconfig1.in(0));
        this.Webhook2.out(0).to(this.SetRow.in(0));
        this.SetRow.out(0).to(this.Savechanges.in(0));
        this.Savechanges.out(0).to(this.RespondToWebhook4.in(0));
        this.Getconfig1.out(0).to(this.RespondToWebhook7.in(0));
    }
}
