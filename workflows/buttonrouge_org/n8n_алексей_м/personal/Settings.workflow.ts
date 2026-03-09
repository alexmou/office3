import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Settings
// Nodes   : 7  |  Connections: 5
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// GlobalSettings                     set
// WhenExecutedByAnotherWorkflow      executeWorkflowTrigger
// Nyachang1                          set
// Aggregate                          aggregate
// Nyachang11                         set
// Nyachang                           set
// Merge                              merge
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenExecutedByAnotherWorkflow
//    → GlobalSettings
//      → Nyachang1
//        → Merge.in(1)
//      → Nyachang11
//        → Merge (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'Pl6Oqey2z3gYBNA7',
    name: 'Settings',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class SettingsWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Global settings',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-220, 140],
    })
    GlobalSettings = {
        assignments: {
            assignments: [
                {
                    id: '7048f07e-e7ae-4350-8dd0-10a904be1a24',
                    name: 'homePath',
                    value: '/home/l_murygin/',
                    type: 'string',
                },
                {
                    id: '0d21403a-09b0-481b-be40-ca28e9868479',
                    name: 'version',
                    value: 'p8',
                    type: 'string',
                },
                {
                    id: '787efd58-718f-4b31-bf29-c9fa8d070778',
                    name: '=logsPath',
                    value: '={{$parameter.assignments.values()[0][0].value}}{{$parameter.assignments.values()[0][1].value}}/data/logs/',
                    type: 'string',
                },
                {
                    id: '83740107-4c51-455d-b531-a031985b296c',
                    name: 'WorkPath',
                    value: '={{$parameter.assignments.values()[0][0].value}}{{$parameter.assignments.values()[0][1].value}}/',
                    type: 'string',
                },
                {
                    id: 'b8cb5367-b2c6-4d21-ba74-09f1eed3d6d9',
                    name: 'DataPath',
                    value: '={{$parameter.assignments.values()[0][0].value}}{{$parameter.assignments.values()[0][1].value}}/data/',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'When Executed by Another Workflow',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [-500, 300],
    })
    WhenExecutedByAnotherWorkflow = {
        inputSource: 'passthrough',
    };

    @node({
        name: 'nyachang_1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [0, 240],
    })
    Nyachang1 = {
        assignments: {
            assignments: [
                {
                    id: 'd267530a-cf1a-4c00-98a6-cfaf62af4856',
                    name: 'ChannelName',
                    value: 'nyachang_1',
                    type: 'string',
                },
                {
                    id: '59c10ae2-7a84-460c-9563-cb0a69e9b5de',
                    name: 'Description',
                    value: 'Барахолка',
                    type: 'string',
                },
                {
                    id: '7506ab24-0be1-485b-85ab-b1001d13a3ce',
                    name: 'ChannelExpirationDays',
                    value: '5',
                    type: 'string',
                },
                {
                    id: '7ce4fd0e-329b-4f5a-8734-d1c0ef29e39f',
                    name: 'Active',
                    value: true,
                    type: 'boolean',
                },
                {
                    id: '17015e11-351c-49db-a7c7-6774d3d29ee1',
                    name: 'WorkPath',
                    value: '={{ $json.WorkPath }}',
                    type: 'string',
                },
                {
                    id: '402ea5e3-e1c1-44d2-b933-a3224e3ca2bd',
                    name: 'DataPath',
                    value: '={{ $json.DataPath }}',
                    type: 'string',
                },
                {
                    id: 'f278d165-cea9-4d9a-be49-81c9e5d09da0',
                    name: 'logsPath',
                    value: '={{ $json.logsPath }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Aggregate',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [600, -60],
    })
    Aggregate = {
        fieldsToAggregate: {
            fieldToAggregate: [
                {
                    fieldToAggregate: 'ChannelName',
                },
                {
                    fieldToAggregate: 'WorkPath',
                },
                {
                    fieldToAggregate: 'Description',
                },
                {
                    fieldToAggregate: 'ChannelExpirationDays',
                },
                {
                    fieldToAggregate: 'Active',
                },
                {
                    fieldToAggregate: 'DataPath',
                },
                {
                    fieldToAggregate: 'logsPath',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'nyachang1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [0, 0],
    })
    Nyachang11 = {
        assignments: {
            assignments: [
                {
                    id: 'd267530a-cf1a-4c00-98a6-cfaf62af4856',
                    name: 'ChannelName',
                    value: 'nyachang1',
                    type: 'string',
                },
                {
                    id: '59c10ae2-7a84-460c-9563-cb0a69e9b5de',
                    name: 'Description',
                    value: 'Барахолка',
                    type: 'string',
                },
                {
                    id: '7506ab24-0be1-485b-85ab-b1001d13a3ce',
                    name: 'ChannelExpirationDays',
                    value: '5',
                    type: 'string',
                },
                {
                    id: '7ce4fd0e-329b-4f5a-8734-d1c0ef29e39f',
                    name: 'Active',
                    value: true,
                    type: 'boolean',
                },
                {
                    id: '17015e11-351c-49db-a7c7-6774d3d29ee1',
                    name: 'WorkPath',
                    value: '={{ $json.WorkPath }}',
                    type: 'string',
                },
                {
                    id: '402ea5e3-e1c1-44d2-b933-a3224e3ca2bd',
                    name: 'DataPath',
                    value: '={{ $json.DataPath }}',
                    type: 'string',
                },
                {
                    id: 'f278d165-cea9-4d9a-be49-81c9e5d09da0',
                    name: 'logsPath',
                    value: '={{ $json.logsPath }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'nyachang',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [600, 200],
    })
    Nyachang = {
        assignments: {
            assignments: [
                {
                    id: '1e3a9b0a-d43b-4842-b291-6561a6a97228',
                    name: 'ChannelName1',
                    value: '={{ $json.data1 }}',
                    type: 'string',
                },
                {
                    id: '3be882da-6f55-441e-9ef2-7581e6c745af',
                    name: 'ChannelName2',
                    value: '={{ $json.data2 }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3,
        position: [360, 120],
    })
    Merge = {};

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.GlobalSettings.out(0).to(this.Nyachang1.in(0));
        this.GlobalSettings.out(0).to(this.Nyachang11.in(0));
        this.WhenExecutedByAnotherWorkflow.out(0).to(this.GlobalSettings.in(0));
        this.Nyachang1.out(0).to(this.Merge.in(1));
        this.Nyachang11.out(0).to(this.Merge.in(0));
    }
}
