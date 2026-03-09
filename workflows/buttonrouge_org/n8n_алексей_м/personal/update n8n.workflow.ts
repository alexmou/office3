import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : update n8n
// Nodes   : 0  |  Connections: 0
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'LIxwQGlx4rxTzDRl',
    name: 'update n8n',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class UpdateN8nWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        // No connections defined
    }
}
