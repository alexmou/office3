import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : newSale
// Nodes   : 27  |  Connections: 33
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// RespondToWebhook                   respondToWebhook           
// Switch_                            switch                     
// Webhook1                           webhook                    
// SplitOut                           splitOut                   
// Getsalary                          googleSheets               [creds]
// Merge                              merge                      
// EditFields                         set                        
// Getsalary1                         googleSheets               [creds]
// Merge2                             merge                      
// Merge3                             merge                      
// RemoveDuplicates1                  removeDuplicates           
// Profit                             set                        
// Node                               set                        
// Node1                              googleSheets               [onError→regular] [creds]
// If_                                if                         
// Node2                              googleSheets               [creds]
// Sales                              googleSheets               [creds]
// EditFields1                        set                        
// WhenClickingExecuteWorkflow        manualTrigger              
// SplitOut1                          splitOut                   
// SendATextMessage                   telegram                   [creds]
// SendATextMessage1                  telegram                   [creds]
// Aggregate1                         aggregate                  
// Summarize                          summarize                  
// EditFields2                        set                        
// Merge4                             merge                      
// EditFields3                        set                        
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook1
//    → Switch_
//      → SplitOut
//        → Getsalary
//          → Merge.in(1)
//            → EditFields
//              → Merge3
//                → RemoveDuplicates1
//                  → Node
//                    → Profit
//                      → Sales
//                        → Node1
//                        → If_
//                          → Node2
//                            → RespondToWebhook
//                         .out(1) → RespondToWebhook (↩ loop)
//                        → Summarize
//                          → Merge4
//                            → Aggregate1
//                              → EditFields3
//                                → SendATextMessage1
//                        → EditFields2
//                          → Merge4.in(1) (↩ loop)
//                        → SendATextMessage
//        → Merge (↩ loop)
//        → Getsalary1
//          → Merge2.in(1)
//            → Merge3.in(1) (↩ loop)
//        → Merge2 (↩ loop)
// WhenClickingExecuteWorkflow
//    → EditFields1
//      → SplitOut1
//        → Summarize (↩ loop)
//        → EditFields2 (↩ loop)
//        → SendATextMessage (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: "7pC8RxgVHa1G7N7PsT9W4",
    name: "newSale",
    active: true,
    settings: {executionOrder:"v1",availableInMCP:false}
})
export class NewsaleWorkflow {

    // =====================================================================
// CONFIGURATION DES NOEUDS
// =====================================================================

    @node({
        name: "Respond to Webhook",
        type: "n8n-nodes-base.respondToWebhook",
        version: 1.2,
        position: [656, 32]
    })
    RespondToWebhook = {
        "respondWith": "text",
        "responseBody": "true",
        "options": {
            "responseHeaders": {
                "entries": [
                    {
                        "name": "Access-Control-Allow-Origin",
                        "value": "*"
                    }
                ]
            }
        }
    };

    @node({
        name: "Switch",
        type: "n8n-nodes-base.switch",
        version: 3.2,
        position: [-2192, -96]
    })
    Switch_ = {
        "rules": {
            "values": [
                {
                    "conditions": {
                        "options": {
                            "caseSensitive": false,
                            "leftValue": "",
                            "typeValidation": "strict",
                            "version": 2
                        },
                        "conditions": [
                            {
                                "leftValue": "={{ $json.body.action }}",
                                "rightValue": "=sendSalesToSheet",
                                "operator": {
                                    "type": "string",
                                    "operation": "equals"
                                },
                                "id": "50880f5c-2526-4969-9728-daa1323817a4"
                            }
                        ],
                        "combinator": "and"
                    },
                    "renameOutput": true,
                    "outputKey": "newSale"
                }
            ]
        },
        "options": {
            "ignoreCase": true
        }
    };

    @node({
        name: "Webhook1",
        type: "n8n-nodes-base.webhook",
        version: 1,
        position: [-2432, -96]
    })
    Webhook1 = {
        "httpMethod": "POST",
        "path": "newSale",
        "responseMode": "responseNode",
        "options": {}
    };

    @node({
        name: "Split Out",
        type: "n8n-nodes-base.splitOut",
        version: 1,
        position: [-1936, -96]
    })
    SplitOut = {
        "fieldToSplitOut": "body.sales",
        "options": {}
    };

