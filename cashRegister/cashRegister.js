



let CASH_REGISTER_VOCAB = { operationTypes: ["Encashment", "Sale"], activities: [] };
let cashRegisterSubmitInProgress = false;
const cashRegisterTr = (text, fallback = text) =>
  typeof window.localizeUiText === "function" ? window.localizeUiText(text, fallback) : fallback;

if (typeof registerPageInit === "function") {
  registerPageInit("cashregister", bodyOnLoad);
} else {
  window.addEventListener("DOMContentLoaded", bodyOnLoad);
}

function bodyOnLoad() {
  getVocabulary();
  getBudgetData();
  getCashRegisterRecords();
}




function getCashRegisterRecords(){
	 let request  = {
  		googleFuncName: "getCashRegisterRecords",
  		callbackJSfunctionName: "returnCashRegisterRecords",
  		params: "BUTTON ROUGE"
  	};
  	runGSfunction(request); 

}


function getVocabulary(){
  	 let request  = {
  		googleFuncName: "getVocabulary",
  		callbackJSfunctionName: "returnVocabulary",
  		params: token
  	};
  	runGSfunction(request); 


}

function getBudgetData(){
	let request  = {
  		googleFuncName: "getCash",
  		callbackJSfunctionName: "returnCash",
  		params: ""
  	};
  	runGSfunction(request); 

}
function budgetFieldChanged(el){
    if(el.id=="CashSum"){
    el.value=toLocaleStringCorrect(el.value)

    }
}

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch (_) { return value; }
}

function setCashRegisterSubmitState(isSubmitting) {
  cashRegisterSubmitInProgress = !!isSubmitting;
  const submitButton = document.getElementById("submitButton");
  if (!submitButton) return;

  if (!submitButton.dataset.defaultLabel) {
    submitButton.dataset.defaultLabel = submitButton.textContent || "Отправить";
  }

  submitButton.disabled = cashRegisterSubmitInProgress;
  submitButton.classList.toggle("is-loading", cashRegisterSubmitInProgress);
  submitButton.textContent = cashRegisterSubmitInProgress
    ? "Отправка..."
    : submitButton.dataset.defaultLabel;
}

function isSuccessfulCashRegisterResponse(raw, depth = 0) {
  if (depth > 6) return false;
  if (raw === true) return true;
  if (raw === false || raw === null || raw === undefined) return false;

  if (typeof raw === "number") return Number.isFinite(raw) && raw !== 0;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return false;
    const lowered = trimmed.toLowerCase();
    if (["0", "false", "fail", "failed", "error", "null", "undefined"].includes(lowered)) return false;
    if (["1", "true", "ok", "success", "created", "done"].includes(lowered)) return true;
    if (
      lowered.includes("error") ||
      lowered.includes("fail") ||
      lowered.includes("ошиб") ||
      lowered.includes("не удалось")
    ) return false;
    if (lowered.includes("успеш")) return true;
    try {
      return isSuccessfulCashRegisterResponse(JSON.parse(trimmed), depth + 1);
    } catch (_) {
      return true;
    }
  }

  if (Array.isArray(raw)) {
    if (raw.length === 0) return false;
    return raw.some((item) => isSuccessfulCashRegisterResponse(item, depth + 1));
  }

  if (typeof raw === "object") {
    if (raw.error || raw.errors) return false;
    if (Number.isFinite(raw.statusCode)) return raw.statusCode >= 200 && raw.statusCode < 300;

    const candidates = [
      raw.success,
      raw.ok,
      raw.result,
      raw.status,
      raw.data,
      raw.response,
      raw.message,
    ].filter((v) => v !== undefined);

    for (const candidate of candidates) {
      if (isSuccessfulCashRegisterResponse(candidate, depth + 1)) return true;
    }
    return false;
  }

  return !!raw;
}

function resetCashRegisterSelectToDefault(selectEl, defaultValue) {
  if (!selectEl) return;

  const options = Array.from(selectEl.options || []);
  const normalizedDefault = String(defaultValue || "").trim();
  if (normalizedDefault) {
    const matched = options.find((option) => String(option.value).trim() === normalizedDefault);
    if (matched) {
      selectEl.value = matched.value;
      return;
    }
  }

  if (options.length > 0) {
    selectEl.selectedIndex = 0;
  }
}

