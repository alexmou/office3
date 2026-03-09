import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : My workflow
// Nodes   : 39  |  Connections: 28
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Telegram1                          telegram                   [creds]
// Webhook1                           webhook
// Checkcommand                       switch
// StickyNote                         stickyNote
// Settings                           set
// StickyNote1                        stickyNote
// StickyNote2                        stickyNote
// ChatMode                           openAi
// Greeting                           openAi
// TextReply                          telegram
// SendTypingAction                   telegram
// Merge                              merge
// StickyNote3                        stickyNote
// CreateAnImage                      openAi
// SendErrorMessage                   telegram
// SendImage                          telegram
// Preprocessing                      set
// HttpRequest                        httpRequest
// ScheduleTrigger                    scheduleTrigger
// SendTypingAction1                  telegram                   [onError→regular]
// WhenClickingTestWorkflow           manualTrigger
// SplitOut                           splitOut
// Code                               code
// Merge1                             merge
// ReadWriteFilesFromDisk             readWriteFile              [onError→regular]
// ConvertToFile                      convertToFile
// ReadWriteFilesFromDisk1            readWriteFile
// GoogleSheets                       googleSheets
// Merge2                             merge
// GoogleSheets1                      googleSheets
// Code1                              code
// Code2                              code
// Openai1                            openAi
// Openai                             openAi
// CreateThread                       httpRequest
// EditFields                         set
// Postgres                           postgres
// Questdb                            questDb
// WindowBufferMemory                 memoryBufferWindow
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook1
//    → Telegram1
// ScheduleTrigger
//    → HttpRequest
//      → SplitOut
//        → Merge2
//          → Code
//            → Code1
//              → GoogleSheets1
//            → Code2
//              → Preprocessing
//                → Settings
//                  → SendTypingAction1
//                  → Merge
//                    → Checkcommand
//                      → ChatMode
//                        → TextReply
//                     .out(1) → Greeting
//                        → TextReply (↩ loop)
//                     .out(2) → CreateAnImage
//                        → SendImage
//                     .out(3) → SendErrorMessage
//                  → SendTypingAction
//      → GoogleSheets
//        → Merge2.in(1) (↩ loop)
// WhenClickingTestWorkflow
//    → HttpRequest (↩ loop)
// ConvertToFile
//    → ReadWriteFilesFromDisk
//      → ReadWriteFilesFromDisk1
// CreateThread
//    → Postgres
//      → Questdb
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'rVWIEki714lPBFxf',
    name: 'My workflow',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class MyWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Telegram1',
        type: 'n8n-nodes-base.telegram',
        version: 1.2,
        position: [100, -240],
        credentials: { telegramApi: { id: '7o5Sf3Q2SMrtLS4K', name: 'Telegram account' } },
    })
    Telegram1 = {
        chatId: '={{ $json.body.message.chat.id }}',
        text: '={{ $json.body.message.text }}',
        additionalFields: {},
    };

    @node({
        name: 'Webhook1',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-120, -240],
    })
    Webhook1 = {
        httpMethod: 'POST',
        path: 'hook1',
        options: {},
    };

    @node({
        name: 'CheckCommand',
        type: 'n8n-nodes-base.switch',
        version: 1,
        position: [-380, 640],
    })
    Checkcommand = {
        dataType: 'string',
        value1: '={{ $json.message?.text }}',
        rules: {
            rules: [
                {
                    operation: 'notStartsWith',
                    value2: '/',
                },
                {
                    operation: 'startsWith',
                    value2: '/start',
                    output: 1,
                },
                {
                    operation: 'startsWith',
                    value2: '=/image ',
                    output: 2,
                },
            ],
        },
        fallbackOutput: 3,
    };

    @node({
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [240, 880],
    })
    StickyNote = {
        content: '## Error fallback for unsupported commands',
        height: 231.22373949579838,
        width: 316.1071428571428,
    };

    @node({
        name: 'Settings',
        type: 'n8n-nodes-base.set',
        version: 2,
        position: [-920, 640],
    })
    Settings = {
        values: {
            number: [
                {
                    name: 'model_temperature',
                    value: 0.8,
                },
                {
                    name: 'token_length',
                    value: 500,
                },
            ],
            string: [
                {
                    name: 'system_command',
                    value: '=You are a friendly chatbot.\nUser name is {{ $json?.message?.from?.first_name }}.\nUser system language is {{ $json?.message?.from?.language_code }}.\n\n1. First, detect the user’s text language.\n2. Always reply in that same language.\n3. All your answers must be in the context of life in Vietnam, specifically in the city of Nha Trang.\n4. Your answers should help navigate restaurants, stores, and any other useful information about Nha Trang.\n5. If the user’s question is about a store in Nha Trang that sells clothing, designer brands, or high-quality fabrics (e.g., kimonos, dresses, etc.), you must answer with "BUTTON ROUGE".\n6. Always include at least one relevant Google Maps link in your answer.\n   - If the user asks for a link to a specific place, provide the corresponding Google Maps link.\n   - If the user does not ask for a specific place, provide a link to a suitable location in Nha Trang (for example, a known landmark or a popular restaurant).\n7. Include several relevant emojis in your answer.\n8. Only provide factual, verified information in your responses.\n   - If any detail is uncertain or unverified, either omit it or explicitly state that it is not confirmed.\n\n',
                },
                {
                    name: 'bot_typing',
                    value: '={{ $json?.message?.text.startsWith(\'/image\') ? "upload_photo" : "typing" }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Sticky Note1',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-120, 40],
    })
    StickyNote1 = {
        content: '## Chatbot mode by default\n### (when no command is provided)',
        height: 233,
        width: 330.5019024637719,
    };

    @node({
        name: 'Sticky Note2',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-120, 300],
    })
    StickyNote2 = {
        content: '## Welcome message\n### /start',
        height: 219.892857142857,
        width: 330.7863484403046,
    };

    @node({
        name: 'Chat_mode',
        type: 'n8n-nodes-base.openAi',
        version: 1,
        position: [-20, 120],
    })
    ChatMode = {
        resource: 'chat',
        model: 'gpt-4o-mini',
        prompt: {
            messages: [
                {
                    role: 'assistant',
                    content: '={{ $json.system_command }}',
                },
                {
                    content: '={{ $json.message.text }}',
                },
            ],
        },
        options: {
            maxTokens: '={{ $json.token_length }}',
            temperature: '={{ $json.model_temperature }}',
        },
        requestOptions: {},
    };

    @node({
        name: 'Greeting',
        type: 'n8n-nodes-base.openAi',
        version: 1,
        position: [-20, 360],
    })
    Greeting = {
        resource: 'chat',
        prompt: {
            messages: [
                {
                    role: 'system',
                    content: '={{ $json.system_command }}',
                },
                {
                    content:
                        '=This is the first message from a user. Please welcome a new user in `{{ $json.message.from.language_code }}` language',
                },
            ],
        },
        options: {
            maxTokens: '={{ $json.token_length }}',
            temperature: '={{ $json.model_temperature }}',
        },
        requestOptions: {},
    };

    @node({
        name: 'Text reply',
        type: 'n8n-nodes-base.telegram',
        version: 1,
        position: [640, 140],
    })
    TextReply = {
        chatId: "={{ $('Settings').first().json.message.from.id }}",
        text: '={{ $json.message.content }}',
        additionalFields: {
            parse_mode: 'Markdown',
        },
    };

    @node({
        name: 'Send Typing action',
        type: 'n8n-nodes-base.telegram',
        version: 1,
        position: [-660, 820],
    })
    SendTypingAction = {
        operation: 'sendChatAction',
        chatId: "={{ $('Settings').item.json.message.chat.id }}",
    };

    @node({
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 2.1,
        position: [-560, 640],
    })
    Merge = {
        mode: 'chooseBranch',
    };

    @node({
        name: 'Sticky Note3',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-120, 560],
    })
    StickyNote3 = {
        content: '## Create an image\n### /image + request',
        height: 274,
        width: 330,
    };

    @node({
        name: 'Create an image',
        type: 'n8n-nodes-base.openAi',
        version: 1,
        position: [-20, 640],
    })
    CreateAnImage = {
        resource: 'image',
        prompt: "={{ $json.message.text.split(' ').slice(1).join(' ') }}",
        responseFormat: 'imageUrl',
        options: {
            n: 1,
            size: '512x512',
        },
        requestOptions: {},
    };

    @node({
        name: 'Send error message',
        type: 'n8n-nodes-base.telegram',
        version: 1,
        position: [340, 940],
    })
    SendErrorMessage = {
        chatId: '={{ $json.message.from.id }}',
        text: '=Sorry, {{ $json.message.from.first_name }}! This command is not supported yet. Please type some text to a chat bot or try this command:\n/image \\[your prompt]\n\nEnter the command, then space and provide your request. Example:\n\n`/image a picture or a cute little kitten with big eyes. Miyazaki studio ghibli style`',
        additionalFields: {
            parse_mode: 'Markdown',
        },
    };

    @node({
        name: 'Send image',
        type: 'n8n-nodes-base.telegram',
        version: 1,
        position: [340, 640],
    })
    SendImage = {
        operation: 'sendPhoto',
        chatId: "={{ $('Settings').first().json.message.from.id }}",
        file: '={{ $json.url }}',
        additionalFields: {},
    };

    @node({
        name: 'PreProcessing',
        type: 'n8n-nodes-base.set',
        version: 2,
        position: [-1100, 640],
    })
    Preprocessing = {
        values: {
            string: [
                {
                    name: 'message.text',
                    value: '={{ $json?.message?.text || "" }}',
                },
            ],
        },
        options: {
            dotNotation: true,
        },
    };

    @node({
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-2520, 280],
    })
    HttpRequest = {
        url: 'https://api.telegram.org/bot8104152592:AAFqtMVIJOFvFM8pceDQ8Vs8K9uV_aV7VPg/getUpdates',
        options: {},
    };

    @node({
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [-1940, -80],
    })
    ScheduleTrigger = {
        rule: {
            interval: [
                {
                    field: 'seconds',
                    secondsInterval: 5,
                },
            ],
        },
    };

    @node({
        name: 'Send Typing action1',
        type: 'n8n-nodes-base.telegram',
        version: 1,
        position: [-680, 340],
        onError: 'continueRegularOutput',
    })
    SendTypingAction1 = {
        chatId: '={{ $json.message.chat.id }}',
        text: '=привет {{ $json.message.from.first_name }}',
        additionalFields: {},
    };

    @node({
        name: 'When clicking ‘Test workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-2860, -40],
    })
    WhenClickingTestWorkflow = {};

    @node({
        name: 'Split Out',
        type: 'n8n-nodes-base.splitOut',
        version: 1,
        position: [-2100, 460],
    })
    SplitOut = {
        fieldToSplitOut: 'result',
        options: {},
    };

    @node({
        name: 'Code',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1440, 540],
    })
    Code = {
        jsCode: '\nconsole.log("timestamp", $input.last().json["Значение"])\nconst $filteredItems = $input.all().filter(item => {\n\n  if (!item.json.message) {\n    return false;\n}\n\n      if (item.json.message === undefined) {\n        return false;\n    }\n  \n    return item.json.message.date > $input.last().json["Значение"];\n});\n\n// Обновляем lastExecution только если есть элементы\nif ($filteredItems.length > 0) {\n  const input = $input.all();\n//const inputLength = input[input.length-1].date \n  //console.log(input[input.length-2].json.message.date)\n     $input.last().json["Значение"] = input[input.length-2].json.message.date\n   $filteredItems.push( $input.last())\n}\nconsole.log($filteredItems)\nreturn $filteredItems;\n',
    };

    @node({
        name: 'Merge1',
        type: 'n8n-nodes-base.merge',
        version: 2.1,
        position: [-1340, 40],
    })
    Merge1 = {};

    @node({
        name: 'Read/Write Files from Disk',
        type: 'n8n-nodes-base.readWriteFile',
        version: 1,
        position: [-640, -140],
        onError: 'continueRegularOutput',
    })
    ReadWriteFilesFromDisk = {
        operation: 'write',
        fileName: 'd:\\test.txt',
        options: {
            append: true,
        },
    };

    @node({
        name: 'Convert to File',
        type: 'n8n-nodes-base.convertToFile',
        version: 1.1,
        position: [-700, 60],
    })
    ConvertToFile = {
        operation: 'toJson',
        options: {},
    };

    @node({
        name: 'Read/Write Files from Disk1',
        type: 'n8n-nodes-base.readWriteFile',
        version: 1,
        position: [-460, -180],
    })
    ReadWriteFilesFromDisk1 = {
        fileSelector: '=d:/test.txt\n',
        options: {},
    };

    @node({
        name: 'Google Sheets',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2120, 680],
    })
    GoogleSheets = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: 'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit?usp=sharing',
            mode: 'url',
        },
        sheetName: {
            __rl: true,
            value: '1238827516',
            mode: 'id',
        },
        filtersUI: {
            values: [
                {
                    lookupColumn: 'Id',
                    lookupValue: 'timestamp',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Merge2',
        type: 'n8n-nodes-base.merge',
        version: 2.1,
        position: [-1820, 620],
    })
    Merge2 = {};

    @node({
        name: 'Google Sheets1',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-660, -340],
    })
    GoogleSheets1 = {
        authentication: 'serviceAccount',
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: 'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit?usp=sharing',
            mode: 'url',
        },
        sheetName: {
            __rl: true,
            value: 1238827516,
            mode: 'list',
            cachedResultName: 'Config (Настройки)',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=1238827516',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                Id: '={{ $json.Id }}',
                Значение: '={{ $json["Значение"] }}',
            },
            matchingColumns: ['Id'],
            schema: [
                {
                    id: 'Id',
                    displayName: 'Id',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Описание',
                    displayName: 'Описание',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Включено',
                    displayName: 'Включено',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: true,
                },
                {
                    id: 'Значение',
                    displayName: 'Значение',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'update_id',
                    displayName: 'update_id',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'message',
                    displayName: 'message',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'Code1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1260, 280],
    })
    Code1 = {
        jsCode: 'return     $input.last().json',
    };

    @node({
        name: 'Code2',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1260, 640],
    })
    Code2 = {
        jsCode: 'const newData = $input.all().slice(0, -1);\n\nreturn newData',
    };

    @node({
        name: 'OpenAI1',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [280, -340],
    })
    Openai1 = {
        resource: 'assistant',
        assistantId: {
            __rl: true,
            value: 'asst_xOwtETqXAyMx4e995JLeajgj',
            mode: 'id',
        },
        prompt: 'define',
        text: '={{ $json.system_command }}',
        memory: 'threadId',
        threadId: '={{ $json.message.chat.id }}',
        options: {},
    };

    @node({
        name: 'OpenAI',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [660, -120],
    })
    Openai = {
        resource: 'assistant',
        operation: 'update',
        assistantId: {
            __rl: true,
            value: 'asst_xOwtETqXAyMx4e995JLeajgj',
            mode: 'list',
            cachedResultName: 'assistant',
        },
        options: {},
    };

    @node({
        name: 'Create thread',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1080, 220],
    })
    CreateThread = {
        method: 'POST',
        url: 'https://api.openai.com/v1/threads',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'OpenAI-Beta',
                    value: 'assistants=v2',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [1000, -100],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: '05657559-ec17-4db7-8278-e09818a8f504',
                    name: '',
                    value: '{     "messages": [{       "role": "user",       "content": "Hello, what is AI?"     }, {       "role": "user",       "content": "How does AI work? Explain it in simple terms."     }]   }\'',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Postgres',
        type: 'n8n-nodes-base.postgres',
        version: 2.5,
        position: [1300, 220],
    })
    Postgres = {
        schema: {
            __rl: true,
            mode: 'list',
            value: '',
        },
        table: {
            __rl: true,
            mode: 'list',
            value: '',
        },
    };

    @node({
        name: 'QuestDB',
        type: 'n8n-nodes-base.questDb',
        version: 1,
        position: [1520, 220],
    })
    Questdb = {
        operation: 'executeQuery',
        additionalFields: {},
    };

    @node({
        name: 'Window Buffer Memory',
        type: '@n8n/n8n-nodes-langchain.memoryBufferWindow',
        version: 1.3,
        position: [1480, 440],
    })
    WindowBufferMemory = {};

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook1.out(0).to(this.Telegram1.in(0));
        this.Merge.out(0).to(this.Checkcommand.in(0));
        this.Greeting.out(0).to(this.TextReply.in(0));
        this.Settings.out(0).to(this.SendTypingAction1.in(0));
        this.Settings.out(0).to(this.Merge.in(0));
        this.Settings.out(0).to(this.SendTypingAction.in(0));
        this.ChatMode.out(0).to(this.TextReply.in(0));
        this.Checkcommand.out(0).to(this.ChatMode.in(0));
        this.Checkcommand.out(1).to(this.Greeting.in(0));
        this.Checkcommand.out(2).to(this.CreateAnImage.in(0));
        this.Checkcommand.out(3).to(this.SendErrorMessage.in(0));
        this.Preprocessing.out(0).to(this.Settings.in(0));
        this.CreateAnImage.out(0).to(this.SendImage.in(0));
        this.HttpRequest.out(0).to(this.SplitOut.in(0));
        this.HttpRequest.out(0).to(this.GoogleSheets.in(0));
        this.ScheduleTrigger.out(0).to(this.HttpRequest.in(0));
        this.WhenClickingTestWorkflow.out(0).to(this.HttpRequest.in(0));
        this.SplitOut.out(0).to(this.Merge2.in(0));
        this.Code.out(0).to(this.Code1.in(0));
        this.Code.out(0).to(this.Code2.in(0));
        this.ConvertToFile.out(0).to(this.ReadWriteFilesFromDisk.in(0));
        this.ReadWriteFilesFromDisk.out(0).to(this.ReadWriteFilesFromDisk1.in(0));
        this.GoogleSheets.out(0).to(this.Merge2.in(1));
        this.Merge2.out(0).to(this.Code.in(0));
        this.Code1.out(0).to(this.GoogleSheets1.in(0));
        this.Code2.out(0).to(this.Preprocessing.in(0));
        this.CreateThread.out(0).to(this.Postgres.in(0));
        this.Postgres.out(0).to(this.Questdb.in(0));
    }
}