    @node({
        name: "getSalary",
        type: "n8n-nodes-base.googleSheets",
        version: 4.5,
        position: [-1584, 176],
        credentials: {googleApi:{id:"hUOxiGKUqjjYiCun",name:"Google Sheets account"}}
    })
    Getsalary = {
        "authentication": "serviceAccount",
        "documentId": {
            "__rl": true,
            "value": "1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U",
            "mode": "id"
        },
        "sheetName": {
            "__rl": true,
            "value": 1402000884,
            "mode": "list",
            "cachedResultName": "Salary",
            "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=1402000884"
        },
        "filtersUI": {
            "values": [
                {
                    "lookupColumn": "username",
                    "lookupValue": "={{ $json.username }}"
                },
                {
                    "lookupColumn": "Brand",
                    "lookupValue": "={{ $json.Brand }}"
                }
            ]
        },
        "options": {
            "returnFirstMatch": true
        }
    };

    @node({
        name: "Merge",
        type: "n8n-nodes-base.merge",
        version: 3.2,
        position: [-1360, 64]
    })
    Merge = {
        "mode": "combine",
        "fieldsToMatchString": "Brand",
        "options": {}
    };

    @node({
        name: "Edit Fields",
        type: "n8n-nodes-base.set",
        version: 3.4,
        position: [-1088, 64]
    })
    EditFields = {
        "assignments": {
            "assignments": [
                {
                    "id": "e09cca24-03ca-4c7c-9522-721cc5d0d932",
                    "name": "Salary",
                    "value": "={{  $json[$json.paymentmethod]}}",
                    "type": "string"
                }
            ]
        },
        "includeOtherFields": true,
        "options": {}
    };

    @node({
        name: "getSalary1",
        type: "n8n-nodes-base.googleSheets",
        version: 4.5,
        position: [-1584, 368],
        credentials: {googleApi:{id:"hUOxiGKUqjjYiCun",name:"Google Sheets account"}}
    })
    Getsalary1 = {
        "authentication": "serviceAccount",
        "documentId": {
            "__rl": true,
            "value": "1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U",
            "mode": "id"
        },
        "sheetName": {
            "__rl": true,
            "value": 837475007,
            "mode": "list",
            "cachedResultName": "Зарплата поставщикам",
            "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U/edit#gid=837475007"
        },
        "filtersUI": {
            "values": [
                {
                    "lookupColumn": "Brand",
                    "lookupValue": "={{ $json.Brand }}"
                }
            ]
        },
        "options": {
            "returnFirstMatch": true
        }
    };

    @node({
        name: "Merge2",
        type: "n8n-nodes-base.merge",
        version: 3.2,
        position: [-1088, 352]
    })
    Merge2 = {
        "mode": "combine",
        "fieldsToMatchString": "Brand",
        "options": {}
    };

    @node({
        name: "Merge3",
        type: "n8n-nodes-base.merge",
        version: 3.2,
        position: [-848, 224]
    })
    Merge3 = {
        "mode": "combine",
        "fieldsToMatchString": "Brand",
        "joinMode": "keepEverything",
        "options": {}
    };

    @node({
        name: "Remove Duplicates1",
        type: "n8n-nodes-base.removeDuplicates",
        version: 2,
        position: [-672, 224]
    })
    RemoveDuplicates1 = {
        "options": {}
    };

    @node({
        name: "расчет Profit",
        type: "n8n-nodes-base.set",
        version: 3.4,
        position: [-304, 224]
    })
    Profit = {
        "assignments": {
            "assignments": [
                {
                    "id": "ab788bc2-e1e6-43e5-b1e4-bdad2e02d157",
                    "name": "Profit",
                    "value": "={{ $json.finalPriceVND - $json.salary- $json[\"amount to supplier\"] - $json.Terminal}}",
                    "type": "number"
                }
            ]
        },
        "includeOtherFields": true,
        "include": "selected",
        "includeFields": "date,time,month,year,weekday,article,Brand,Name,type,subtype,color,size,manufacturer,price,discount_Fix,discount_%,Comments,finalPrice,finalPriceVND,curs,currency,username,paymentmethod,salary,basketid,Terminal,amount to supplier,done,description,store,sales, sheetName_sklad, sheetName_accounting, quantity",
        "options": {}
    };

