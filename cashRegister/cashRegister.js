



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

async function fetchBudgetVocabularyFallback() {
  if (typeof getDataFromN8n !== "function") return [];
  try {
    const query = { action: "getVocabulary", visible: true };
    const params = { data: { query } };
    const data = await getDataFromN8n("budget", params);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Failed to fetch budget vocabulary fallback", e);
    return [];
  }
}

function renderCashRegisterForm({ operationTypes, activities }) {
  const contentRight = document.getElementById("content_right");
  if (!contentRight) return;

  contentRight.innerHTML = "<p><strong>Операция с Кассой</strong></p>";

  const opTypes = extractList(operationTypes);
  const activityList = extractList(activities);

  createNewChoice(opTypes, "OperationType", "Тип операции", "budgetFieldChanged", "content_right");
  createNewChoice(activityList, "activityCashRegister", "Статья расходов", "budgetFieldChanged", "content_right");
  createNewInput("CashSum", "Сумма " + "(" + CONFIG.currency + ")", "", "budgetFieldChanged", "content_right");

  let attributes = { id: "Comment", onclick: "" };
  createElement("textarea", "", attributes, contentRight);

  attributes = { id: "submitButton", class: "button-24", onclick: "sendDataToCashRegister()" };
  createElement("button", "Отправить", attributes, contentRight);

  // Best-effort defaults (won't crash if options differ)
  try {
    if (document.getElementById("OperationType")) {
      document.getElementById("OperationType").value = "Расход";
    }
    if (document.getElementById("activityCashRegister")) {
      document.getElementById("activityCashRegister").value = "Инкассация";
    }
  } catch (_) {}
}

async function returnVocabulary(data){
  try {
    const parsed = parseMaybeJson(data);

    // 1) Apps Script style: matrix with header row
    const matrixVocabulary = extractMatrixVocabulary(parsed);
    if (matrixVocabulary) {
      renderCashRegisterForm({
        operationTypes: matrixVocabulary["Тип операции"] || matrixVocabulary["Тип"] || ["Расход", "Приход"],
        activities: matrixVocabulary["activityCashRegister"] || matrixVocabulary["Статья расходов"] || [],
      });
      return;
    }

    // 2) n8n sklad-like: [{ field: [...] }] or { field: [...] }
    const firstObject =
      (Array.isArray(parsed) && parsed.length > 0 && parsed[0] && typeof parsed[0] === "object" ? parsed[0] : null) ||
      (parsed && typeof parsed === "object" ? parsed : null);
    if (firstObject) {
      const operationTypes = firstObject["Тип операции"] || firstObject["Тип"];
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
	    console.log("res",res)
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
	
	    // If server returned array of objects, normalize to matrix.
	    if (Array.isArray(rows) && rows.length > 0 && rows.every((r) => r && typeof r === "object" && !Array.isArray(r))) {
	      const preferredOrder = [
	        "Дата",
	        "Время",
	        "Тип",
	        "Сумма",
	        "Статья расходов",
	        "Комментарий",
	        "username",
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
const operationType = document.getElementById("OperationType");
if (operationType) operationType.value = "Расход";

const activity = document.getElementById("activityCashRegister");
if (activity) activity.value = "Инкассация";

const comment = document.getElementById("Comment");
if (comment) comment.value = "";

const cashSum = document.getElementById("CashSum");
if (cashSum) cashSum.value = "";


}


function sendDataToCashRegister(){
const BUDGETNAME="BUTTON ROUGE"


var budgetRecord={}
budgetRecord["Дата"]=getCurrentDate()
budgetRecord["Время"]=getCurrentTime()
budgetRecord["Бюджет"]=BUDGETNAME
budgetRecord["Вид"]="Факт"

budgetRecord["Тип"]=document.getElementById("OperationType").value
budgetRecord["Статья расходов"]=document.getElementById("activityCashRegister").value
budgetRecord["username"]=username
budgetRecord["PaymentCashRegister"]="Касса"
budgetRecord["Комментарий"]=document.getElementById("Comment").value
budgetRecord["Сумма"]=document.getElementById("CashSum").value
budgetRecord["countInBudget"]=0,
budgetRecord["countInBudget"]=storeName




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
  		params: JSON.stringify(budgetRecord)
  	};
  	runGSfunction(request); 



}

function dataRegistredToCashRegister(result){
  const parsed = parseMaybeJson(result);
  const ok =
    parsed === true ||
    parsed === 1 ||
    parsed?.ok === true ||
    parsed?.success === true ||
    parsed?.result === true;

  if (ok) {
    showInformationalPopup(CONFIG.cashRegistred);
    cllearCashRegisterData();
    getBudgetData();
    getCashRegisterRecords();
    return;
  }

  showErrorPopup(CONFIG.errorwritingcash);
}





function returnCash(data){
  console.log("data_for_cards", data);

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
