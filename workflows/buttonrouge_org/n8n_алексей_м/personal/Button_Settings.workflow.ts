import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Button_Settings
// Nodes   : 2  |  Connections: 1
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// GptSettings                        set
// WhenClickingTestWorkflow           manualTrigger
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenClickingTestWorkflow
//    → GptSettings
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'WhIBbNPzGBQ8PvMw',
    name: 'Button_Settings',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class ButtonSettingsWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'GPT_Settings',
        type: 'n8n-nodes-base.set',
        version: 2,
        position: [-560, -200],
    })
    GptSettings = {
        values: {
            string: [
                {
                    name: 'vector_store_id',
                    value: 'vs_68199c709af081919078cabc9c0ab327',
                },
                {
                    name: 'assistant_id',
                    value: 'asst_QyhTejkE6fUOg4SlX816tAmb',
                },
                {
                    name: 'thread_id',
                    value: 'thread_kXj2QDjBJGeVZOfqpk2E8BCN',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'When clicking ‘Test workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-820, -300],
    })
    WhenClickingTestWorkflow = {};

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenClickingTestWorkflow.out(0).to(this.GptSettings.in(0));
    }
}