    @node({
        name: "Расчет полей",
        type: "n8n-nodes-base.set",
        version: 3.4,
        position: [-480, 224]
    })
    Node = {
        "assignments": {
            "assignments": [
                {
                    "id": "3bdb5620-2541-4765-bf22-02061ce46ab4",
                    "name": "date",
                    "value": "={{ $json.date }}",
                    "type": "string"
                },
                {
                    "id": "72392c3a-3ee3-4073-b117-96d62bef1fc8",
                    "name": "time",
                    "value": "={{ $json.time }}",
                    "type": "string"
                },
                {
                    "id": "6eed4894-c054-493d-a5e7-8a970f8bbc3b",
                    "name": "month",
                    "value": "={{ new Date().getUTCMonth($json.date) + 1 }}",
                    "type": "string"
                },
                {
                    "id": "2a9541e9-1e70-476d-96bc-a541400ed8f6",
                    "name": "year",
                    "value": "={{ new Date($json.date.split('.').reverse().join('-')).getUTCFullYear() }}",
                    "type": "string"
                },
                {
                    "id": "408cd55b-a79c-4f23-8e11-085185e1c18b",
                    "name": "weekday",
                    "value": "={{   (() => {     const [d,m,y] = $json.date.split('.');     return ((new Date(`${y}-${m}-${d}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;   })() }}",
                    "type": "string"
                },
                {
                    "id": "3596e749-6fa6-44cb-8a13-dcc33dff7429",
                    "name": "article",
                    "value": "={{ $json.article }}",
                    "type": "string"
                },
                {
                    "id": "ed796a7b-07b4-4e1b-9dc6-029350cd4b8d",
                    "name": "Brand",
                    "value": "={{ $json.Brand }}",
                    "type": "string"
                },
                {
                    "id": "116cdcbf-b618-4457-ad8f-871fe708e5be",
                    "name": "Name",
                    "value": "={{ $json.Name }}",
                    "type": "string"
                },
                {
                    "id": "6b7ac8ce-c60d-444f-bb33-4faee7822ba1",
                    "name": "type",
                    "value": "={{ $json.type }}",
                    "type": "string"
                },
                {
                    "id": "233c531d-d60a-4526-b5e7-794dfb1d648e",
                    "name": "subtype",
                    "value": "={{ $json.subtype }}",
                    "type": "string"
                },
                {
                    "id": "99798f8e-2fda-45b4-834e-75a914ecbeb7",
                    "name": "color",
                    "value": "={{ $json.color }}",
                    "type": "string"
                },
                {
                    "id": "95fc4c85-2952-4754-85b8-aeb9be9bb91d",
                    "name": "size",
                    "value": "={{ $json.size }}",
                    "type": "string"
                },
                {
                    "id": "7b15d869-6500-40d7-b240-d682bf9c9ee8",
                    "name": "manufacturer",
                    "value": "={{ $json.manufacturer }}",
                    "type": "string"
                },
                {
                    "id": "89994416-68e4-4944-985d-b25e11895882",
                    "name": "price",
                    "value": "={{ $json.price.replace(/[^\\d.-]/g, \"\") }}",
                    "type": "number"
                },
                {
                    "id": "205273fb-412a-47ab-9ebd-814cdf5464e0",
                    "name": "discount_Fix",
                    "value": "={{ $json.discount_Fix }}",
                    "type": "string"
                },
                {
                    "id": "3723d43a-7b4b-470e-9cca-67f818c87376",
                    "name": "discount_%",
                    "value": "={{ $json[\"discount_%\"] }}",
                    "type": "string"
                },
                {
                    "id": "2b46a57a-cbf2-4e3c-999d-dacdce34f29f",
                    "name": "Comments",
                    "value": "={{ $json.Comments }}",
                    "type": "string"
                },
                {
                    "id": "2b969246-0416-4c8b-b471-4a093b416d99",
                    "name": "finalPrice",
                    "value": "={{ $json.finalPrice }}",
                    "type": "number"
                },
                {
                    "id": "1bed3497-c490-4d75-ad0e-cd48f3fc0b38",
                    "name": "finalPriceVND",
                    "value": "={{ $json.finalPriceVND }}",
                    "type": "number"
                },
                {
                    "id": "116c58cb-1c4a-4e2f-83b1-4a8865462191",
                    "name": "curs",
                    "value": "={{ $json.curs }}",
                    "type": "string"
                },
                {
                    "id": "322abe39-ad37-4a5f-b344-6ae89fc80251",
                    "name": "currency",
                    "value": "={{ $json.currency }}",
                    "type": "string"
                },
                {
                    "id": "a45c8cde-2543-43fd-810b-ae7df785d4b4",
                    "name": "username",
                    "value": "={{ $json.username }}",
                    "type": "string"
                },
                {
                    "id": "0c701d63-e0f8-48bb-bb1e-c70d26a3c5ee",
                    "name": "paymentmethod",
                    "value": "={{ $json.paymentmethod }}",
                    "type": "string"
                },
                {
                    "id": "777a9b06-4ef6-4594-8c9e-7738dbd66a55",
                    "name": "salary",
                    "value": "={{ $json.finalPriceVND.toNumber() * $json.Salary.toNumber() /100}}",
                    "type": "number"
                },
                {
                    "id": "16f054b3-c7b0-44d4-85ee-aae25f97e93d",
                    "name": "Terminal",
                    "value": "={{ $json.paymentmethod==\"Terminal\" ? $json.finalPriceVND * 0.042 : 0 }}",
                    "type": "number"
                },
                {
                    "id": "b8e93f14-6ba2-4d89-a40d-6e991420514e",
                    "name": "amount to supplier",
                    "value": "={{ $json.finalPriceVND * $json[\"Процент поставщикам\"] /100}}",
                    "type": "number"
                },
                {
                    "id": "ab788bc2-e1e6-43e5-b1e4-bdad2e02d157",
                    "name": "Profit",
                    "value": 0,
                    "type": "number"
                },
                {
                    "id": "4d10548d-455a-4a0e-a53b-af27571d804e",
                    "name": "done",
                    "value": "",
                    "type": "string"
                },
                {
                    "id": "74fddf26-5efd-45dd-be99-0e173639ecea",
                    "name": "description",
                    "value": "={{ $json.description }}",
                    "type": "string"
                },
                {
                    "id": "76a9ea13-450d-430e-aa50-bebf488625de",
                    "name": "store",
                    "value": "={{ $json.store }}",
                    "type": "string"
                },
                {
                    "id": "51c449d4-5c10-433a-8f5c-9a2b645c59e7",
                    "name": "sales",
                    "value": "",
                    "type": "string"
                },
                {
                    "id": "e4ddc31f-f4cd-452d-8e7f-b6d17a8cfe12",
                    "name": "basketid",
                    "value": "={{ $json.basketid }}",
                    "type": "string"
                }
            ]
        },
        "includeOtherFields": true,
        "options": {}
    };

