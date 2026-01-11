



registerPageInit("cashregister", bodyOnLoad);
function bodyOnLoad() {


getVocabulary()
getBudgetData()
getCashRegisterRecords()



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

function returnVocabulary(data){


// Преобразование в объект
const headers = data[0]; // Первая строка как названия атрибутов
const rows = data.slice(1); // Остальные строки — данные

// Создаём объект, где ключи — атрибуты, а значения — массивы значений
const result = headers.reduce((acc, header, colIndex) => {
  acc[header] = rows
    .map(row => row[colIndex]) // Берём значения для текущего столбца
    .filter(value => value !== undefined && value !== ""); // Убираем пустые и неопределённые значения
  return acc;
}, {});


createNewChoice(result["Тип операции"],"OperationType", "Тип операции", "budgetFieldChanged", "content_right") 
createNewChoice(result["activityCashRegister"], "activityCashRegister", "Статья расходов", "budgetFieldChanged", "content_right") 
createNewInput("CashSum", "Сумма "+ "("+CONFIG.currency+")", "", "budgetFieldChanged", "content_right") 
//createNewInput("Comment", "Комментарий", "", "", "content_right") 

var attributes = {
    id: "Comment",
 //   class: "button-24",
    onclick: ""
};
createElement("textarea", "", attributes, document.getElementById("content_right"));


// Пример использования
attributes = {
    id: "submitButton",
    class: "button-24",
    onclick: "sendDataToCashRegister()"
};

createElement("button", "Отправить", attributes, document.getElementById("content_right"));


//createNewChoice(list, "c", "Бренд>", valueChanged, "content_right") 
//createNewChoice(list, "d", "Бренд>", valueChanged, "content_right") 


}




function returnCashRegisterRecords(res){
  const data=JSON.parse(res)
  const rows=data.data
  const filters=data.filterOptions
   const productTable = new TableLi("product-list");
productTable.initWithPreloadedData(rows)
productTable.setFilterOptions(filters);
productTable.sortByFirstColumn(); 
//colorizeTable()
}


function cllearCashRegisterData() {
document.getElementById("OperationType").value="Расход"
document.getElementById("activityCashRegister").value="Инкассация"
document.getElementById("Comment").value=""
document.getElementById("CashSum").value=""


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
  if(result){
 	showInformationalPopup(CONFIG.cashRegistred)
  cllearCashRegisterData()
  getBudgetData()
  getCashRegisterRecords()
  } else {

 showErrorPopup(CONFIG.errorwritingcash); 

  }
}





function returnCash(data){
  console.log("data_for_cards",data)
  const cardValue1=data
  const cardValue2="Сейчас в кассе"
  const cardValue3="Сейчас в кассе"
  const cardText1="Сейчас в кассе"
  const cardText2="Сейчас в кассе"
  const cardText3="Сейчас в кассе"


   const cards = [
            {
                title: `<span class="styled-box">${cardText1} </span>`,
                value: cardValue1 !== "0,00" ? cardValue1 : "No money in Cash Register",
                label: cardValue1 !== "0,00" ? CONFIG.currency : "",
                class: parseFloat(cardValue1) <= 0 ? "red" : "green", // Красный, если зарплаты не было
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

bodyOnLoad()