function resetCashRegisterFormToDefaults() {
  const operationType = document.getElementById("OperationType");
  const activity = document.getElementById("activityCashRegister");
  const comment = document.getElementById("Comment");
  const cashSum = document.getElementById("CashSum");

  const defaultOperationType = extractList(CASH_REGISTER_VOCAB?.operationTypes)[0] || "";
  const defaultActivity = extractList(CASH_REGISTER_VOCAB?.activities)[0] || "";

  resetCashRegisterSelectToDefault(operationType, defaultOperationType);
  resetCashRegisterSelectToDefault(activity, defaultActivity);

  if (comment) comment.value = "";
  if (cashSum) cashSum.value = "";
}

function extractList(value) {
  if (value == null) return [];
  if (Array.isArray(value)) {
    const flat = value.flat ? value.flat(1) : value.reduce((acc, v) => acc.concat(v), []);
    return flat
      .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
      .map((v) => String(v));
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

function parseNumberMaybe(value) {
  if (value == null) return null;
  const cleaned = String(value).replace(/\s+/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function extractMatrixVocabulary(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return null;
  const headers = Array.isArray(matrix[0]) ? matrix[0] : null;
  if (!headers) return null;
  const rows = matrix.slice(1);
  return headers.reduce((acc, header, colIndex) => {
    acc[header] = rows
      .map((row) => (Array.isArray(row) ? row[colIndex] : undefined))
      .filter((value) => value !== undefined && value !== "");
    return acc;
  }, {});
}

function uniqueNonEmptyOrdered(values) {
  const seen = new Set();
  const out = [];
  extractList(values).forEach((value) => {
    const trimmed = String(value).trim();
    if (!trimmed) return;
    if (seen.has(trimmed)) return;
    seen.add(trimmed);
    out.push(trimmed);
  });
  return out;
}

function extractVocabularyFromRowObjects(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const allObjects = rows.every((row) => row && typeof row === "object" && !Array.isArray(row));
  if (!allObjects) return null;

  const hasOperationType = rows.some((row) => "Тип операции" in row) || rows.some((row) => "Тип" in row);
  const hasActivity =
    rows.some((row) => "activityCashRegister" in row) || rows.some((row) => "Статья расходов" in row);
  if (!hasOperationType && !hasActivity) return null;

  const operationValues = uniqueNonEmptyOrdered(
    rows.map((row) => row["Тип операции"] ?? row["Type"] ?? "")
  );
  const activityValues = uniqueNonEmptyOrdered(
    rows.map((row) => row["activityCashRegister"] ?? row["Статья расходов"] ?? "")
  );

  return { operationTypes: operationValues, activities: activityValues };
}

async function fetchBudgetVocabularyFallback() {
  if (!window.API || typeof window.API.getBudgetVocabulary !== "function") return [];
  try {
    const data = await window.API.getBudgetVocabulary(
      { action: "getVocabulary", visible: true },
      { overlayId: "cashregister" }
    );
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to fetch budget vocabulary fallback", e);
    return [];
  }
}

function renderCashRegisterForm({ operationTypes, activities }) {
  const contentRight = document.getElementById("content_right");
  if (!contentRight) return;

  contentRight.innerHTML = `<p><strong>${cashRegisterTr("Операция с Кассой")}</strong></p>`;

  const opTypes = extractList(operationTypes);
  const activityList = extractList(activities);

  createNewChoice(opTypes, "OperationType", cashRegisterTr("Тип операции"), "budgetFieldChanged", "content_right");
  createNewChoice(activityList, "activityCashRegister", cashRegisterTr("Статья расходов"), "budgetFieldChanged", "content_right");
  createNewInput("CashSum", `${cashRegisterTr("Сумма")} (${CONFIG.currency})`, "", "budgetFieldChanged", "content_right");

  let attributes = { id: "Comment", onclick: "" };
  createElement("textarea", "", attributes, contentRight);

  attributes = { id: "submitButton", class: "button-24", onclick: "sendDataToCashRegister()" };
  createElement("button", cashRegisterTr("Отправить"), attributes, contentRight);

  CASH_REGISTER_VOCAB = {
    operationTypes: opTypes.length ? opTypes : ["Расход", "Приход"],
    activities: activityList,
  };

  // Defaults: first value in the list (if any)
  try {
    const operationTypeEl = document.getElementById("OperationType");
    if (operationTypeEl) {
      if (opTypes.length > 0) operationTypeEl.value = opTypes[0];
      else if (operationTypeEl.options && operationTypeEl.options.length > 0) operationTypeEl.selectedIndex = 0;
    }
    const activityEl = document.getElementById("activityCashRegister");
    if (activityEl) {
      if (activityList.length > 0) activityEl.value = activityList[0];
      else if (activityEl.options && activityEl.options.length > 0) activityEl.selectedIndex = 0;
    }
  } catch (_) {}
}

async function returnVocabulary(data){
  try {
    const parsed = parseMaybeJson(data);
//console.log(parsed)
    // 0) n8n CashRegister getVocabulary: array of row objects
    const extractedFromObjects = extractVocabularyFromRowObjects(parsed);
    if (extractedFromObjects) {
      renderCashRegisterForm({
        operationTypes: extractedFromObjects.operationTypes.length
          ? extractedFromObjects.operationTypes
          : ["Расход", "Приход"],
        activities: extractedFromObjects.activities,
      });
      return;
    }

    // 1) Legacy matrix format: header row
    const matrixVocabulary = extractMatrixVocabulary(parsed);
    if (matrixVocabulary) {
      renderCashRegisterForm({
        operationTypes: matrixVocabulary["Тип операции"] || matrixVocabulary["Type"] || ["Расход", "Приход"],
        activities: matrixVocabulary["activityCashRegister"] || matrixVocabulary["Статья расходов"] || [],
      });
      return;
    }

    // 2) n8n sklad-like: [{ field: [...] }] or { field: [...] }
    const firstObject =
      (Array.isArray(parsed) && parsed.length > 0 && parsed[0] && typeof parsed[0] === "object" ? parsed[0] : null) ||
      (parsed && typeof parsed === "object" ? parsed : null);
    if (firstObject) {
      const operationTypes = firstObject["Тип операции"] || firstObject["Type"];
      const activities = firstObject["activityCashRegister"] || firstObject["Статья расходов"];
      if (extractList(operationTypes).length || extractList(activities).length) {
        renderCashRegisterForm({ operationTypes: operationTypes || ["Расход", "Приход"], activities: activities || [] });
        return;
      }
    }

    // 3) budget getVocabulary: ["...", "..."]
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      renderCashRegisterForm({ operationTypes: ["Расход", "Приход"], activities: parsed });
      return;
    }

    // 4) Fallback: ask budget endpoint
    const fallback = await fetchBudgetVocabularyFallback();
    renderCashRegisterForm({ operationTypes: ["Расход", "Приход"], activities: fallback });
  } catch (e) {
    console.error("returnVocabulary failed", e, data);
    if (typeof showErrorPopup === "function") {
      showErrorPopup("Не удалось загрузить словарь для кассы");
    }
    renderCashRegisterForm({ operationTypes: ["Расход", "Приход"], activities: [] });
  }
}




function returnCashRegisterRecords(res){
  try {
    if (res == null || res === "") {
      if (typeof showErrorPopup === "function") {
        showErrorPopup("Не удалось загрузить операции кассы (пустой ответ сервера)");
      }
      return;
    }
	   // console.log("res",res)
	    const parsed = parseMaybeJson(res);
	    const normalized = parsed && typeof parsed === "object" ? parsed : {};
	
	    // n8n может вернуть либо { data: [...] }, либо просто массив объектов [...]
	    let rowsPayload =
	      (Array.isArray(parsed) ? parsed : null) ||
	      (normalized?.data && Array.isArray(normalized.data) ? normalized.data : null) ||
	      (normalized?.data?.data && Array.isArray(normalized.data.data) ? normalized.data.data : null) ||
	      [];
	
	    let filters = normalized?.filterOptions || normalized?.filters || normalized?.data?.filterOptions;
	
	    if (!Array.isArray(rowsPayload) || rowsPayload.length === 0) {
	      if (typeof showErrorPopup === "function") {
	        showErrorPopup("Операции кассы не найдены");
	      }
	      return;
	    }
	
	    let rows = rowsPayload;

	    // Display newest first (reverse incoming order).
	    if (Array.isArray(rows) && rows.length > 1) {
	      if (Array.isArray(rows[0])) {
	        const header = rows[0];
	        const dataRows = rows.slice(1).reverse();
	        rows = [header, ...dataRows];
	      } else {
	        rows = rows.slice().reverse();
	      }
	    }
	
	    // If server returned array of objects, normalize to matrix.
	    if (Array.isArray(rows) && rows.length > 0 && rows.every((r) => r && typeof r === "object" && !Array.isArray(r))) {
	      const preferredOrder = [
	        "Date",
	        "Time",
	        "Type",
	        "Amount",
	        "Статья расходов",
	        "Comment",
	        "User",
	        "Бюджет",
	        "PaymentCashRegister",
	        "Вид",
	        "Год",
	        "Месяц",
	        "id",
	        "row_number",
	        "countInBudget",
	      ];
      
	      const headerSet = new Set();
	      rows.forEach((row) => Object.keys(row).forEach((k) => headerSet.add(k)));
	      const header = [];
	      preferredOrder.forEach((k) => { if (headerSet.has(k)) header.push(k); });
	      Array.from(headerSet)
	        .filter((k) => !header.includes(k))
	        .sort((a, b) => String(a).localeCompare(String(b), "ru"))
	        .forEach((k) => header.push(k));
	
	      rows = [header, ...rows.map((row) => header.map((k) => row?.[k] ?? ""))];
	    }

    const hasHeaderRow = Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0]);

    // If filters are missing/empty, derive them from header row.
    if ((!Array.isArray(filters) || filters.length === 0) && hasHeaderRow) {
      filters = rows[0].map((header, index) => ({ header, index }));
    }

    const productTable = new TableLi("product-list");
    productTable.initWithPreloadedData(rows);
    if (Array.isArray(filters) && filters.length > 0) {
      productTable.setFilterOptions(filters);
      productTable.sortByFirstColumn();
    } else if (hasHeaderRow) {
      // Minimal render: header + data rows without filters
      productTable.createTableNew(rows[0]);
      productTable.buildTable(rows.slice(1));
    } else if (typeof showErrorPopup === "function") {
      showErrorPopup("Операции кассы не найдены");
    }
  } catch (e) {
    console.error("returnCashRegisterRecords failed", e, res);
    if (typeof showErrorPopup === "function") {
      showErrorPopup("Не удалось загрузить список операций кассы");
    }
  }
}


function cllearCashRegisterData() {
  resetCashRegisterFormToDefaults();
}


function sendDataToCashRegister(){
if (cashRegisterSubmitInProgress) return;

const operationTypeEl = document.getElementById("OperationType");
const activityEl = document.getElementById("activityCashRegister");
const commentEl = document.getElementById("Comment");
const cashSumEl = document.getElementById("CashSum");

if (!operationTypeEl || !activityEl || !commentEl || !cashSumEl) {
  if (typeof showErrorPopup === "function") {
    showErrorPopup("Форма кассы не готова. Обновите страницу и повторите.");
  }
  return;
}

setCashRegisterSubmitState(true);

const BUDGETNAME="BUTTON ROUGE"


var budgetRecord={}
const now = new Date();
const unixTimestamp = Math.floor(now.getTime() / 1000);
budgetRecord["Date"]=unixTimestamp
budgetRecord["Time"]=unixTimestamp
budgetRecord["Бюджет"]=BUDGETNAME
budgetRecord["Вид"]="Факт"
budgetRecord["Год"]=now.getFullYear()
budgetRecord["Месяц"]=now.getMonth() + 1

budgetRecord["Type"]=operationTypeEl.value
budgetRecord["Статья расходов"]=activityEl.value
const usernameFromDom = document.getElementById("username")?.textContent;
const resolvedUsername = String(username || window.currentLoginName || usernameFromDom || "").trim();
budgetRecord["username"]=resolvedUsername;
budgetRecord["PaymentCashRegister"]="Касса"
budgetRecord["Comment"]=commentEl.value
budgetRecord["Amount"]=cashSumEl.value
budgetRecord["countInBudget"]=0;
const storeElement = document.getElementById("store");
const storeContext = window.USER_STORE || {};
const storeId = storeContext.storeId || storeContext.store || storeContext.id || "";
const storeNameFromContext =
  storeContext.storeName || storeContext.name || storeContext.store || storeContext?.[1] || "";
const resolvedStoreName = storeNameFromContext || (storeElement ? storeElement.textContent : "");
const cachedStores = Array.isArray(window.STORES_CACHE) ? window.STORES_CACHE : [];
const cachedStore =
  cachedStores.find((s) => {
    const id = Number(s?.storeId ?? s?.id ?? s?.[0]);
    return storeId && id === Number(storeId);
  }) ||
  cachedStores.find((s) => {
    const name = String(s?.storeName || s?.name || "").trim().toLowerCase();
    return resolvedStoreName && name === String(resolvedStoreName).trim().toLowerCase();
  }) ||
  null;
const sheetNameAccounting =
  storeContext.sheetName_accounting ||
  storeContext.accounting ||
  cachedStore?.sheetName_accounting ||
  cachedStore?.accounting ||
  cachedStore?.sheetName_accounting;
const storeMetadata = {
  store: storeId,
  storeId,
  storeName: resolvedStoreName,
};
if ("sheetName_accounting" in storeContext) {
  storeMetadata.sheetName_accounting = storeContext.sheetName_accounting;
}
if ("accounting" in storeContext) {
  storeMetadata.accounting = storeContext.accounting;
}
if ("accountingSheet" in storeContext) {
  storeMetadata.accountingSheet = storeContext.accountingSheet;
}
if (sheetNameAccounting && !storeMetadata.sheetName_accounting) {
  storeMetadata.sheetName_accounting = sheetNameAccounting;
}
if (sheetNameAccounting && !storeMetadata.accounting) {
  storeMetadata.accounting = sheetNameAccounting;
}
budgetRecord["storeName"] = resolvedStoreName;
const payload = {
  ...budgetRecord,
  ...storeMetadata,
};




/*
let budgetRecord={
    date: getCurrentDate(),
    time: getCurrentTime(),
    type: "Факт",
    category: document.getElementById("OperationType").value,
    amount: document.getElementById("CashSum").value,
    budget: BUDGETNAME,
    description: document.getElementById("activityCashRegister").value,
    comment: document.getElementById("Comment").value,
    username:username,
    paymentCashRegister:"Касса"
  }
//console.log(budgetRecord)
*/

	let request  = {
  		googleFuncName: "addCacheRegisterRecord",
  		callbackJSfunctionName: "dataRegistredToCashRegister",
  		params: JSON.stringify(payload)
  	};
  	runGSfunction(request)
      .catch((error) => {
        console.error("sendDataToCashRegister failed", error);
        if (typeof showErrorPopup === "function") {
          showErrorPopup(CONFIG.errorwritingcash || "Не удалось записать операцию в кассу");
        }
      })
      .finally(() => {
        if (cashRegisterSubmitInProgress) {
          setCashRegisterSubmitState(false);
        }
      }); 



}



function dataRegistredToCashRegister(result){
  const parsed = parseMaybeJson(result);
  const isPayloadEchoSuccess =
    Array.isArray(parsed) &&
    parsed.length > 0 &&
    parsed.every((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return false;
      if (row.error || row.errors) return false;
      const hasCashRegisterFields =
        "Date" in row ||
        "Time" in row ||
        "Type" in row ||
        "Amount" in row ||
        "Статья расходов" in row;
      return hasCashRegisterFields;
    });
  const isEmptyObject =
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    Object.keys(parsed).length === 0;
  // Backward compatibility: CashRegister endpoint may return empty body/object on successful write.
  const isLegacyEmptySuccess =
    parsed == null ||
    parsed === "" ||
    (Array.isArray(parsed) && parsed.length === 0) ||
    isEmptyObject;
  const ok = isLegacyEmptySuccess || isPayloadEchoSuccess || isSuccessfulCashRegisterResponse(parsed);

  if (ok) {
    showInformationalPopup(CONFIG.cashRegistred || "Операция в кассе зарегистрирована");
    resetCashRegisterFormToDefaults();
  } else {
    const errorMessage =
      parsed?.error ||
      parsed?.message ||
      parsed?.data?.error ||
      parsed?.data?.message ||
      CONFIG.errorwritingcash ||
      "Не удалось записать операцию в кассу";
    showErrorPopup(errorMessage);
  }

  setCashRegisterSubmitState(false);
  getBudgetData();
  getCashRegisterRecords();
}





function returnCash(data){
  //console.log("data_for_cards", data);

  const parsed = parseMaybeJson(data[0]);
  let cardValue1 = parsed;
  if (parsed && typeof parsed === "object") {
    cardValue1 =
      parsed.cash ??
      parsed.value ??
      parsed.amount ??
      toLocaleStringCorrect(parsed["Остаток в кассе"]) ??
      parsed.data ??
      parsed.total ??
      parsed;
  }
  cardValue1 = cardValue1 == null ? "" : String(cardValue1);

  const numeric = parseNumberMaybe(cardValue1);
  const isZero = cardValue1 === "0,00" || numeric === 0 || cardValue1 === "" || cardValue1 === "0";
  const cardValue2="Сейчас в кассе"
  const cardValue3="Сейчас в кассе"
  const cardText1="Сейчас в кассе"
  const cardText2="Сейчас в кассе"
  const cardText3="Сейчас в кассе"


	   const cards = [
	            {
	                title: `<span class="styled-box">${cardText1} </span>`,
	                value: !isZero ? cardValue1 : "No money in Cash Register",
	                label: !isZero ? CONFIG.currency : "",
	                class: numeric !== null && numeric <= 0 ? "red" : "green", // Красный, если зарплаты не было
	            },
            /*
            {
                title: `Salary for Month <span class="styled-box">${cardText2} </span>`,
                value: cardValue2,
                label: CONFIG.currency,
                class: "green",
            },
            {
                title: `Salary for Year <span class="styled-box">${cardText3} </span>`,
                value: cardValue3,
                label: CONFIG.currency,
                class: "green",
            },
            */
        ];



//createDataPicker(eventDates)
    displayStatistics1(cards);

}





       // Функция для отображения статистики
    function displayStatistics1(cards) {
          const dashboard = document.getElementById("dashboard");
           dashboard.innerHTML = ""; // Очищаем текущий контент

             // Создаем карточки
     

        // Генерация HTML для карточек
        cards.forEach((card) => {
            const cardElement = document.createElement("div");
            cardElement.className = "card";
            cardElement.innerHTML = `
                <h3>${card.title}</h3>
                <p class="value ${card.class}">${card.value}</p>
                <p class="label">${card.label}</p>
            `;
            dashboard.appendChild(cardElement);
        });

/*
        // Добавление графика (грейды остаются статичными в данном примере)
        const chartCard = document.createElement("div");
        chartCard.className = "card chart-card";
        chartCard.innerHTML = `
            <h3>Salary per month</h3>
            <canvas id="grade-salary-chart"></canvas>
        `;
        dashboard.appendChild(chartCard);

        // Отрисовка графика
    //    const ctx = document.getElementById("grade-salary-chart").getContext("2d");

  */
    }


function colorizeTable()
{

  const tbody = document.getElementById('tbody');
  const rows = tbody.querySelectorAll('tr');
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    // Проверяем второй столбец (индекс 1)
    const operationType = cells[1]?.textContent.trim();

    if (operationType === 'Приход') {
      row.classList.add('income');
    } else if (operationType === 'Расход') {
      row.classList.add('expense');
    }
  });



}