    @node({
        name: "Уменьшаем кол-во",
        type: "n8n-nodes-base.googleSheets",
        version: 4.5,
        position: [64, 224],
        credentials: {googleApi:{id:"hUOxiGKUqjjYiCun",name:"Google Sheets account"}},
        onError: "continueRegularOutput"
    })
    Node1 = {
        "authentication": "serviceAccount",
        "operation": "update",
        "documentId": {
            "__rl": true,
            "value": "1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k",
            "mode": "id"
        },
        "sheetName": {
            "__rl": true,
            "value": "={{ $json.sheetName_sklad }}",
            "mode": "name"
        },
        "columns": {
            "mappingMode": "defineBelow",
            "value": {
                "article": "={{ $json.article }}",
                "quantity": "={{ $json.quantity -1}}"
            },
            "matchingColumns": [
                "article"
            ],
            "schema": [
                {
                    "id": "num",
                    "displayName": "num",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "article",
                    "displayName": "article",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": false
                },
                {
                    "id": "Brand",
                    "displayName": "Brand",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "type",
                    "displayName": "type",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "subtype",
                    "displayName": "subtype",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "description",
                    "displayName": "description",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "Name",
                    "displayName": "Name",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "fabric",
                    "displayName": "fabric",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "color",
                    "displayName": "color",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "size",
                    "displayName": "size",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "manufacturer",
                    "displayName": "manufacturer",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "netprice",
                    "displayName": "netprice",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "Delivery_date",
                    "displayName": "Delivery_date",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "quantity",
                    "displayName": "quantity",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": false
                },
                {
                    "id": "crope price",
                    "displayName": "crope price",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "price",
                    "displayName": "price",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "madein",
                    "displayName": "madein",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "discount_%",
                    "displayName": "discount_%",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "discount_Fix",
                    "displayName": "discount_Fix",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "Comments",
                    "displayName": "Comments",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "netpriceFull",
                    "displayName": "netpriceFull",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "scladprice",
                    "displayName": "scladprice",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "salePrice",
                    "displayName": "salePrice",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "Зал",
                    "displayName": "Зал",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "Склад",
                    "displayName": "Склад",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "Склад-вешалка",
                    "displayName": "Склад-вешалка",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "Дом",
                    "displayName": "Дом",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "Улица",
                    "displayName": "Улица",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "col_7",
                    "displayName": "col_7",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "row_number",
                    "displayName": "row_number",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "number",
                    "canBeUsedToMatch": true,
                    "readOnly": true,
                    "removed": true
                }
            ],
            "attemptToConvertTypes": false,
            "convertFieldsToString": false
        },
        "options": {}
    };

    @node({
        name: "If",
        type: "n8n-nodes-base.if",
        version: 2.3,
        position: [192, 48]
    })
    If_ = {
        "conditions": {
            "options": {
                "caseSensitive": true,
                "leftValue": "",
                "typeValidation": "strict",
                "version": 3
            },
            "conditions": [
                {
                    "id": "717e8b1c-460d-4256-9e22-fb321e6b7f11",
                    "leftValue": "={{ $json.paymentmethod }}",
                    "rightValue": "Cash",
                    "operator": {
                        "type": "string",
                        "operation": "equals"
                    }
                }
            ],
            "combinator": "and"
        },
        "options": {}
    };

