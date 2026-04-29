import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : return
// Nodes   : 17  |  Connections: 17
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// ParseBody                          code
// Switch_                            switch
// ReadSalesForRequest                googleSheets               [creds]
// PrepareReq                         code
// UpdateSalesPending                 googleSheets               [creds]
// RespondReq                         respondToWebhook
// ReadSalesForApprove                googleSheets               [creds]
// PrepareApprove                     code
// UpdateSalesDecision                googleSheets               [creds]
// IfApproved                         if
// RestoreSklad                       googleSheets               [creds]
// IfCash                             if
// PrepareAccountingEntry             code
// AppendAccounting                   googleSheets               [creds]
// RespondApproved                    respondToWebhook
// RespondRejected                    respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → ParseBody
//      → Switch_
//       .out(0) requestReturn → ReadSalesForRequest
//           → PrepareReq
//             → UpdateSalesPending
//               → RespondReq
//       .out(1) approveReturn → ReadSalesForApprove
//           → PrepareApprove
//             → UpdateSalesDecision
//               → IfApproved
//                 → RestoreSklad
//                   → IfCash
//                     → PrepareAccountingEntry
//                       → AppendAccounting
//                         → RespondApproved
//                    .out(1) → RespondApproved (↩ loop)
//                .out(1) → RespondRejected
// </workflow-map>

