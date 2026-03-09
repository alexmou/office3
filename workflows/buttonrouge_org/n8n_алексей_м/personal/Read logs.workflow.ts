import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Read logs
// Nodes   : 6  |  Connections: 5
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WhenClickingTestWorkflow           manualTrigger
// GitClone                           executeCommand             [onError→regular]
// GlobalSettings                     set
// Channels                           set
// SplitOut                           splitOut
// ReadLog                            readWriteFile
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenClickingTestWorkflow
//    → GlobalSettings
//      → GitClone
//        → Channels
//          → SplitOut
//            → ReadLog
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'VQqCy60thr6dzBum',
    name: 'Read logs',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class ReadLogsWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'When clicking ‘Test workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-720, -80],
    })
    WhenClickingTestWorkflow = {};

    @node({
        name: 'Git clone',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [-380, -80],
        onError: 'continueRegularOutput',
    })
    GitClone = {
        command: '=git clone https://github.com/alexmou/python /home/l_murygin/{{ $json.version }}',
    };

    @node({
        name: 'Global settings',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-560, -260],
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
                    value: 'p4',
                    type: 'string',
                },
                {
                    id: '787efd58-718f-4b31-bf29-c9fa8d070778',
                    name: '=logsPath',
                    value: '={{$parameter.assignments.values()[0][0].value}}{{$parameter.assignments.values()[0][1].value}}/data/logs',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Channels',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-220, -240],
    })
    Channels = {
        assignments: {
            assignments: [
                {
                    id: 'd267530a-cf1a-4c00-98a6-cfaf62af4856',
                    name: 'channels',
                    value: '["nyachang1"]',
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
        position: [40, -240],
    })
    SplitOut = {
        fieldToSplitOut: 'channels',
        include: 'allOtherFields',
        options: {},
    };

    @node({
        name: 'Read log',
        type: 'n8n-nodes-base.readWriteFile',
        version: 1,
        position: [320, -240],
    })
    ReadLog = {
        fileSelector: "={{ $('Global settings').item.json.logsPath }}{{ $('Channels').item.json.channels }}.log",
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenClickingTestWorkflow.out(0).to(this.GlobalSettings.in(0));
        this.GitClone.out(0).to(this.Channels.in(0));
        this.GlobalSettings.out(0).to(this.GitClone.in(0));
        this.Channels.out(0).to(this.SplitOut.in(0));
        this.SplitOut.out(0).to(this.ReadLog.in(0));
    }
}
