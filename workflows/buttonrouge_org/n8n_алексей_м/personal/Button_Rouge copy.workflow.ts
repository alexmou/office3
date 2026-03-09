import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Button_Rouge copy
// Nodes   : 42  |  Connections: 27
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Telegram1                          telegram                   [creds]
// Webhook1                           webhook
// Openai1                            openAi                     [AI] [creds]
// GoogleSheets2                      googleSheets               [creds]
// ConvertToFile1                     convertToFile
// Openai3                            openAi                     [onError→regular] [creds]
// Openai4                            openAi                     [creds]
// Sales                              set
// Openai6                            openAi                     [creds]
// Sklad                              set
// Basket                             set
// GoogleSheets4                      googleSheets               [creds]
// GoogleSheets5                      googleSheets               [creds]
// ConvertToFile2                     convertToFile
// ConvertToFile4                     convertToFile
// ScheduleTrigger                    scheduleTrigger
// Merge                              merge
// Openai                             openAi                     [creds]
// Openai7                            openAi                     [creds]
// Code                               code
// Openai9                            openAi                     [creds]
// SetwebhookProd1                    httpRequest
// SetwebhookTest                     httpRequest
// WhenClickingTestWorkflow           manualTrigger
// GetFilesFromVectorStore            httpRequest                [creds]
// DeleteFilesFromVectorStore1        httpRequest                [onError→regular] [creds]
// Openai2                            openAi                     [creds]
// UpdateVectorStore                  httpRequest                [creds]
// SplitOut                           splitOut
// WindowBufferMemory                 memoryBufferWindow
// Code1                              code
// GoogleSheets                       googleSheetsTool           [creds]
// ButtonSettings                     executeWorkflow
// ButtonSettings1                    executeWorkflow
// ButtonSettings2                    executeWorkflow
// StickyNote                         stickyNote
// ExecutionData                      executionData
// Openai5                            openAi                     [onError→regular] [creds]
// Wait1                              wait
// ButtonSettings3                    executeWorkflow
// HttpRequest                        httpRequest                [creds]
// Code3                              code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook1
//    → Openai1
//      → Telegram1
//      → ExecutionData
// Sklad
//    → GoogleSheets4
//      → ConvertToFile2
//        → Openai
//          → Merge.in(1)
//            → ButtonSettings
//              → Wait1
//                → UpdateVectorStore
// Basket
//    → GoogleSheets5
//      → ConvertToFile4
//        → Openai7
//          → Merge.in(2) (↩ loop)
// WhenClickingTestWorkflow
//    → Sales
//      → Code1
//        → GoogleSheets2
//          → Code3
//            → ConvertToFile1
//              → Openai2
//                → Merge (↩ loop)
// ButtonSettings2
//    → GetFilesFromVectorStore
//      → SplitOut
//        → DeleteFilesFromVectorStore1
//    → Openai5
//      → Openai3
// ButtonSettings3
//    → HttpRequest
//
// AI CONNECTIONS
// GoogleSheets.uses({ ai_tool: [GoogleSheets] })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'ctS2yQ9DRLM5d3Gl',
    name: 'Button_Rouge copy',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class ButtonRougeCopyWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        name: 'Telegram1',
        type: 'n8n-nodes-base.telegram',
        version: 1.2,
        position: [-3460, -260],
        credentials: { telegramApi: { id: '7o5Sf3Q2SMrtLS4K', name: 'button_assistant' } },
    })
    Telegram1 = {
        chatId: "={{ $('Webhook1').item.json.body.message.chat.id }}",
        text: '={{ $json.output }}',
        additionalFields: {
            appendAttribution: false,
            parse_mode: 'HTML',
        },
    };

    @node({
        name: 'Webhook1',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-4060, -260],
    })
    Webhook1 = {
        httpMethod: 'POST',
        path: 'f4fbd28e-3b06-478a-bcc2-5addef9d330a',
        options: {},
    };

    @node({
        name: 'OpenAI1',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-3840, -260],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    Openai1 = {
        resource: 'assistant',
        assistantId: {
            __rl: true,
            value: 'asst_QyhTejkE6fUOg4SlX816tAmb',
            mode: 'id',
        },
        prompt: 'define',
        text: "=<|im_start|>\nЯзык на котором нужно ответить: {{ $json.body.message.from.language_code }}\nИмя пользователя: {{ $json.body.message.chat.first_name }}\nМестоположение пользователя и его часовой пояс: город Нячанг (Вьетнам) GMT+7 \nСегодняшняя дата и время: {{$now.setZone('Asia/Bangkok')}}\n<|im_end|>\n{{ $json.body.message.text }}",
        memory: 'threadId',
        threadId: 'thread_xSZK62T7nTZ8acHeZu5RJ97G',
        options: {},
    };

    @node({
        name: 'Google Sheets2',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-3420, 220],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GoogleSheets2 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: "={{ $('sales').item.json.documentId }}",
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: "={{ $('sales').item.json.sheetId }}",
            mode: 'id',
        },
        options: {},
    };

    @node({
        name: 'Convert to File1',
        type: 'n8n-nodes-base.convertToFile',
        version: 1.1,
        position: [-1980, -80],
    })
    ConvertToFile1 = {
        operation: 'toJson',
        options: {
            fileName: "={{ $('sales').first().json.fileName}}",
        },
    };

    @node({
        name: 'OpenAI3',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-3820, -900],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
    })
    Openai3 = {
        resource: 'file',
        operation: 'deleteFile',
        fileId: {
            __rl: true,
            value: '={{ $json.id }}',
            mode: 'id',
        },
    };

    @node({
        name: 'OpenAI4',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-2440, -780],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    Openai4 = {
        resource: 'file',
        operation: 'deleteFile',
        fileId: {
            __rl: true,
            value: '={{ $json.id }}',
            mode: 'id',
        },
    };

    @node({
        name: 'sales',
        type: 'n8n-nodes-base.set',
        version: 2,
        position: [-3940, 220],
    })
    Sales = {
        values: {
            string: [
                {
                    name: 'documentId',
                    value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
                },
                {
                    name: 'sheetId',
                    value: '1597077839',
                },
                {
                    name: 'fileName',
                    value: 'sales.txt',
                },
                {
                    name: 'filterDate',
                    value: '2025-01-01',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'OpenAI6',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-2440, -560],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    Openai6 = {
        resource: 'assistant',
        operation: 'update',
        assistantId: {
            __rl: true,
            value: 'asst_QyhTejkE6fUOg4SlX816tAmb',
            mode: 'list',
            cachedResultName: 'Button_chat',
        },
        options: {
            file_ids: '={{ $json.output }}',
        },
    };

    @node({
        name: 'sklad',
        type: 'n8n-nodes-base.set',
        version: 2,
        position: [-3200, 760],
    })
    Sklad = {
        values: {
            string: [
                {
                    name: 'documentId',
                    value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
                },
                {
                    name: 'sheetId',
                    value: '1769905694',
                },
                {
                    name: 'fileName',
                    value: 'sklad.json',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'basket',
        type: 'n8n-nodes-base.set',
        version: 2,
        position: [-3200, 960],
    })
    Basket = {
        values: {
            string: [
                {
                    name: 'documentId',
                    value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k',
                },
                {
                    name: 'sheetId',
                    value: '1017432404',
                },
                {
                    name: 'fileName',
                    value: 'basket.json',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Google Sheets4',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2980, 760],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GoogleSheets4 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '={{ $json.documentId }}',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: '={{ $json.sheetId }}',
            mode: 'id',
        },
        options: {},
    };

    @node({
        name: 'Google Sheets5',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-2980, 960],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GoogleSheets5 = {
        authentication: 'serviceAccount',
        documentId: {
            __rl: true,
            value: '={{ $json.documentId }}',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: '={{ $json.sheetId }}',
            mode: 'id',
        },
        options: {},
    };

    @node({
        name: 'Convert to File2',
        type: 'n8n-nodes-base.convertToFile',
        version: 1.1,
        position: [-2760, 760],
    })
    ConvertToFile2 = {
        operation: 'toJson',
        options: {
            fileName: "={{ $('sklad').item.json.fileName }}",
        },
    };

    @node({
        name: 'Convert to File4',
        type: 'n8n-nodes-base.convertToFile',
        version: 1.1,
        position: [-2760, 960],
    })
    ConvertToFile4 = {
        operation: 'toJson',
        options: {
            fileName: "={{ $('basket').item.json.fileName }}",
        },
    };

    @node({
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [-3120, -420],
    })
    ScheduleTrigger = {
        rule: {
            interval: [
                {
                    triggerAtHour: 21,
                },
            ],
        },
    };

    @node({
        name: 'Merge',
        type: 'n8n-nodes-base.merge',
        version: 3,
        position: [-2320, 860],
    })
    Merge = {
        numberInputs: 3,
    };

    @node({
        name: 'OpenAI',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-2540, 760],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    Openai = {
        resource: 'file',
        options: {},
    };

    @node({
        name: 'OpenAI7',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-2540, 960],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    Openai7 = {
        resource: 'file',
        options: {},
    };

    @node({
        name: 'Code',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2660, -520],
    })
    Code = {
        jsCode: "// Lvoop over input items and add a new field called 'myNewField' to the JSON of each one\nvar output=[]\n//  console.log($input.all())\nvar i=0\nfor (const item of $input.all()) {\n  output[i]=$input.all()[i].json.id.toString()\n  i=i+1\n //output.push(item.json.id.toString());\n}\n\nreturn {output}",
    };

    @node({
        name: 'OpenAI9',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-2200, -580],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    Openai9 = {
        resource: 'assistant',
        operation: 'update',
        assistantId: {
            __rl: true,
            value: 'asst_QyhTejkE6fUOg4SlX816tAmb',
            mode: 'list',
            cachedResultName: 'Button_chat',
        },
        options: {
            codeInterpreter: true,
            instructions:
                '=Reply in Rusian.\nТы - аналитик и маркектолог в области продаж с огромрным опытом работы в сфере производства и реализации одежды. Вопрос нужно обработать,, используя глубокую аналитику в сфере прордаж и маркетинга. \nФактуру для ответа нужно брать  ТОЛЬКО из google sheet. Данныые нельзя искажать или придумывать. Даннае вне фактуры должны быть предоставлены только на основании аналитической проработки с необходимвм обоснованием.\nВся информация по продажам, товаре на складе и так далее хранится в прикрепленных файлах с идентификаторами (File ID):\n{{ $json.output }}.\nеред  тем как начать анализировать ответ, загрузи данные из этих файлов и обнови рабочую память.\nВот структура файлов:\nфайл sales.json - все продажи с суммами и наименованием товара, количества продаж\nфайл basket.json  - фиксация факта продажи (объединение товаров в корзины) по времени\nфайл sklad.json  - весь перечень товара, включая товар на складе и  уже распроданный товар.\n\nЛист   sales содержит поля:\ndate - дата продажи\ntime - время продажи\nmonth - месяц продажи\t\nyear - год продажи\nweekday - день недели продажи\narticle - уникальный артикуль товара\nBrand - название бренда (наш собственный бренд называется BOUTTON ROUGE, все остальные бренды - это поставщики, у которых мы взяли товар на реализацию)\nName - название товара\ntype - тип товара\nsubtype - подтип товара\ncolor - цвет изделия\nsize - размер изделия\nпроизводитель - кто отшил изделие\nprice - цена на ценнике\ndiscount_Fix - фиксированная скидка, которую дал продавец при продаже\ndiscount_% - скидка в процентах, которую дал продавец при продаже\nComments - комментарий, который оставил\tпродавец при продаже \nfinalPrice - финальная сумма продажи с учетом скидки в валюте оплаты\nfinalPriceVND - финальная сумма продажи с учетом скидки во вьетнамских донгах\ncurs - курс по которому была конвертация во вьетнамские донги, если оплата была в другой валюте\ncurrency - наименование валюты\nusername - имя продавца\npaymentmethod - способ оплаты (cash, terminal, transfer)\nsalary - зарплата продавцу\nbasketid - идентификатор корзины из файла bascket.html)\nTerminal - процент, вычитаемый при оплате через терминал\namount to supplier - сумма, которую нужно заплатить поставщику в случае если продан бренд не BUTTON ROUGE\nПрибыль - итоговая прибыль с учетом всех условий продаж\ndone - факт оплаты поставщику\ndescription - более развернутое наименование товара',
        },
    };

    @node({
        name: 'SetWebhook-prod1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-2920, -780],
    })
    SetwebhookProd1 = {
        method: 'POST',
        url: '=https://api.telegram.org/bot7761618800:AAE3tzJqgXIsNxyHjnX58_S1sIfpqffFqT4/setWebhook?url=https://buttonrouge.org/n8n/webhook/hook',
        options: {},
    };

    @node({
        name: 'SetWebhook-test',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-2220, -780],
    })
    SetwebhookTest = {
        method: 'POST',
        url: 'https://api.telegram.org/bot7761618800:AAE3tzJqgXIsNxyHjnX58_S1sIfpqffFqT4/setWebhook?url=https://buttonrouge.org/n8n/webhook-test/hook',
        options: {},
    };

    @node({
        name: 'When clicking ‘Test workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [-4560, -400],
    })
    WhenClickingTestWorkflow = {};

    @node({
        name: 'get files from vector store',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-4060, -1120],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    GetFilesFromVectorStore = {
        url: '=https://api.openai.com/v1/vector_stores/{{ $json.vector_store_id }}/files',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        options: {},
    };

    @node({
        name: 'delete files from vector store1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-3640, -1120],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
    })
    DeleteFilesFromVectorStore1 = {
        method: 'DELETE',
        url: '=https://api.openai.com/v1/vector_stores/{{ $json.data.vector_store_id }}/files/{{ $json.data.id }}',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'openAiApi',
        options: {},
    };

    @node({
        name: 'OpenAI2',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-1860, 220],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    Openai2 = {
        resource: 'file',
        options: {},
    };

    @node({
        name: 'update vector store',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-1820, 760],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    UpdateVectorStore = {
        method: 'POST',
        url: '=https://api.openai.com/v1/vector_stores/{{ $json.vector_store_id }}/files\n',
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
        sendBody: true,
        bodyParameters: {
            parameters: [
                {
                    name: 'file_id',
                    value: '={{ $json.id }}',
                },
            ],
        },
        options: {},
    };

    @node({
        name: 'Split Out',
        type: 'n8n-nodes-base.splitOut',
        version: 1,
        position: [-3860, -1120],
    })
    SplitOut = {
        fieldToSplitOut: 'data',
        include: '=',
        options: {},
    };

    @node({
        name: 'Window Buffer Memory',
        type: '@n8n/n8n-nodes-langchain.memoryBufferWindow',
        version: 1.3,
        position: [-2660, -760],
    })
    WindowBufferMemory = {};

    @node({
        name: 'Code1',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-3700, 220],
    })
    Code1 = {
        jsCode: "  const startDate = new Date($input.first().json.filterDate); // Your start date\n  const dateObjects = getDateObjects(startDate);\nreturn dateObjects\n\n\nfunction getDateObjects(startDate) {\n  const dateObjects = [];\n  const currentDate = new Date();\n  \n  // Validate input\n  if (!(startDate instanceof Date) || isNaN(startDate)) {\n    throw new Error('Invalid start date');\n  }\n  \n  // Clone the date to avoid modifying the original\n  let date = new Date(startDate);\n  \n  // Format as dd.mm.yyyy\n  const formatDate = (d) => {\n    const day = String(d.getDate()).padStart(2, '0');\n    const month = String(d.getMonth() + 1).padStart(2, '0');\n    const year = d.getFullYear();\n    return `${day}.${month}.${year}`;\n    //return `${year}-${month}-${day}`;\n  };\n  \n  // Create objects for each date\n  while (date <= currentDate) {\n    dateObjects.push({\n      date: formatDate(date),\n      // You can add other properties here if needed\n      // example: dayOfWeek: date.getDay(),\n      //          isWeekend: [0,6].includes(date.getDay())\n    });\n    date.setDate(date.getDate() + 1);\n  }\n  \n  return dateObjects;\n}\n\n// Example usage:\n\n\n\n\n\n\n",
    };

    @node({
        name: 'Google Sheets',
        type: 'n8n-nodes-base.googleSheetsTool',
        version: 4.5,
        position: [-3760, -40],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    GoogleSheets = {
        descriptionType: 'manual',
        toolDescription:
            'Если пользователь попросил добавить расход бюджета, нужно добавить новую строку, указав сумму расхода, коорую сообщил пользовательу ',
        authentication: 'serviceAccount',
        operation: 'append',
        documentId: {
            __rl: true,
            value: '1C4D4tPQ7fJDcjxQTZxt7AmwTv5MhdON5v8giZUWHLPs',
            mode: 'id',
        },
        sheetName: {
            __rl: true,
            value: 483531340,
            mode: 'list',
            cachedResultName: 'accounting',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1C4D4tPQ7fJDcjxQTZxt7AmwTv5MhdON5v8giZUWHLPs/edit#gid=483531340',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {},
            matchingColumns: ['id'],
            schema: [
                {
                    id: 'Дата',
                    displayName: 'Дата',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Время',
                    displayName: 'Время',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Вид',
                    displayName: 'Вид',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Тип',
                    displayName: 'Тип',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Сумма',
                    displayName: 'Сумма',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Бюджет',
                    displayName: 'Бюджет',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Статья расходов',
                    displayName: 'Статья расходов',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Год',
                    displayName: 'Год',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Месяц',
                    displayName: 'Месяц',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'Комментарий',
                    displayName: 'Комментарий',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'username',
                    displayName: 'username',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'PaymentCashRegister',
                    displayName: 'PaymentCashRegister',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
                {
                    id: 'id',
                    displayName: 'id',
                    required: false,
                    defaultMatch: true,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'countInBudget',
                    displayName: 'countInBudget',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {
            useAppend: true,
        },
    };

    @node({
        name: 'Button_Settings',
        type: 'n8n-nodes-base.executeWorkflow',
        version: 1.2,
        position: [-2140, 860],
    })
    ButtonSettings = {
        workflowId: {
            __rl: true,
            value: 'WhIBbNPzGBQ8PvMw',
            mode: 'list',
            cachedResultName: 'Button_Settings',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {},
            matchingColumns: [],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: true,
        },
        options: {},
    };

    @node({
        name: 'Button_Settings1',
        type: 'n8n-nodes-base.executeWorkflow',
        version: 1.2,
        position: [-3560, 800],
    })
    ButtonSettings1 = {
        workflowId: {
            __rl: true,
            value: 'WhIBbNPzGBQ8PvMw',
            mode: 'list',
            cachedResultName: 'Button_Settings',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {},
            matchingColumns: [],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: true,
        },
        options: {},
    };

    @node({
        name: 'Button_Settings2',
        type: 'n8n-nodes-base.executeWorkflow',
        version: 1.2,
        position: [-4280, -1000],
    })
    ButtonSettings2 = {
        workflowId: {
            __rl: true,
            value: 'WhIBbNPzGBQ8PvMw',
            mode: 'list',
            cachedResultName: 'Button_Settings',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {},
            matchingColumns: [],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: true,
        },
        options: {},
    };

    @node({
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-4580, -1180],
    })
    StickyNote = {
        content: 'Очистка  vector store\n',
        height: 460,
        width: 1400,
        color: 6,
    };

    @node({
        name: 'Execution Data',
        type: 'n8n-nodes-base.executionData',
        version: 1,
        position: [-3120, -80],
    })
    ExecutionData = {
        dataToSave: {
            values: [
                {
                    key: '=out',
                    value: '={{ $json.output }}',
                },
            ],
        },
    };

    @node({
        name: 'OpenAI5',
        type: '@n8n/n8n-nodes-langchain.openAi',
        version: 1.8,
        position: [-4060, -900],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
        onError: 'continueRegularOutput',
    })
    Openai5 = {
        resource: 'file',
        operation: 'list',
        options: {},
    };

    @node({
        name: 'Wait1',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [-1780, 580],
    })
    Wait1 = {
        amount: 2,
    };

    @node({
        name: 'Button_Settings3',
        type: 'n8n-nodes-base.executeWorkflow',
        version: 1.2,
        position: [-4180, -520],
    })
    ButtonSettings3 = {
        workflowId: {
            __rl: true,
            value: 'WhIBbNPzGBQ8PvMw',
            mode: 'list',
            cachedResultName: 'Button_Settings',
        },
        workflowInputs: {
            mappingMode: 'defineBelow',
            value: {},
            matchingColumns: [],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: true,
        },
        options: {},
    };

    @node({
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-3780, -580],
        credentials: { openAiApi: { id: 'xjvmObX8ODb6V7ye', name: 'OpenAi account' } },
    })
    HttpRequest = {
        url: '=https://api.openai.com/v1/assistants/{{ $json.assistant_id }}',
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
        name: 'Code3',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-2540, 160],
    })
    Code3 = {
        jsCode: "const lines = $('Google Sheets2').all().map((item, index) => {\n  const j = item.json;\n\n  const entryLines = [`Запись ${index + 1}:`];\n\n  for (const [key, value] of Object.entries(j)) {\n    entryLines.push(`- ${key}: ${value ?? \"не указано\"}`);\n  }\n\n  return entryLines.join('\\n');\n});\n\nreturn [{\n  json: {\n    text: lines.join('\\n\\n') // Разделение между записями\n  }\n}];\n",
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook1.out(0).to(this.Openai1.in(0));
        this.Openai1.out(0).to(this.Telegram1.in(0));
        this.Openai1.out(0).to(this.ExecutionData.in(0));
        this.ConvertToFile1.out(0).to(this.Openai2.in(0));
        this.GoogleSheets2.out(0).to(this.Code3.in(0));
        this.Sales.out(0).to(this.Code1.in(0));
        this.Sklad.out(0).to(this.GoogleSheets4.in(0));
        this.Basket.out(0).to(this.GoogleSheets5.in(0));
        this.GoogleSheets4.out(0).to(this.ConvertToFile2.in(0));
        this.GoogleSheets5.out(0).to(this.ConvertToFile4.in(0));
        this.ConvertToFile2.out(0).to(this.Openai.in(0));
        this.ConvertToFile4.out(0).to(this.Openai7.in(0));
        this.Openai.out(0).to(this.Merge.in(1));
        this.Openai7.out(0).to(this.Merge.in(2));
        this.Merge.out(0).to(this.ButtonSettings.in(0));
        this.WhenClickingTestWorkflow.out(0).to(this.Sales.in(0));
        this.GetFilesFromVectorStore.out(0).to(this.SplitOut.in(0));
        this.Openai2.out(0).to(this.Merge.in(0));
        this.SplitOut.out(0).to(this.DeleteFilesFromVectorStore1.in(0));
        this.Code1.out(0).to(this.GoogleSheets2.in(0));
        this.ButtonSettings.out(0).to(this.Wait1.in(0));
        this.ButtonSettings2.out(0).to(this.GetFilesFromVectorStore.in(0));
        this.ButtonSettings2.out(0).to(this.Openai5.in(0));
        this.Openai5.out(0).to(this.Openai3.in(0));
        this.Wait1.out(0).to(this.UpdateVectorStore.in(0));
        this.ButtonSettings3.out(0).to(this.HttpRequest.in(0));
        this.Code3.out(0).to(this.ConvertToFile1.in(0));

        this.Openai1.uses({
            ai_tool: [this.GoogleSheets.output],
        });
    }
}
