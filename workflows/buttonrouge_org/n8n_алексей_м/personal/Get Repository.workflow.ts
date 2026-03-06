import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Get Repository
// Nodes   : 6  |  Connections: 5
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// GetSettings                        executeWorkflow            
// WhenClickingTestWorkflow           manualTrigger              
// ExecuteCommand                     executeCommand             
// CreateLog                          executeCommand             [onError→regular]
// ExecuteCommand1                    executeCommand             
// ExecuteCommand2                    executeCommand             
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenClickingTestWorkflow
//    → GetSettings
//      → ExecuteCommand
//        → ExecuteCommand2
//          → CreateLog
//            → ExecuteCommand1
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: "3LCBZYvdR3KjR1ia",
    name: "Get Repository",
    active: false,
    settings: {executionOrder:"v1"}
})
export class GetRepositoryWorkflow {

    // =====================================================================
// CONFIGURATION DES NOEUDS
// =====================================================================

    @node({
        name: "Get settings",
        type: "n8n-nodes-base.executeWorkflow",
        version: 1.2,
        position: [-700, -320]
    })
    GetSettings = {
        "workflowId": {
            "__rl": true,
            "value": "Pl6Oqey2z3gYBNA7",
            "mode": "list",
            "cachedResultName": "Settings"
        },
        "workflowInputs": {
            "mappingMode": "defineBelow",
            "value": {},
            "matchingColumns": [],
            "schema": [],
            "attemptToConvertTypes": false,
            "convertFieldsToString": true
        },
        "options": {}
    };

    @node({
        name: "When clicking ‘Test workflow’",
        type: "n8n-nodes-base.manualTrigger",
        version: 1,
        position: [-940, -320]
    })
    WhenClickingTestWorkflow = {};

    @node({
        name: "Execute Command",
        type: "n8n-nodes-base.executeCommand",
        version: 1,
        position: [-500, -320]
    })
    ExecuteCommand = {
        "command": "=rm -rf {{ $json.WorkPath }}\n"
    };

    @node({
        name: "Create log",
        type: "n8n-nodes-base.executeCommand",
        version: 1,
        position: [-120, -320],
        onError: "continueRegularOutput"
    })
    CreateLog = {
        "command": "=sudo mkdir -p {{ $('Get settings').item.json.logsPath }}"
    };

    @node({
        name: "Execute Command1",
        type: "n8n-nodes-base.executeCommand",
        version: 1,
        position: [60, -320]
    })
    ExecuteCommand1 = {
        "command": "=sudo chown -R l_murygin:l_murygin {{ $('Get settings').item.json.WorkPath }}cookies\nsudo chmod -R 700  {{ $('Get settings').item.json.WorkPath }}cookies\nsudo chown -R l_murygin:l_murygin {{ $('Get settings').item.json.WorkPath }}\nsudo chmod -R 700  {{ $('Get settings').item.json.WorkPath }}\nsudo chown -R l_murygin:l_murygin {{ $('Get settings').item.json.DataPath }}\nsudo chmod -R 700  {{ $('Get settings').item.json.DataPath }}"
    };

    @node({
        name: "Execute Command2",
        type: "n8n-nodes-base.executeCommand",
        version: 1,
        position: [-300, -320]
    })
    ExecuteCommand2 = {
        "command": "=sudo git clone https://github.com/alexmou/python {{ $('Get settings').item.json.WorkPath }}"
    };


    // =====================================================================
// ROUTAGE ET CONNEXIONS
// =====================================================================

    @links()
    defineRouting() {
        this.GetSettings.out(0).to(this.ExecuteCommand.in(0));
        this.WhenClickingTestWorkflow.out(0).to(this.GetSettings.in(0));
        this.ExecuteCommand.out(0).to(this.ExecuteCommand2.in(0));
        this.CreateLog.out(0).to(this.ExecuteCommand1.in(0));
        this.ExecuteCommand2.out(0).to(this.CreateLog.in(0));
    }
}