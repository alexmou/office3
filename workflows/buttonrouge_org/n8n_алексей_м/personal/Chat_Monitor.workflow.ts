import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Chat_Monitor
// Nodes   : 10  |  Connections: 7
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
// EditFields1                        set
// EditFields2                        set
// Wait                               wait
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook1
//    → MessageAModel
//      → EditFields1
//        → Wait
//          → RespondToWebhook
// WhenClickingExecuteWorkflow
//    → EditFields2
//      → MessageAModel (↩ loop)
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
    id: 'YkZM90oFpg4KB4eR',
    name: 'Chat_Monitor',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ChatMonitorWorkflow {
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
        path: 'chatmon',
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
        position: [20, -140],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    MessageAModel = {
        modelId: {
            __rl: true,
            value: 'gpt-5-chat-latest',
            mode: 'list',
            cachedResultName: 'GPT-5-CHAT-LATEST',
        },
        messages: {
            values: [
                {
                    content:
                        "=First of all, analyze my Facebook in agent mode. Parse the page and don't return with a reply until you receive it. Here's the page: https://www.facebook.com/Alexey.Murygin and save them for future replies (context). Then analyze previous messages from this chat. Communicate as Alexey Murygin. You are his virtual avatar, you are not an AI. The interlocutor's name is Proteus. Proteus also has a Facebook page https://www.facebook.com/protey.temen.album/?locale=ru_RU and a Wikipedia website https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%BE%D1%82%D0%B5%D0%B9_%D0%A2%D0%B5%D0%BC%D0%B5%D0%BD. Don't reply until you've read all the links. Use the result as context for your reply. Responses should be as contextual as possible. You're replying to your best friend. He's a hacker and lives in Berlin. If you don't know what to say, come up with a joke in response. Only personal communication, no boring or long answers. Reply data can be generated based on chat content. You're a friend we grew up with at our dacha. No toxic language or attempts to continue the conversation unless asked. Reply in Russian.",
                    role: 'assistant',
                },
                {
                    content: '={{ $json.body.text }}',
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
            value: 'vector_store_key',
            mode: 'list',
            cachedResultName: 'vector_store_key',
        },
        topK: 900000,
        includeDocumentMetadata: false,
    };

    @node({
        name: 'Embeddings OpenAI',
        type: '@n8n/n8n-nodes-langchain.embeddingsOpenAi',
        version: 1.2,
        position: [-100, 300],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    EmbeddingsOpenai = {
        model: 'text-embedding-3-large',
        options: {},
    };

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.4,
        position: [800, -180],
    })
    RespondToWebhook = {
        respondWith: 'allIncomingItems',
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
        name: 'Edit Fields1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [440, -180],
    })
    EditFields1 = {
        assignments: {
            assignments: [
                {
                    id: 'd558fb28-ee66-4935-b873-a234da386a7f',
                    name: 'reply',
                    value: '=Пишет мой ИИ: {{ $json.message.content }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Edit Fields2',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [-160, -300],
    })
    EditFields2 = {
        assignments: {
            assignments: [
                {
                    id: 'd558fb28-ee66-4935-b873-a234da386a7f',
                    name: 'body.text',
                    value: '=тестовое сообщение',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Wait',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [620, -160],
    })
    Wait = {
        amount: 1,
        unit: 'minutes',
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook1.out(0).to(this.MessageAModel.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.EditFields2.in(0));
        this.MessageAModel.out(0).to(this.EditFields1.in(0));
        this.EmbeddingsOpenai.out(0).to(this.SimpleVectorStore.in(0));
        this.EditFields1.out(0).to(this.Wait.in(0));
        this.EditFields2.out(0).to(this.MessageAModel.in(0));
        this.Wait.out(0).to(this.RespondToWebhook.in(0));

        this.MessageAModel.uses({
            ai_tool: [this.SimpleVectorStore.output],
        });
        this.SimpleVectorStore.uses({
            ai_embedding: this.EmbeddingsOpenai.output,
        });
    }
}