@workflow({
    id: 'returnWorkflow2026v1',
    name: 'return',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class ReturnWorkflow {

    @node({
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [-1600, 0],
    })
    Webhook = {
        httpMethod: 'POST',
        path: 'return',
        responseMode: 'responseNode',
        options: {
            allowedOrigins: '*',
            responseHeaders: {
                entries: [{ name: 'Access-Control-Allow-Origin', value: 'ALL' }],
            },
        },
    };

    @node({
        name: 'ParseBody',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1360, 0],
    })
    ParseBody = {
        jsCode: `const body = $json.body || {};
return {
  action: body.action || '',
  basketid: body.basketid || '',
  row_numbers: Array.isArray(body.row_numbers) ? body.row_numbers.map(Number) : [],
  reason: body.reason || '',
  comment: body.comment || '',
  decision: body.decision || '',
  username: body.username || '',
};`,
    };

    @node({
        name: 'Switch',
        type: 'n8n-nodes-base.switch',
        version: 3.2,
        position: [-1120, 0],
    })
    Switch_ = {
        rules: {
            values: [
                {
                    conditions: {
                        options: { caseSensitive: false, leftValue: '', typeValidation: 'strict', version: 2 },
                        conditions: [{ leftValue: '={{ $json.action }}', rightValue: 'requestReturn', operator: { type: 'string', operation: 'equals' }, id: 'sw-req' }],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'requestReturn',
                },
                {
                    conditions: {
                        options: { caseSensitive: false, leftValue: '', typeValidation: 'strict', version: 2 },
                        conditions: [{ leftValue: '={{ $json.action }}', rightValue: 'approveReturn', operator: { type: 'string', operation: 'equals' }, id: 'sw-appr' }],
                        combinator: 'and',
                    },
                    renameOutput: true,
                    outputKey: 'approveReturn',
                },
            ],
        },
        options: { ignoreCase: true },
    };

    // ── requestReturn branch ──────────────────────────────────────────

    @node({
        name: 'ReadSalesForRequest',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-880, -240],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    ReadSalesForRequest = {
        authentication: 'serviceAccount',
        documentId: { __rl: true, value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k', mode: 'id' },
        sheetName: { __rl: true, value: 1597077839, mode: 'list', cachedResultName: 'Sales' },
        filtersUI: { values: [{ lookupColumn: 'basketid', lookupValue: '={{ $json.basketid }}' }] },
        options: {},
    };

    @node({
        name: 'PrepareReq',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-640, -240],
    })
    PrepareReq = {
        jsCode: `const req = $('ParseBody').first().json;
const rowNumbers = req.row_numbers;
const rows = $input.all();
const now = new Date();
const pad = n => String(n).padStart(2, '0');
const date = pad(now.getDate()) + '.' + pad(now.getMonth()+1) + '.' + now.getFullYear();
const time = pad(now.getHours()) + ':' + pad(now.getMinutes());

const updates = [];
for (const item of rows) {
  if (!rowNumbers.includes(Number(item.json.row_number))) continue;
  if (item.json.is_return === 'TRUE') {
    throw new Error('Товар уже возвращён: ' + item.json.article);
  }
  if (item.json.return_status === 'pending') {
    throw new Error('Уже ожидает апрува: ' + item.json.article);
  }
  updates.push({ json: {
    basketid: item.json.basketid,
    article: item.json.article,
    return_status: 'pending',
    return_date: date,
    return_time: time,
    return_reason: req.reason,
  }});
}
if (!updates.length) throw new Error('Нет строк для возврата');
return updates;`,
    };

    @node({
        name: 'UpdateSalesPending',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-400, -240],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    UpdateSalesPending = {
        authentication: 'serviceAccount',
        operation: 'update',
        documentId: { __rl: true, value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k', mode: 'id' },
        sheetName: { __rl: true, value: 1597077839, mode: 'list', cachedResultName: 'Sales' },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                basketid: '={{ $json.basketid }}',
                article: '={{ $json.article }}',
                return_status: '={{ $json.return_status }}',
                return_date: '={{ $json.return_date }}',
                return_time: '={{ $json.return_time }}',
                return_reason: '={{ $json.return_reason }}',
            },
            matchingColumns: ['basketid', 'article'],
            schema: [
                { id: 'basketid', displayName: 'basketid', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'article', displayName: 'article', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'return_status', displayName: 'return_status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
                { id: 'return_date', displayName: 'return_date', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
                { id: 'return_time', displayName: 'return_time', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
                { id: 'return_reason', displayName: 'return_reason', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'RespondReq',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [-160, -240],
    })
    RespondReq = {
        respondWith: 'json',
        responseBody: '{"success":true}',
        options: { responseHeaders: { entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }] } },
    };

    // ── approveReturn branch ─────────────────────────────────────────

    @node({
        name: 'ReadSalesForApprove',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-880, 240],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    ReadSalesForApprove = {
        authentication: 'serviceAccount',
        documentId: { __rl: true, value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k', mode: 'id' },
        sheetName: { __rl: true, value: 1597077839, mode: 'list', cachedResultName: 'Sales' },
        filtersUI: { values: [{ lookupColumn: 'basketid', lookupValue: '={{ $json.basketid }}' }] },
        options: {},
    };

    @node({
        name: 'PrepareApprove',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-640, 240],
    })
    PrepareApprove = {
        jsCode: `const req = $('ParseBody').first().json;
const rowNumbers = req.row_numbers;
const decision = req.decision;
const rows = $input.all();
const now = new Date();
const pad = n => String(n).padStart(2, '0');
const date = pad(now.getDate()) + '.' + pad(now.getMonth()+1) + '.' + now.getFullYear();
const time = pad(now.getHours()) + ':' + pad(now.getMinutes());

const updates = [];
for (const item of rows) {
  if (!rowNumbers.includes(Number(item.json.row_number))) continue;
  if (item.json.return_status !== 'pending') {
    throw new Error('Строка не в статусе pending: ' + item.json.article);
  }
  updates.push({ json: {
    basketid: item.json.basketid,
    article: item.json.article,
    is_return: decision === 'approved' ? 'TRUE' : '',
    return_status: decision,
    return_comment: req.comment,
    return_approved_by: req.username,
    return_date: decision === 'approved' ? date : (item.json.return_date || ''),
    return_time: decision === 'approved' ? time : (item.json.return_time || ''),
    // metadata for sklad/accounting restore (not written to Sales)
    _sheetName_sklad: item.json.sheetName_sklad,
    _sheetName_accounting: item.json.sheetName_accounting,
    _paymentmethod: item.json.paymentmethod,
    _finalPrice: Number(item.json.finalPrice) || 0,
    _month: item.json.month,
    _year: item.json.year,
    _username: item.json.username,
    _quantity: Number(item.json.quantity) || 1,
  }});
}
if (!updates.length) throw new Error('Нет строк для обработки');
return updates;`,
    };

    @node({
        name: 'UpdateSalesDecision',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-400, 240],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    UpdateSalesDecision = {
        authentication: 'serviceAccount',
        operation: 'update',
        documentId: { __rl: true, value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k', mode: 'id' },
        sheetName: { __rl: true, value: 1597077839, mode: 'list', cachedResultName: 'Sales' },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                basketid: '={{ $json.basketid }}',
                article: '={{ $json.article }}',
                is_return: '={{ $json.is_return }}',
                return_status: '={{ $json.return_status }}',
                return_comment: '={{ $json.return_comment }}',
                return_approved_by: '={{ $json.return_approved_by }}',
                return_date: '={{ $json.return_date }}',
                return_time: '={{ $json.return_time }}',
            },
            matchingColumns: ['basketid', 'article'],
            schema: [
                { id: 'basketid', displayName: 'basketid', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'article', displayName: 'article', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'is_return', displayName: 'is_return', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
                { id: 'return_status', displayName: 'return_status', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
                { id: 'return_comment', displayName: 'return_comment', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
                { id: 'return_approved_by', displayName: 'return_approved_by', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
                { id: 'return_date', displayName: 'return_date', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
                { id: 'return_time', displayName: 'return_time', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'IfApproved',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [-160, 240],
    })
    IfApproved = {
        conditions: {
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
            conditions: [{ id: 'if-appr', leftValue: '={{ $json.return_status }}', rightValue: 'approved', operator: { type: 'string', operation: 'equals' } }],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'RestoreSklad',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [80, 120],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
        onError: 'continueRegularOutput',
    })
    RestoreSklad = {
        authentication: 'serviceAccount',
        operation: 'update',
        documentId: { __rl: true, value: '1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k', mode: 'id' },
        sheetName: { __rl: true, value: '={{ $json._sheetName_sklad }}', mode: 'name' },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                article: '={{ $json.article }}',
                quantity: '={{ $json._quantity + 1 }}',
            },
            matchingColumns: ['article'],
            schema: [
                { id: 'article', displayName: 'article', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'quantity', displayName: 'quantity', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'IfCash',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [320, 120],
    })
    IfCash = {
        conditions: {
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
            conditions: [{ id: 'if-cash', leftValue: '={{ $json._paymentmethod }}', rightValue: 'Cash', operator: { type: 'string', operation: 'equals' } }],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        name: 'PrepareAccountingEntry',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [560, 20],
    })
    PrepareAccountingEntry = {
        jsCode: `const items = $input.all();
const total = items.reduce((sum, i) => sum + (Number(i.json._finalPrice) || 0), 0);
const first = items[0].json;
return [{ json: {
  _return_date: first.return_date,
  _return_time: first.return_time,
  _sheetName_accounting: first._sheetName_accounting,
  _finalPrice: total,
  _month: first._month,
  _year: first._year,
  _username: first._username,
  basketid: first.basketid,
  return_comment: first.return_comment,
}}];`,
    };

    @node({
        name: 'AppendAccounting',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [800, 20],
        credentials: { googleApi: { id: 'hUOxiGKUqjjYiCun', name: 'Google Sheets account' } },
    })
    AppendAccounting = {
        authentication: 'serviceAccount',
        operation: 'append',
        documentId: { __rl: true, value: '1C4D4tPQ7fJDcjxQTZxt7AmwTv5MhdON5v8giZUWHLPs', mode: 'id' },
        sheetName: { __rl: true, value: '={{ $json._sheetName_accounting }}', mode: 'name' },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                'Дата': '={{ $json._return_date }}',
                'Время': '={{ $json._return_time }}',
                'Вид': 'Факт',
                'Тип': 'Расход',
                'Сумма': '={{ $json._finalPrice }}',
                'Бюджет': 'BUTTON ROUGE',
                'Статья расходов': 'Возврат',
                'Год': '={{ $json._year }}',
                'Месяц': '={{ $json._month }}',
                'Комментарий': '={{ "Возврат " + String($json.basketid).substring(0, 8) + ": " + ($json.return_comment || "") }}',
                'username': '={{ $json._username }}',
                'PaymentCashRegister': 'Касса',
                'countInBudget': '1',
            },
            matchingColumns: ['id'],
            schema: [
                { id: 'Дата', displayName: 'Дата', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'Время', displayName: 'Время', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'Вид', displayName: 'Вид', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'Тип', displayName: 'Тип', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'Сумма', displayName: 'Сумма', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'Бюджет', displayName: 'Бюджет', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'Статья расходов', displayName: 'Статья расходов', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'Год', displayName: 'Год', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'Месяц', displayName: 'Месяц', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'Комментарий', displayName: 'Комментарий', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'username', displayName: 'username', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'PaymentCashRegister', displayName: 'PaymentCashRegister', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
                { id: 'id', displayName: 'id', required: false, defaultMatch: true, display: true, type: 'string', canBeUsedToMatch: true, removed: true },
                { id: 'countInBudget', displayName: 'countInBudget', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        name: 'RespondApproved',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [1040, 120],
    })
    RespondApproved = {
        respondWith: 'json',
        responseBody: '{"success":true}',
        options: { responseHeaders: { entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }] } },
    };

    @node({
        name: 'RespondRejected',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.2,
        position: [80, 360],
    })
    RespondRejected = {
        respondWith: 'json',
        responseBody: '{"success":true}',
        options: { responseHeaders: { entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }] } },
    };

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.ParseBody.in(0));
        this.ParseBody.out(0).to(this.Switch_.in(0));

        // requestReturn
        this.Switch_.out(0).to(this.ReadSalesForRequest.in(0));
        this.ReadSalesForRequest.out(0).to(this.PrepareReq.in(0));
        this.PrepareReq.out(0).to(this.UpdateSalesPending.in(0));
        this.UpdateSalesPending.out(0).to(this.RespondReq.in(0));

        // approveReturn
        this.Switch_.out(1).to(this.ReadSalesForApprove.in(0));
        this.ReadSalesForApprove.out(0).to(this.PrepareApprove.in(0));
        this.PrepareApprove.out(0).to(this.UpdateSalesDecision.in(0));
        this.UpdateSalesDecision.out(0).to(this.IfApproved.in(0));
        this.IfApproved.out(0).to(this.RestoreSklad.in(0));      // approved
        this.IfApproved.out(1).to(this.RespondRejected.in(0));   // rejected
        this.RestoreSklad.out(0).to(this.IfCash.in(0));
        this.IfCash.out(0).to(this.PrepareAccountingEntry.in(0)); // Cash
        this.IfCash.out(1).to(this.RespondApproved.in(0));        // not Cash
        this.PrepareAccountingEntry.out(0).to(this.AppendAccounting.in(0));
        this.AppendAccounting.out(0).to(this.RespondApproved.in(0));
    }
}
