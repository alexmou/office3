import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : vietnam_translate_bot
// Nodes   : 8  |  Connections: 4
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook1                           webhook
// WhenClickingExecuteWorkflow        manualTrigger
// SendATextMessage                   telegram                   [creds]
// MessageAModel                      openAi                     [AI] [creds]
// SimpleVectorStore                  vectorStoreInMemory        [AI]
// EmbeddingsOpenai                   embeddingsOpenAi           [creds]
// ProdHook                           httpRequest
// TestHook                           httpRequest
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook1
//    → MessageAModel
//      → SendATextMessage
// WhenClickingExecuteWorkflow
//    → ProdHook
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
    id: 'ump9qpAGWN9PDtqk',
    name: 'vietnam_translate_bot',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class VietnamTranslateBotWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Webhook1',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-820, 677.5],
    })
    Webhook1 = {
        httpMethod: 'POST',
        path: 'hook_vietnam_translate_bot',
        options: {},
    };

    @node({
        name: 'When clicking ‘Execute workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-1340, 460],
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        name: 'Send a text message',
        type: 'n8n-nodes-base.telegram',
        version: 1.2,
        position: [-240, 677.5],
        credentials: { telegramApi: { id: 'o1pTqeQ0SQvNqnZt', name: 'Telegram account' } },
    })
    SendATextMessage = {
        chatId: "={{ $('Webhook1').item.json.body.message.chat.id }}",
        text: '={{ $json.message.content }}',
        additionalFields: {
            appendAttribution: false,
            parse_mode: 'HTML',
        },
    };

    @node({
        name: 'Message a model',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-600, 677.5],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    MessageAModel = {
        modelId: {
            __rl: true,
            value: 'gpt-4o',
            mode: 'list',
            cachedResultName: 'GPT-4O',
        },
        messages: {
            values: [
                {
                    content:
                        "=You are a professional translator between Vietnamese and the user's language.\n\nYour tasks:\n\n1. Detect the language of the input: \"{{ $json.body.message.text }}\".\n2. The user's language is: {{ $json.body.message.from.language_code }}.\n3. If the input is in Vietnamese — translate it into the user's language.  \n   If the input is in the user's language — translate it into Vietnamese.\n4. Correct any spelling, grammar, or stylistic mistakes or typos before translating.\n5. If the meaning is unclear or ambiguous, provide **2–3 possible translations** that best fit the context.\n6. Output only the translation (or multiple variants), with no extra explanation.\n",
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Simple Vector Store',
        type: '@n8n/n8n-nodes-langchain.vectorStoreInMemory',
        version: 1.3,
        position: [-600, 897.5],
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
        position: [-520, 1092.5],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    EmbeddingsOpenai = {
        options: {},
    };

    @node({
        name: 'prod hook',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-1120, 460],
    })
    ProdHook = {
        method: 'POST',
        url: 'https://api.telegram.org/bot8168430420:AAES0Mw3_pptWu335MyAwe4WP968TEgQrTw/setWebhook?url=https://buttonrouge.org/n8n/webhook/hook_vietnam_translate_bot',
        options: {},
    };

    @node({
        name: 'test hook',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-1120, 660],
    })
    TestHook = {
        method: 'POST',
        url: 'https://api.telegram.org/bot8168430420:AAES0Mw3_pptWu335MyAwe4WP968TEgQrTw/setWebhook?url=https://buttonrouge.org/n8n/webhook-test/hook_vietnam_translate_bot',
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook1.out(0).to(this.MessageAModel.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.ProdHook.in(0));
        this.EmbeddingsOpenai.out(0).to(this.SimpleVectorStore.in(0));
        this.MessageAModel.out(0).to(this.SendATextMessage.in(0));

        this.MessageAModel.uses({
            ai_tool: [this.SimpleVectorStore.output],
        });
        this.SimpleVectorStore.uses({
            ai_embedding: this.EmbeddingsOpenai.output,
        });
    }
}
