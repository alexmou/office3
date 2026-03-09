import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : optimus_sausisus
// Nodes   : 8  |  Connections: 4
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook1                           webhook
// WhenClickingExecuteWorkflow        manualTrigger
// MessageAModel                      openAi                     [AI] [creds]
// SimpleVectorStore                  vectorStoreInMemory        [AI]
// EmbeddingsOpenai                   embeddingsOpenAi           [creds]
// RespondToWebhook                   respondToWebhook
// EditFields                         set
// Html                               html
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook1
//    → MessageAModel
//      → RespondToWebhook
// WhenClickingExecuteWorkflow
//    → MessageAModel (↩ loop)
// EmbeddingsOpenai
//    → SimpleVectorStore
//
// AI CONNECTIONS
// SimpleVectorStore.uses({ ai_tool: [SimpleVectorStore] })
// EmbeddingsOpenai.uses({ ai_embedding: SimpleVectorStore })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'w7ilpb0gihr586F8',
    name: 'optimus_sausisus',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class OptimusSausisusWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook1',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-420, -40],
    })
    Webhook1 = {
        httpMethod: 'POST',
        path: 'sosiska_na_vinos',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        name: 'When clicking ‘Execute workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-460, -260],
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        name: 'Message a model',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-20, -120],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    MessageAModel = {
        modelId: {
            __rl: true,
            value: 'gpt-5',
            mode: 'list',
            cachedResultName: 'GPT-5',
        },
        messages: {
            values: [
                {
                    content: '=Исправь ошибки в тексте и придай ему стиль деловой переписки',
                    role: 'system',
                },
                {
                    content: '={{ $json.body }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Simple Vector Store',
        type: '@n8n/n8n-nodes-langchain.vectorStoreInMemory',
        version: 1.3,
        position: [-20, 120],
    })
    SimpleVectorStore = {
        mode: 'retrieve-as-tool',
        toolDescription: '=',
        memoryKey: {
            __rl: true,
            mode: 'list',
            value: 'vector_store_key',
        },
    };

    @node({
        name: 'Embeddings OpenAI',
        type: '@n8n/n8n-nodes-langchain.embeddingsOpenAi',
        version: 1.2,
        position: [60, 300],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    EmbeddingsOpenai = {
        options: {},
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.4,
        position: [720, -220],
    })
    RespondToWebhook = {
        respondWith: 'text',
        responseBody: '={{ $json.message.content }}',
        options: {},
    };

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [380, 140],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: '91a82e71-270e-422a-b0bd-e08acbf5916a',
                    name: '',
                    value: '={{ $json.message.content.toJsonString().toString()}}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'HTML',
        type: 'n8n-nodes-base.html',
        version: 1.2,
        position: [500, -120],
    })
    Html = {
        html: '<b>Замененный <i>HTML</i>{{ $json.message.content }}</b>',
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook1.out(0).to(this.MessageAModel.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.MessageAModel.in(0));
        this.MessageAModel.out(0).to(this.RespondToWebhook.in(0));
        this.EmbeddingsOpenai.out(0).to(this.SimpleVectorStore.in(0));

        this.MessageAModel.uses({
            ai_tool: [this.SimpleVectorStore.output],
        });
        this.SimpleVectorStore.uses({
            ai_embedding: this.EmbeddingsOpenai.output,
        });
    }
}