    @node({
        name: "Запись в кассу",
        type: "n8n-nodes-base.googleSheets",
        version: 4.5,
        position: [384, -96],
        credentials: {googleApi:{id:"hUOxiGKUqjjYiCun",name:"Google Sheets account"}}
    })
    Node2 = {
        "authentication": "serviceAccount",
        "operation": "append",
        "documentId": {
            "__rl": true,
            "value": "1C4D4tPQ7fJDcjxQTZxt7AmwTv5MhdON5v8giZUWHLPs",
            "mode": "id"
        },
        "sheetName": {
            "__rl": true,
            "value": "={{ $json.sheetName_accounting }}",
            "mode": "name"
        },
        "columns": {
            "mappingMode": "defineBelow",
            "value": {
                "Дата": "={{ $json.date }}",
                "Время": "={{ $json.time }}",
                "Вид": "Факт",
                "Тип": "Приход",
                "Сумма": "={{ $json.finalPrice }}",
                "Бюджет": "BUTTON ROUGE",
                "Статья расходов": "Продажа",
                "Год": "={{ $json.year }}",
                "Месяц": "={{ $json.month }}",
                "Комментарий": "={{ $json.Comments }}",
                "username": "={{ $json.username }}",
                "PaymentCashRegister": "Касса",
                "countInBudget": "1"
            },
            "matchingColumns": [
                "id"
            ],
            "schema": [
                {
                    "id": "Дата",
                    "displayName": "Дата",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Время",
                    "displayName": "Время",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Вид",
                    "displayName": "Вид",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Тип",
                    "displayName": "Тип",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Сумма",
                    "displayName": "Сумма",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Бюджет",
                    "displayName": "Бюджет",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Статья расходов",
                    "displayName": "Статья расходов",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Год",
                    "displayName": "Год",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Месяц",
                    "displayName": "Месяц",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Комментарий",
                    "displayName": "Комментарий",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "username",
                    "displayName": "username",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "PaymentCashRegister",
                    "displayName": "PaymentCashRegister",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "id",
                    "displayName": "id",
                    "required": false,
                    "defaultMatch": true,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "countInBudget",
                    "displayName": "countInBudget",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                }
            ],
            "attemptToConvertTypes": false,
            "convertFieldsToString": false
        },
        "options": {}
    };

