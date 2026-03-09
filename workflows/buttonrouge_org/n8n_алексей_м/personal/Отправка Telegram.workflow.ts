import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Отправка Telegram
// Nodes   : 6  |  Connections: 5
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ScheduleTrigger                    scheduleTrigger
// SendATextMessage                   telegram                   [creds]
// Getbudget                          googleSheets               [creds]
// EditFields                         set
// EditFields1                        set
// Aggregate                          aggregate
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ScheduleTrigger
//    → Getbudget
//      → EditFields
//        → Aggregate
//          → EditFields1
//            → SendATextMessage
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '5ELOA9aauQoT17x0',
    name: 'Отправка Telegram',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class TelegramWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [-620, -120],
    })
    ScheduleTrigger = {
        rule: {
            interval: [
                {
                    triggerAtHour: 11,
                },
            ],
        },
    };

    @node({
        name: 'Send a text message',
        type: 'n8n-nodes-base.telegram',
        version: 1.2,
        position: [620, 160],
        credentials: { telegramApi: { id: 'lFQKH2n9JXxdFI4k', name: 'Button Rouge Sales Chat' } },
    })
    SendATextMessage = {
        chatId: '-4530967442',
        text: '=Расход: {{ $json.a.round().toLocaleString() }}\nПрибыль: {{ $json.b.round().toLocaleString() }}\nПрибыль (накоп) {{ $json.c.round().toLocaleString() }}',
        additionalFields: {
            appendAttribution: false,
        },
    };

    @node({
        name: 'getBudget',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-60, -80],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    Getbudget = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '=1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 2146136298,
            mode: 'list',
            cachedResultName: 'PNL',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1aBum8A3U6tK5VTdmSG3RwhwJrhB5Wbu_zhDUgHLey5M/edit#gid=2146136298',
        },
        options: {
            dataLocationOnSheet: {
                values: {
                    rangeDefinition: 'specifyRange',
                    headerRow: 4,
                    firstDataRow: 28,
                },
            },
        },
    };

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [160, -80],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: '52047c2c-de16-42a7-b0f5-6c90cb8d21e8',
                    name: '=',
                    value: '={{ $json[`01.${(new Date().getMonth() + 1).toString().padStart(2,"0")}.${new Date().getFullYear()}`] }}\n',
                    type: 'number',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Edit Fields1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [660, -60],
    })
    EditFields1 = {
        assignments: {
            assignments: [
                {
                    id: '0dbb76db-a37f-4582-845a-1ae119a2d223',
                    name: 'a',
                    value: "={{ $json.data[0][''] }}",
                    type: 'number',
                },
                {
                    id: '06d4b3dd-0858-4b29-8ce4-c0776c8115fc',
                    name: 'b',
                    value: "={{ $json.data[1][''] }}",
                    type: 'number',
                },
                {
                    id: '30efcadd-1a5a-433f-8832-d273826a84c2',
                    name: 'c',
                    value: "={{ $json.data[2][''] }}",
                    type: 'number',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Aggregate',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [360, 100],
    })
    Aggregate = {
        aggregate: 'aggregateAllItemData',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Getbudget.out(0).to(this.EditFields.in(0));
        this.EditFields.out(0).to(this.Aggregate.in(0));
        this.EditFields1.out(0).to(this.SendATextMessage.in(0));
        this.Aggregate.out(0).to(this.EditFields1.in(0));
        this.ScheduleTrigger.out(0).to(this.Getbudget.in(0));
    }
}
