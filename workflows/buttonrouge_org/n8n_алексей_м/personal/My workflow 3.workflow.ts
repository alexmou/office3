import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : My workflow 3
// Nodes   : 24  |  Connections: 13
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// RespondToWebhook                   respondToWebhook
// GoogleGeminiChatModel              lmChatGoogleGemini         [creds]
// GoogleVertexChatModel              lmChatGoogleVertex         [creds]
// AiAgent                            agent                      [AI]
// GoogleVertexChatModel1             lmChatGoogleVertex         [creds]
// GoogleCloudRealtimeDatabase        googleFirebaseRealtimeDatabaseTool
// WhenClickingExecuteWorkflow        manualTrigger
// GetRowSInSheet                     googleSheets               [creds]
// Limit                              limit
// RenameKeys                         renameKeys
// Fields                             set
// CreateOrUpdateADocument            googleFirebaseCloudFirestore [onError→regular] [creds]
// GetManyDocuments                   googleFirebaseCloudFirestore [creds]
// Query                              googleFirebaseCloudFirestore [onError→regular] [creds]
// EditFields1                        set
// Config                             set
// AnswerQuestionsWithAVectorStore    toolVectorStore
// VectorStoreRetriever               retrieverVectorStore       [AI]
// SimpleVectorStore                  vectorStoreInMemory        [AI]
// EmbeddingsGoogleVertex             embeddingsGoogleVertex     [creds]
// QuestionAndAnswerChain             chainRetrievalQa           [AI]
// GoogleVertexChatModel2             lmChatGoogleVertex         [creds]
// WhenChatMessageReceived            chatTrigger
// GetAListOfObjects                  googleCloudStorage         [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenClickingExecuteWorkflow
//    → GetRowSInSheet
//      → Limit
//        → RenameKeys
//          → Fields
//            → CreateOrUpdateADocument
//    → GetManyDocuments
//    → Config
//      → EditFields1
//        → Query
// EmbeddingsGoogleVertex
//    → SimpleVectorStore
//      → VectorStoreRetriever
//        → QuestionAndAnswerChain
// WhenChatMessageReceived
//    → QuestionAndAnswerChain (↩ loop)
//
// AI CONNECTIONS
// GoogleVertexChatModel.uses({ ai_languageModel: AiAgent })
// SimpleVectorStore.uses({ ai_vectorStore: VectorStoreRetriever })
// EmbeddingsGoogleVertex.uses({ ai_embedding: SimpleVectorStore })
// VectorStoreRetriever.uses({ ai_retriever: QuestionAndAnswerChain })
// GoogleVertexChatModel2.uses({ ai_languageModel: QuestionAndAnswerChain })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'ahgQOGww8odU2X9H',
    name: 'My workflow 3',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MyWorkflow3Workflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.4,
        position: [340, 760],
    })
    RespondToWebhook = {
        options: {},
    };

    @node({
        name: 'Google Gemini Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [660, 1000],
        credentials: { googlePalmApi: { id: 'IBzYhPYDzQhTZ9Cw', name: 'Google Gemini(PaLM) Api account' } },
    })
    GoogleGeminiChatModel = {
        options: {},
    };

    @node({
        name: 'Google Vertex Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleVertex',
        version: 1,
        position: [600, 820],
        credentials: { googleApi: { id: '14ycWOZAKSAgOSLT', name: 'Google Service Account account' } },
    })
    GoogleVertexChatModel = {
        projectId: {
            __rl: true,
            value: 'button-rouge',
            mode: 'list',
            cachedResultName: 'Button Rouge',
        },
        modelName: 'gemini-2.5-flash-lite-preview-06-17',
        options: {},
    };

    @node({
        name: 'AI Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 2,
        position: [980, 760],
    })
    AiAgent = {
        options: {},
    };

    @node({
        name: 'Google Vertex Chat Model1',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleVertex',
        version: 1,
        position: [1000, 1000],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GoogleVertexChatModel1 = {
        projectId: {
            __rl: true,
            mode: 'list',
            value: '',
        },
        options: {},
    };

    @node({
        name: 'Google Cloud Realtime Database',
        type: 'n8n-nodes-base.googleFirebaseRealtimeDatabaseTool',
        version: 1,
        position: [240, 940],
    })
    GoogleCloudRealtimeDatabase = {};

    @node({
        name: 'When clicking ‘Execute workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-880, -220],
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        name: 'Get row(s) in sheet',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.6,
        position: [-260, -220],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GetRowSInSheet = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 1597077839,
            mode: 'list',
            cachedResultName: 'Sales',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k/edit#gid=1597077839',
        },
        options: {},
    };

    @node({
        name: 'Limit',
        type: 'n8n-nodes-base.limit',
        version: 1,
        position: [-400, 100],
    })
    Limit = {
        maxItems: 5,
    };

    @node({
        name: 'Rename Keys',
        type: 'n8n-nodes-base.renameKeys',
        version: 1,
        position: [-60, 0],
    })
    RenameKeys = {
        keys: {
            key: [
                {
                    currentKey: 'discount_%',
                    newKey: 'discountPercent',
                },
                {
                    currentKey: 'amount to supplier',
                    newKey: 'amountToSupplier',
                },
            ],
        },
        additionalOptions: {},
    };

    @node({
        name: 'fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [120, -260],
    })
    Fields = {
        assignments: {
            assignments: [
                {
                    id: 'ba1c6d35-f8e0-4192-9d1f-e02de00f4392',
                    name: 'fields',
                    value: '={{$json.keys()\n\nconst result = arr.slice(0, 3).join(", ");\n\n\n}}\n',
                    type: 'string',
                },
            ],
        },
        includeOtherFields: true,
        options: {},
    };

    @node({
        name: 'Create or update a document',
        type: 'n8n-nodes-base.googleFirebaseCloudFirestore',
        version: 1.1,
        position: [360, -260],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
        onError: 'continueRegularOutput',
    })
    CreateOrUpdateADocument = {
        authentication: 'serviceAccount',
        operation: 'upsert',
        projectId: '=button-rouge',
        collection: 'sales',
        updateKey: '={{ $json.article.toString() }}',
        columns: '={{ $json.fields }}',
    };

    @node({
        name: 'Get many documents',
        type: 'n8n-nodes-base.googleFirebaseCloudFirestore',
        version: 1.1,
        position: [-460, -540],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GetManyDocuments = {
        authentication: 'serviceAccount',
        operation: 'getAll',
        projectId: '=button-rouge',
        collection: 'sales',
        returnAll: true,
    };

    @node({
        name: 'query',
        type: 'n8n-nodes-base.googleFirebaseCloudFirestore',
        version: 1.1,
        position: [460, -520],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
        onError: 'continueRegularOutput',
    })
    Query = {
        authentication: 'serviceAccount',
        operation: 'query',
        projectId: '=button-rouge',
        query: '={{ $json.toJsonString() }}',
    };

    @node({
        name: 'Edit Fields1',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [260, -520],
    })
    EditFields1 = {
        mode: 'raw',
        jsonOutput:
            '={\n  "structuredQuery": {\n    "where": {\n      "fieldFilter": {\n        "field": {\n          "fieldPath": "{{ $json.filterFieldName }}"\n        },\n        "op": "EQUAL",\n        "value": {\n          "stringValue": "{{ $json.filterFieldValue }}"\n        }\n      }\n    },\n    "from": [{\n      "collectionId": "sales"\n    }]\n  }\n}\n\n',
        options: {},
    };

    @node({
        name: 'config',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [20, -520],
    })
    Config = {
        assignments: {
            assignments: [
                {
                    id: 'd327c6bd-5976-49f6-a2df-3d535a44e649',
                    name: 'filterFieldName',
                    value: 'store',
                    type: 'string',
                },
                {
                    id: 'd071b898-e069-46b2-9d1c-294db67333cc',
                    name: 'filterFieldValue',
                    value: 'Boho',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Answer questions with a vector store',
        type: '@n8n/n8n-nodes-langchain.toolVectorStore',
        version: 1.1,
        position: [840, -560],
    })
    AnswerQuestionsWithAVectorStore = {};

    @node({
        name: 'Vector Store Retriever',
        type: '@n8n/n8n-nodes-langchain.retrieverVectorStore',
        version: 1,
        position: [800, -140],
    })
    VectorStoreRetriever = {};

    @node({
        name: 'Simple Vector Store',
        type: '@n8n/n8n-nodes-langchain.vectorStoreInMemory',
        version: 1.3,
        position: [660, 60],
    })
    SimpleVectorStore = {
        memoryKey: {
            __rl: true,
            mode: 'list',
            value: 'vector_store_key',
        },
    };

    @node({
        name: 'Embeddings Google Vertex',
        type: '@n8n/n8n-nodes-langchain.embeddingsGoogleVertex',
        version: 1,
        position: [640, 220],
        credentials: { googleApi: { id: '14ycWOZAKSAgOSLT', name: 'Google Service Account account' } },
    })
    EmbeddingsGoogleVertex = {
        projectId: {
            __rl: true,
            value: 'button-rouge',
            mode: 'list',
            cachedResultName: 'Button Rouge',
        },
    };

    @node({
        name: 'Question and Answer Chain',
        type: '@n8n/n8n-nodes-langchain.chainRetrievalQa',
        version: 1.6,
        position: [700, -340],
    })
    QuestionAndAnswerChain = {
        options: {},
    };

    @node({
        name: 'Google Vertex Chat Model2',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleVertex',
        version: 1,
        position: [680, -100],
        credentials: { googleApi: { id: '14ycWOZAKSAgOSLT', name: 'Google Service Account account' } },
    })
    GoogleVertexChatModel2 = {
        projectId: {
            __rl: true,
            value: 'button-rouge',
            mode: 'list',
            cachedResultName: 'Button Rouge',
        },
        modelName: 'text-embedding-005',
        options: {
            maxOutputTokens: 2048,
        },
    };

    @node({
        name: 'When chat message received',
        type: '@n8n/n8n-nodes-langchain.chatTrigger',
        version: 1.1,
        position: [300, 0],
    })
    WhenChatMessageReceived = {
        public: true,
        options: {},
    };

    @node({
        name: 'Get a list of objects',
        type: 'n8n-nodes-base.googleCloudStorage',
        version: 1,
        position: [-800, -520],
        credentials: { googleCloudStorageOAuth2Api: { id: 'cz0ZgyUULQjrG1DA', name: 'Google Cloud Storage account' } },
    })
    GetAListOfObjects = {
        resource: 'object',
        bucketName: 'buttobucket',
        projection: 'full',
        returnAll: true,
        listFilters: {},
        requestOptions: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenClickingExecuteWorkflow.out(0).to(this.GetRowSInSheet.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.GetManyDocuments.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.Config.in(0));
        this.GetRowSInSheet.out(0).to(this.Limit.in(0));
        this.Limit.out(0).to(this.RenameKeys.in(0));
        this.RenameKeys.out(0).to(this.Fields.in(0));
        this.Fields.out(0).to(this.CreateOrUpdateADocument.in(0));
        this.EditFields1.out(0).to(this.Query.in(0));
        this.Config.out(0).to(this.EditFields1.in(0));
        this.SimpleVectorStore.out(0).to(this.VectorStoreRetriever.in(0));
        this.EmbeddingsGoogleVertex.out(0).to(this.SimpleVectorStore.in(0));
        this.VectorStoreRetriever.out(0).to(this.QuestionAndAnswerChain.in(0));
        this.WhenChatMessageReceived.out(0).to(this.QuestionAndAnswerChain.in(0));

        this.AiAgent.uses({
            ai_languageModel: this.GoogleVertexChatModel.output,
        });
        this.VectorStoreRetriever.uses({
            ai_vectorStore: this.SimpleVectorStore.output,
        });
        this.SimpleVectorStore.uses({
            ai_embedding: this.EmbeddingsGoogleVertex.output,
        });
        this.QuestionAndAnswerChain.uses({
            ai_languageModel: this.GoogleVertexChatModel2.output,
            ai_retriever: this.VectorStoreRetriever.output,
        });
    }
}