    @node({
        name: "Добавление в Sales",
        type: "n8n-nodes-base.googleSheets",
        version: 4.5,
        position: [-128, 224],
        credentials: {googleApi:{id:"hUOxiGKUqjjYiCun",name:"Google Sheets account"}}
    })
    Sales = {
        "authentication": "serviceAccount",
        "operation": "append",
        "documentId": {
            "__rl": true,
            "value": "1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k",
            "mode": "id"
        },
        "sheetName": {
            "__rl": true,
            "value": 1597077839,
            "mode": "list",
            "cachedResultName": "Sales",
            "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k/edit#gid=1597077839"
        },
        "columns": {
            "mappingMode": "autoMapInputData",
            "value": {
                "date": "={{ $json.date }}",
                "time": "={{ $json.time }}",
                "month": "={{ new Date().getUTCMonth($json.date) + 1 }}",
                "year": "={{ new Date($json.date).getUTCFullYear() }}",
                "weekday": "={{   (() => {\n    const [d,m,y] = $json.date.split('.');\n    return ((new Date(`${y}-${m}-${d}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;\n  })() }}\n",
                "article": "={{ $json.article }}",
                "Brand": "={{ $json.Brand }}",
                "Name": "={{ $json.Name }}",
                "type": "={{ $json.type }}",
                "subtype": "={{ $json.subtype }}",
                "color": "={{ $json.color }}",
                "size": "={{ $json.size }}",
                "manufacturer": "={{ $json.manufacturer }}",
                "price": "={{ $json.price }}",
                "discount_%": "={{ $json[\"discount_%\"] }}",
                "discount_Fix": "={{ $json.discount_Fix }}",
                "Comments": "={{ $json.Comments }}",
                "finalPrice": "={{ $json.finalPrice }}",
                "finalPriceVND": "={{ $json.finalPriceVND }}",
                "curs": "={{ $json.curs }}",
                "currency": "={{ $json.currency }}",
                "username": "={{ $json.username }}",
                "paymentmethod": "={{ $json.paymentmethod }}",
                "description": "={{ $json.description }}",
                "salary": "={{ $json.finalPriceVND * $json.Salary /100}}",
                "Terminal": "={{ $json.paymentmethod==\"Terminal\" ? $json.finalPriceVND * 0.042 : 0 }}\n",
                "amount to supplier": "={{ $json.finalPriceVND * $json[\"Процент поставщикам\"] /100}}"
            },
            "matchingColumns": [],
            "schema": [
                {
                    "id": "date",
                    "displayName": "date",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "time",
                    "displayName": "time",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "month",
                    "displayName": "month",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "year",
                    "displayName": "year",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "weekday",
                    "displayName": "weekday",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "article",
                    "displayName": "article",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Brand",
                    "displayName": "Brand",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Name",
                    "displayName": "Name",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "type",
                    "displayName": "type",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "subtype",
                    "displayName": "subtype",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "color",
                    "displayName": "color",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "size",
                    "displayName": "size",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "manufacturer",
                    "displayName": "manufacturer",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "price",
                    "displayName": "price",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "discount_Fix",
                    "displayName": "discount_Fix",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "discount_%",
                    "displayName": "discount_%",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Comments",
                    "displayName": "Comments",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "finalPrice",
                    "displayName": "finalPrice",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "finalPriceVND",
                    "displayName": "finalPriceVND",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "curs",
                    "displayName": "curs",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "currency",
                    "displayName": "currency",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "username",
                    "displayName": "username",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "paymentmethod",
                    "displayName": "paymentmethod",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "salary",
                    "displayName": "salary",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "basketid",
                    "displayName": "basketid",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Terminal",
                    "displayName": "Terminal",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "amount to supplier",
                    "displayName": "amount to supplier",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "Profit",
                    "displayName": "Profit",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "done",
                    "displayName": "done",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                },
                {
                    "id": "description",
                    "displayName": "description",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "store",
                    "displayName": "store",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true
                },
                {
                    "id": "sales",
                    "displayName": "sales",
                    "required": false,
                    "defaultMatch": false,
                    "display": true,
                    "type": "string",
                    "canBeUsedToMatch": true,
                    "removed": true
                }
            ],
            "attemptToConvertTypes": false,
            "convertFieldsToString": false
        },
        "options": {
            "useAppend": true
        }
    };

    @node({
        name: "Edit Fields1",
        type: "n8n-nodes-base.set",
        version: 3.4,
        position: [-256, 656]
    })
    EditFields1 = {
        "mode": "raw",
        "jsonOutput": "= {\"data\": [{\n    \"date\": \"17.02.2026\",\n    \"time\": \"18:38\",\n    \"month\": \"2\",\n    \"year\": \"2026\",\n    \"weekday\": \"2\",\n    \"article\": \"07103011428\",\n    \"Brand\": \"BUTTON ROUGE\",\n    \"Name\": \"CARDIGAN “KIMONO”\",\n    \"type\": \"одежда\",\n    \"subtype\": \"кимоно\",\n    \"color\": \"red\",\n    \"size\": \"length 100 cm, free\",\n    \"manufacturer\": \"Nhung\",\n    \"price\": 1350000,\n    \"discount_Fix\": \"\",\n    \"discount_%\": \"\",\n    \"Comments\": \"\",\n    \"finalPrice\": 4234.6079019,\n    \"finalPriceVND\": 1350000,\n    \"curs\": \"0.003136746594\",\n    \"currency\": \"RUB\",\n    \"username\": \"Nina\",\n    \"paymentmethod\": \"Transfer\",\n    \"salary\": 67500,\n    \"basketid\": \"6a019332-3d3b-4698-a552-3b7c537f468b\",\n    \"Terminal\": 0,\n    \"amount to supplier\": 0,\n    \"done\": \"\",\n    \"description\": \"кимоно красное 100 см\",\n    \"store\": \"Vibe\",\n    \"sales\": \"\",\n    \"sheetName_sklad\": \"Sklad3\",\n    \"sheetName_accounting\": \"accounting3\",\n    \"quantity\": \"1\",\n    \"Profit\": 1282500\n  },  {\n    \"date\": \"17.02.2026\",\n    \"time\": \"18:38\",\n    \"month\": \"2\",\n    \"year\": \"2026\",\n    \"weekday\": \"2\",\n    \"article\": \"07101031430\",\n    \"Brand\": \"BUTTON ROUGE\",\n    \"Name\": \"TROUSERS HAKAMA\",\n    \"type\": \"одежда\",\n    \"subtype\": \"брюки\",\n    \"color\": \"red\",\n    \"size\": \"length 110 cm, S\",\n    \"manufacturer\": \"Nhung\",\n    \"price\": 1450000,\n    \"discount_Fix\": \"\",\n    \"discount_%\": \"\",\n    \"Comments\": \"\",\n    \"finalPrice\": 4548.2825612999995,\n    \"finalPriceVND\": 1450000,\n    \"curs\": \"0.003136746594\",\n    \"currency\": \"RUB\",\n    \"username\": \"Nina\",\n    \"paymentmethod\": \"Transfer\",\n    \"salary\": 72500,\n    \"basketid\": \"6a019332-3d3b-4698-a552-3b7c537f468b\",\n    \"Terminal\": 0,\n    \"amount to supplier\": 0,\n    \"done\": \"\",\n    \"description\": \"брюки хакама красные S 110 см\",\n    \"store\": \"Vibe\",\n    \"sales\": \"\",\n    \"sheetName_sklad\": \"Sklad3\",\n    \"sheetName_accounting\": \"accounting3\",\n    \"quantity\": \"1\",\n    \"Profit\": 1377500\n  }\n]\n}\n\n",
        "options": {}
    };

