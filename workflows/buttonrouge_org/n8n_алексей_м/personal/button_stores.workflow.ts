import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : button/stores
// Nodes   : 2  |  Connections: 1
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WhenExecutedByAnotherWorkflow      executeWorkflowTrigger
// GetStores                          googleSheets               [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenExecutedByAnotherWorkflow
//    → GetStores
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'ZdvNHW0oFoJSqbjT',
    name: 'button/stores',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ButtonStoresWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'When Executed by Another Workflow',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [-2384, -304],
    })
    WhenExecutedByAnotherWorkflow = {
        inputSource: 'passthrough',
    };

    @node({
        name: 'get stores',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2080, -288],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GetStores = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '=1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1090132997,
            mode: 'list',
            cachedResultName: 'stores',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=1090132997',
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenExecutedByAnotherWorkflow.out(0).to(this.GetStores.in(0));
    }
}
