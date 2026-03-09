import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : SalaryFix
// Nodes   : 1  |  Connections: 0
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'lcTnjXz7ItCVZbVW',
    name: 'SalaryFix',
    active: false,
    settings: { executionOrder: 'v1', availableInMCP: false },
})
export class SalaryfixWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [-2800, -160],
    })
    Webhook = {
        path: 'SalaryFix',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        // No connections defined
    }
}