    @node({
        name: "When clicking ‘Execute workflow’",
        type: "n8n-nodes-base.manualTrigger",
        version: 1,
        position: [-464, 656]
    })
    WhenClickingExecuteWorkflow = {};

    @node({
        name: "Split Out1",
        type: "n8n-nodes-base.splitOut",
        version: 1,
        position: [-48, 656]
    })
    SplitOut1 = {
        "fieldToSplitOut": "data",
        "options": {}
    };

    @node({
        name: "Send a text message",
        type: "n8n-nodes-base.telegram",
        version: 1.2,
        position: [560, 304],
        credentials: {telegramApi:{id:"lFQKH2n9JXxdFI4k",name:"Button Rouge Sales Chat"}}
    })
    SendATextMessage = {
        "chatId": "-4530967442",
        "text": "=<b>{{ $json.Brand }} {{ $json.Name }}</b>\n{{ $json.description }}\nЦена: <b>{{ $json.finalPriceVND.toLocaleString() }}</b>\nОстаток: \n{{ $json.quantity - 1 < 5 \n  ? \"<b> ⚠️ВНИМАНИЕ: осталось \" + ($json.quantity - 1) + \" шт.</b>\" \n  : \"<b>\" + ($json.quantity - 1) + \" шт.</b>\" \n}}",
        "additionalFields": {
            "appendAttribution": false,
            "parse_mode": "HTML"
        }
    };

    @node({
        name: "Send a text message1",
        type: "n8n-nodes-base.telegram",
        version: 1.2,
        position: [1104, 592],
        credentials: {telegramApi:{id:"lFQKH2n9JXxdFI4k",name:"Button Rouge Sales Chat"}}
    })
    SendATextMessage1 = {
        "chatId": "-4530967442",
        "text": "=📊 *ИТОГО*\n\n🏬 *{{ $json.store }}*  👤 {{ $json.username }}\n💰 Сумма: *{{ $json.sum_finalPriceVND.toLocaleString() }}*  \n💳 Способ оплаты: *{{ $json.paymentmethod === \"Terminal\" ? \"⚠️ ТЕРМИНАЛ\" : $json.paymentmethod }}* *{{ $json.currency}}*\n📈 Profit: *{{ $json.sum_Profit }}*",
        "additionalFields": {
            "appendAttribution": false
        }
    };

    @node({
        name: "Aggregate1",
        type: "n8n-nodes-base.aggregate",
        version: 1,
        position: [672, 592]
    })
    Aggregate1 = {
        "aggregate": "aggregateAllItemData",
        "destinationFieldName": "",
        "include": "specifiedFields",
        "options": {}
    };

    @node({
        name: "Summarize",
        type: "n8n-nodes-base.summarize",
        version: 1.1,
        position: [192, 528]
    })
    Summarize = {
        "fieldsToSummarize": {
            "values": [
                {
                    "aggregation": "sum",
                    "field": "finalPriceVND"
                },
                {
                    "aggregation": "sum",
                    "field": "Profit"
                }
            ]
        },
        "options": {}
    };

    @node({
        name: "Edit Fields2",
        type: "n8n-nodes-base.set",
        version: 3.4,
        position: [192, 656]
    })
    EditFields2 = {
        "assignments": {
            "assignments": [
                {
                    "id": "49d60107-53ce-4513-8718-776c7741d023",
                    "name": "store",
                    "value": "={{ $json.store }}",
                    "type": "string"
                },
                {
                    "id": "304fe962-2ffe-4028-b081-27fd37b69c8c",
                    "name": "username",
                    "value": "={{ $json.username }}",
                    "type": "string"
                },
                {
                    "id": "8bf23636-fff7-4375-9b52-605e59ccd884",
                    "name": "paymentmethod",
                    "value": "={{ $json.paymentmethod }}",
                    "type": "string"
                },
                {
                    "id": "23f40a88-7ff2-4a62-8293-57435a4f391a",
                    "name": "currency",
                    "value": "={{ $json.currency }}",
                    "type": "string"
                }
            ]
        },
        "options": {}
    };

