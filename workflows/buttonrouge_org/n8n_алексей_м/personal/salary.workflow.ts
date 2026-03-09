import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : salary
// Nodes   : 4  |  Connections: 3
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// RespondToWebhook                   respondToWebhook
// Getsalary                          googleSheets               [creds]
// Webhook                            webhook
// EditFields                         set
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → Getsalary
//      → EditFields
//        → RespondToWebhook
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'rIjQhZPR3nLFhiNX',
    name: 'salary',
    active: true,
    settings: { executionOrder: 'v1', availableInMCP: false },
})
export class SalaryWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-1872, -176],
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
        name: 'getSalary',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2272, -176],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getsalary = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1597077839,
            mode: 'list',
            cachedResultName: 'Sales',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k/edit#gid=1597077839',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'username',
                    lookupValue: '={{ $json.query.username }}',
                },
            ],
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'detectAutomatically',
                },
            },
        },
    };

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [-2512, -176],
    })
    Webhook = {
        path: 'Salary',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
        },
    };

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-2080, -176],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: 'e12868b8-d59e-4bc2-8875-1e63da072252',
                    name: 'date',
                    value: '={{ $json.date }}',
                    type: 'string',
                },
                {
                    id: '2e2b4b5f-8b43-465d-9cb4-9ec9d4b1853e',
                    name: 'time',
                    value: '={{ $json.time }}',
                    type: 'string',
                },
                {
                    id: '60cf0328-dfde-4cee-8ede-7240f3417c78',
                    name: 'article',
                    value: '={{ $json.article }}',
                    type: 'string',
                },
                {
                    id: '5c55a7b0-34d4-42e5-b967-dc1ab0a9d9e5',
                    name: 'Brand',
                    value: '={{ $json.Brand }}',
                    type: 'string',
                },
                {
                    id: 'ae672c9b-34a5-4d9a-813b-52c622e564e8',
                    name: 'Name',
                    value: '={{ $json.Name }}',
                    type: 'string',
                },
                {
                    id: 'c41ada66-7509-402e-bf67-296ace959598',
                    name: 'salary',
                    value: '={{ $json.salary }}',
                    type: 'number',
                },
                {
                    id: '93d2407a-5270-4bcd-b3fd-3d79caaeb29d',
                    name: 'description',
                    value: '={{ $json.description }}',
                    type: 'string',
                },
                {
                    id: '2a0e1431-63ee-463d-998a-29cf02177d2f',
                    name: 'paymentmethod',
                    value: '={{ $json.paymentmethod }}',
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
        this.Getsalary.out(0).to(this.EditFields.in(0));
        this.Webhook.out(0).to(this.Getsalary.in(0));
        this.EditFields.out(0).to(this.RespondToWebhook.in(0));
    }
}
