import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Cache
// Nodes   : 7  |  Connections: 5
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// SimpleMemory                       memoryBufferWindow
// Start                              executeWorkflowTrigger
// ClearCache                         memoryManager              [AI]
// WhenClickingExecuteWorkflow        manualTrigger
// WriteCache                         memoryManager              [AI]
// Switch_                            switch
// Readcache                          memoryManager              [AI]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Start
//    → Switch_
//      → ClearCache
//     .out(1) → WriteCache
//     .out(2) → Readcache
// WhenClickingExecuteWorkflow
//    → Switch_ (↩ loop)
//
// AI CONNECTIONS
// SimpleMemory.uses({ ai_memory: ClearCache, ai_memory: WriteCache, ai_memory: Readcache })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'zJQKJCDHBbVqaEsU',
    name: 'Cache',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class CacheWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Simple Memory',
        type: '@n8n/n8n-nodes-langchain.memoryBufferWindow',
        version: 1.3,
        position: [-940, -760],
    })
    SimpleMemory = {
        sessionIdType: 'customKey',
        sessionKey: "={{$('Start').first().json.endpoint}}",
        contextWindowLength: 1,
    };

    @node({
        name: 'Start',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [-1580, -1000],
    })
    Start = {
        inputSource: 'passthrough',
    };

    @node({
        name: 'Clear cache',
        type: '@n8n/n8n-nodes-langchain.memoryManager',
        version: 1.1,
        position: [-640, -1320],
    })
    ClearCache = {
        mode: 'delete',
        deleteMode: 'all',
    };

    @node({
        name: 'When clicking ‘Execute workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1700, -1320],
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        name: 'Write cache',
        type: '@n8n/n8n-nodes-langchain.memoryManager',
        version: 1.1,
        position: [-640, -1160],
    })
    WriteCache = {
        mode: 'insert',
        insertMode: 'override',
        messages: {
            messageValues: [
                {
                    type: '=system',
                    message: '={{ $json.toJsonString() }}',
                },
            ],
        },
    };

    @node({
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-1120, -1140],
    })
    Switch_ = {
        rules: {
            values: [
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                leftValue: '={{ $json.action }}',
                                rightValue: 'clearCache',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                },
                                id: 'ef849183-3e75-4497-9682-a7b48c3c2138',
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'clearCache',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: 'bfdf48bb-d08d-49b4-94e0-04cd85b9ccd5',
                                leftValue: '={{ $json.action }}',
                                rightValue: 'writeCache',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                    name: 'filter.operator.equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'writeCache',
                },
                {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict',
                            version: 2,
                        },
                        conditions: [
                            {
                                id: 'ba9a3779-eae0-466f-b65f-f207318b4ae3',
                                leftValue: '={{ $json.action }}',
                                rightValue: 'readCache',
                                operator: {
                                    type: 'string',
                                    operation: 'equals',
                                    name: 'filter.operator.equals',
                                },
                            },
                        ],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'readCache',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'readCache',
        type: '@n8n/n8n-nodes-langchain.memoryManager',
        version: 1.1,
        position: [-640, -1020],
    })
    Readcache = {
        options: {
            groupMessages: false,
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Start.out(0).to(this.Switch_.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.Switch_.in(0));
        this.Switch_.out(0).to(this.ClearCache.in(0));
        this.Switch_.out(1).to(this.WriteCache.in(0));
        this.Switch_.out(2).to(this.Readcache.in(0));

        this.ClearCache.uses({
            ai_memory: this.SimpleMemory.output,
        });
        this.WriteCache.uses({
            ai_memory: this.SimpleMemory.output,
        });
        this.Readcache.uses({
            ai_memory: this.SimpleMemory.output,
        });
    }
}