    @node({
        name: "Merge4",
        type: "n8n-nodes-base.merge",
        version: 3.2,
        position: [480, 592]
    })
    Merge4 = {};

    @node({
        name: "Edit Fields3",
        type: "n8n-nodes-base.set",
        version: 3.4,
        position: [880, 592]
    })
    EditFields3 = {
        "assignments": {
            "assignments": [
                {
                    "id": "72f00154-40ca-4d42-bf1e-854a3adfeebe",
                    "name": "sum_finalPriceVND",
                    "value": "={{ $json[\"\"][0].sum_finalPriceVND.toLocaleString() }}",
                    "type": "string"
                },
                {
                    "id": "0cd99881-ac55-44e1-b733-b1bfeb8bd3ff",
                    "name": "sum_Profit",
                    "value": "={{ $json[\"\"][0].sum_Profit.toLocaleString() }}",
                    "type": "string"
                },
                {
                    "id": "1fba25a6-5dc6-437e-989b-77c1cd67021e",
                    "name": "store",
                    "value": "={{ $json[\"\"][1].store }}",
                    "type": "string"
                },
                {
                    "id": "8415531e-e58d-4f81-8651-a5acc646072c",
                    "name": "username",
                    "value": "={{ $json[\"\"][1].username }}",
                    "type": "string"
                },
                {
                    "id": "2012cc5f-3079-4db5-9b7a-ec85b4ccffa2",
                    "name": "paymentmethod",
                    "value": "={{ $json[\"\"][1].paymentmethod }}",
                    "type": "string"
                },
                {
                    "id": "d2cc28f7-b513-4dd0-8583-7ddc9d7fcfa4",
                    "name": "currency",
                    "value": "={{ $json[\"\"][1].currency }}",
                    "type": "string"
                }
            ]
        },
        "options": {}
    };


    // =====================================================================
// ROUTAGE ET CONNEXIONS
// =====================================================================

    @links()
    defineRouting() {
        this.Webhook1.out(0).to(this.Switch_.in(0));
        this.Switch_.out(0).to(this.SplitOut.in(0));
        this.SplitOut.out(0).to(this.Getsalary.in(0));
        this.SplitOut.out(0).to(this.Merge.in(0));
        this.SplitOut.out(0).to(this.Getsalary1.in(0));
        this.SplitOut.out(0).to(this.Merge2.in(0));
        this.Getsalary.out(0).to(this.Merge.in(1));
        this.Merge.out(0).to(this.EditFields.in(0));
        this.EditFields.out(0).to(this.Merge3.in(0));
        this.Getsalary1.out(0).to(this.Merge2.in(1));
        this.Merge2.out(0).to(this.Merge3.in(1));
        this.Merge3.out(0).to(this.RemoveDuplicates1.in(0));
        this.RemoveDuplicates1.out(0).to(this.Node.in(0));
        this.Node.out(0).to(this.Profit.in(0));
        this.Profit.out(0).to(this.Sales.in(0));
        this.If_.out(0).to(this.Node2.in(0));
        this.If_.out(1).to(this.RespondToWebhook.in(0));
        this.Node2.out(0).to(this.RespondToWebhook.in(0));
        this.Sales.out(0).to(this.Node1.in(0));
        this.Sales.out(0).to(this.If_.in(0));
        this.Sales.out(0).to(this.Summarize.in(0));
        this.Sales.out(0).to(this.EditFields2.in(0));
        this.Sales.out(0).to(this.SendATextMessage.in(0));
        this.WhenClickingExecuteWorkflow.out(0).to(this.EditFields1.in(0));
        this.EditFields1.out(0).to(this.SplitOut1.in(0));
        this.SplitOut1.out(0).to(this.Summarize.in(0));
        this.SplitOut1.out(0).to(this.EditFields2.in(0));
        this.SplitOut1.out(0).to(this.SendATextMessage.in(0));
        this.Aggregate1.out(0).to(this.EditFields3.in(0));
        this.Summarize.out(0).to(this.Merge4.in(0));
        this.EditFields2.out(0).to(this.Merge4.in(1));
        this.Merge4.out(0).to(this.Aggregate1.in(0));
        this.EditFields3.out(0).to(this.SendATextMessage1.in(0));
    }
}