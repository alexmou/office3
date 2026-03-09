




  const brand = "BUTTON ROUGE";
    const METRICS= ["Brand","Name", "производитель","manufacturer","type",	"subtype", "month", "weekday", "time", "currency", "salary", "username", "paymentmethod"]
    const METRICS_VALUE=["finalPriceVND","price", "Количество", "Quantity" ]

function joinTwoTables(inventory, sales){

/*
const inventory = [
  // {article: ..., color: ..., size: ...}, ...
];

const sales = [
  // {article: ...}, ...
];
*/
// Создаем словарь для быстрого поиска по article:
const inventoryMap = {};
for (const item of inventory) {
  inventoryMap[item.article] = { color: item.color, size: item.size };
}

// Обогащаем данные в sales
for (const sale of sales) {
  const match = inventoryMap[sale.article];
  if (match) {
    sale.color = match.color;
    sale.size = match.size;
  } else {
    sale.color = '';
    sale.size = '';
  }
}
return sales

}






function setMainTabContent(){
var src='https://docs.google.com/spreadsheets/d/1RIpCfjXMj1PTsOW_xoRZnc9zPQeWBZQbRuNBFUBBqk4/htmlembed?gid=65378389#gid=65378389&amp;single=true&amp;widget=true&amp;headers=false&amp;chrome=false'
loadIframeChart("MainTab", "bigCard", src)
}


function setSalesTabContent(){
var src='https://docs.google.com/spreadsheets/d/1RIpCfjXMj1PTsOW_xoRZnc9zPQeWBZQbRuNBFUBBqk4/htmlembed?gid=1950468990#gid=1950468990&amp;single=true&amp;widget=true&amp;headers=false&amp;chrome=false'
loadIframeChart("SalesTab", "bigCard", src)
}


registerPageInit("statistic", initStatisticPage);

function initStatisticPage() {


const tabButtons = [
    { id: "MainTab", text: "Main", active: true, content: `<p></p>` },
    { id: "SalesTab", text: "Sales", content: `<p></p>` },
    { id: "IncomeTab", text: "Income", content: `<p>This is the Loans content.</p>` },
    { id: "AnalyticsTab", text: "Analytics", content: `<p>This is the Deposits content.</p>` },
];



createTabs(tabButtons);

setMainTabContent()
setSalesTabContent()


//generateMainTabContent();
//getDistinctBrandNames()




//generateSaleTabContent()
//requestSalesData()
//const choices=createChoice()
//getAllSalesStatistic(choices.key, choices.value )
//createPieChart()




}


async function getDistinctBrandNames(){
   let request = {
      googleFuncName: "getDistinctBrandNames",
      callbackJSfunctionName: "setBrandList",
      params: ""
    }
    runGSfunction(request)

    }


function setBrandList(brandList){

const brands = brandList.map(item => item.Brand);

brands.unshift("ВСЕ БРЕНДЫ")
createNewChoice(brands,"BrandName", "Brand", "brandNameChanged", "content_left") 


}

function brandNameChanged(a){
  var res=a.value
  if (a.value=="Все бренды") {res=""}
  if (a.value=="") {res="Unknown Brand"}

   let request = {
      googleFuncName: "setStatisticBrandName",
      callbackJSfunctionName: "updateCharts",
      params: res
    }
    runGSfunction(request)

}

function updateCharts(){
  hidePage('updateIframe') 
setTimeout(() => {

var iframe= document.getElementById('mainIframe')
if (iframe) {content_right.innerHTML=""}


var src='https://docs.google.com/spreadsheets/d/1RIpCfjXMj1PTsOW_xoRZnc9zPQeWBZQbRuNBFUBBqk4/htmlembed/sheet?gid=1950468990#gid=1950468990&amp;rnd='+ Date.now()
//loadIframeChart("SalesTab", "bigCard", src)
showPage('updateIframe') 

}, 1000);
 

}

function generateSaleTabContent(){


let chartsSRC = [];
const iframeHost='https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid='
chartsSRC =[

   '<iframe width="2053" height="453" seamless frameborder="0" scrolling="no" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=862151157&amp;format=interactive"></iframe>',

'<iframe width="513" height="329" seamless frameborder="0" scrolling="no" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=647518379&amp;format=interactive"></iframe>',

   '<iframe width="513" height="329" seamless frameborder="0" scrolling="no" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=1243010501&amp;format=interactive"></iframe>',
   
   '<iframe width="513" height="329" seamless frameborder="0" scrolling="no" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=61031453&amp;format=interactive"></iframe>',
   '<iframe width="513" height="329" seamless frameborder="0" scrolling="no" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=142105980&amp;format=interactive"></iframe>',
   '<iframe width="513" height="329" seamless frameborder="0" scrolling="no" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=1626613093&amp;format=interactive"></iframe>',

   '<iframe width="513" height="329" seamless frameborder="0" scrolling="no" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=1913692248&amp;format=interactive"></iframe>',
   '<iframe width="513" height="329" seamless frameborder="0" scrolling="no" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=827615446&amp;format=interactive"></iframe>',

]



chartsSRC =[

   'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=288496837&amp;format=interactive&large=1',

'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=236362233&amp;format=interactive',

   'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=1795150830&amp;format=interactive',
   
   'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=422562555&amp;format=interactive',
   'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=142105980&amp;format=interactive',
   'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=1006631410&amp;format=interactive',

   'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=847393546&amp;format=interactive',
   'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=53049650&amp;format=interactive',

'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=334689344&amp;format=interactive',

'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=15303482&amp;format=interactive',

'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=43531957&amp;format=interactive',

'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=993090702&amp;format=interactive'

]


for (let i = 0; i < chartsSRC.length; i++) {
   // loadIframeChart("SalesTab", "card",chartsSRC[i]);
}


}


        
function generateMainTabContent() {
    // Находим элемент MainTab
    const tabPane = document.getElementById("MainTab");

    // Создаём левую часть контента
    const contentLeft = document.createElement("div");
    contentLeft.id = "content_left";
    contentLeft.className = "split_left";
    contentLeft.width="10%"

    const chartsBlock = document.createElement("div");
    chartsBlock.id = "charts_block";
    chartsBlock.className = "charts_block";

    const choices = document.createElement("div");
    choices.id = "choices";

    const charts = document.createElement("div");
    charts.id = "charts";

    chartsBlock.appendChild(choices);
    chartsBlock.appendChild(charts);

    const statisticsContainer = document.createElement("div");
    statisticsContainer.id = "statistics-container";

    contentLeft.appendChild(chartsBlock);
    contentLeft.appendChild(statisticsContainer);

    // Создаём правую часть контента
    const contentRight = document.createElement("div");
    contentRight.id = "content_right";
    contentRight.className = "split_right";

   // contentRight.setAttribute("style","left=300px") 

    const dashboard = document.createElement("div");
    dashboard.id = "dashboard";
    dashboard.className = "dashboard";

    




    /*
    const columnChart = document.createElement("div");
    columnChart.className = "SalesTab-chart";
    columnChart.id = "columnchart_material";
    columnChart.style.width = "300px";
    columnChart.style.height = "300px";



    const chartDiv = document.createElement("div");
    chartDiv.id = "chart_div";
    chartDiv.style.width = "100%";
    chartDiv.style.height = "1000px";
*/
    contentRight.appendChild(dashboard);
    //contentRight.appendChild(columnChart);
    //contentRight.appendChild(chartDiv);

    tabPane.appendChild(contentLeft);
    tabPane.appendChild(contentRight);

   // const salesTodaySrc='https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=1155066416&amp;format=interactive'
     

    //loadIframeChart("dashboard", "card sticker", salesTodaySrc)
 //const salesAllTime='https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubchart?oid=2038619891&amp;format=interactive'
   //loadIframeChart("dashboard", "card sticker", salesAllTime)

//<iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdA8ras1clOvah6I5IQP-8xkDSj_tPi-b9v1N0XxzxEWxeB56Z2xdNK-74Cirn8uAe6OtuGyISROQA/pubhtml?gid=1950468990&amp;single=true&amp;widget=true&amp;headers=false"></iframe>


const salesByTime='https://docs.google.com/spreadsheets/d/1RIpCfjXMj1PTsOW_xoRZnc9zPQeWBZQbRuNBFUBBqk4/htmlembed/sheet?gid=1950468990#gid=1950468990&amp;rnd='+ Date.now()
//loadIframeChart("content_right", "bigCard", salesByTime)
}


function createPieChart(){



  const pieChart=document.createElement("div")
  pieChart.id="PieChart" 
   pieChart.className = "SalesTab-chart";
   var chart_width="550px"
  pieChart.setAttribute(
    "style",
    'width: ' + chart_width + 'px; height: 500px; padding-top: 20px; max-width: ' + chart_width + 'px; min-width: ' + chart_width + 'px;'
);

     pieChart.setAttribute("width",chart_width)
   document.getElementById("charts").appendChild(pieChart)
}





 function requestSalesData(options){
   let request = {
	googleFuncName: "getPivot",
	callbackJSfunctionName: "setPivotData",
	params: options
}
runGSfunction(request)
}



 function getAllSalesStatistic(key,value){
  var options={}
  options[key]=value
   let request = {
	googleFuncName: "getAllSalesStatistic",
	callbackJSfunctionName: "analyzeData",
	params: options
}
runGSfunction(request)
}





//-----------------------------------------------------------------------------------------






function setPivotData(data){
 // drawChart_Pie_AllSalesData(salesData)
  //drawPChart_Bar_AllSalesData(data)
  displayStatistics(data)
    //  drawBarChart(data)
}






function displayStatistics(data) {
    const dashboard = document.getElementById("dashboard");
   // dashboard.innerHTML = ""; // Очищаем текущий контент


    const formattedDate = "";
    const month = "";
    const year = "";

    const scladprice = data[brand]?.scladprice || "0,00";
    const netprice = data[brand]?.netprice || "0,00";
    const finalPriceVND = data[brand]?.finalpriceVND || "0,00";

    // Создаем карточки
    const cards = [
        {
            title: `Сумма товара на складе <span class="styled-box">${formattedDate} </span>`,
            value: toLocaleStringCorrect(scladprice),
            label: scladprice !== "0,00" ? CONFIG.currency : "",
            class: scladprice === "0,00" ? "red" : "green",
        },
        {
            title: `Суммарная себестоимость <span class="styled-box">${month} </span>`,
            value: toLocaleStringCorrect(netprice),
            label: CONFIG.currency,
            class: "green",
        },
        {
            title: `Продажи за все время на сумму <span class="styled-box">${year} </span>`,
            value: toLocaleStringCorrect(finalPriceVND),
            label: CONFIG.currency,
            class: "green",
        },
    ];

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


}




function keyChanged(el){
  var key=document.getElementById("keyChoice").value
  var value=document.getElementById("valueChoice").value
  getAllSalesStatistic(key,value)

}

function createChoice(){
  var parentID="choices"
  var action="keyChanged"
  var keyEl=createNewChoice(METRICS, "keyChoice", "Key", action, parentID)
  var valueEl=createNewChoice(METRICS_VALUE, "valueChoice", "Value", action, parentID)
  const ch={}
  ch.key=keyEl.value
  ch.value=valueEl.value
  return (ch)

}


function drawBarChart(data) {
    const chartDrawer = new ChartDrawer();

    const chartData = [["Brand", "Net Price", "Sclad Price", "Final Price VND"]];
    for (const brand in data) {
        const { netprice, scladprice, finalpriceVND } = data[brand];
        chartData.push([
            brand || "Unknown",
            netprice,
            scladprice,
            finalpriceVND,
        ]);
    }

    const specificOptions = {
        title: "Brand Statistics",
        hAxis: { title: "Brand", titleTextStyle: { color: "#333" } },
        vAxis: { title: "Value", minValue: 0 },
        legend: { position: "top", alignment: "center" },
    };

    chartDrawer.drawChart("ColumnChart", "chart_div", chartData, specificOptions);
}


function drawChart_Timeline(rawData) {
    const chartDrawer = new ChartDrawer();

    const specificOptions = {
        title: "Статистика продаж по времени",
        hAxis: {
            title: "Время",
            format: "HH:mm",
        },
        vAxis: {
            title: "Продажи (VND)",
            minValue: 0,
        },
        legend: "none",
        pointSize: 5,
    };

    chartDrawer.drawChart("ScatterChart", "PieChart", rawData, specificOptions);
}




function drawChart_Pie(salesData) {
    const chartDrawer = new ChartDrawer();

    const specificOptions = {
        title: "Статистика по продажам",
    };

    chartDrawer.drawChart("PieChart", "PieChart", salesData, specificOptions);
}



function drawPChart_Bar_AllSalesData(salesData) {
    const chartDrawer = new ChartDrawer();

    const specificOptions = {
        title: "Population of Largest U.S. Cities",
        chartArea: { width: "50%" },
        isStacked: true,
        backgroundColor: { fill: "black" },

        hAxis: { title: "Total Population", minValue: 0 },
        vAxis: { title: "City" },
    };

    chartDrawer.drawChart("BarChart", "columnchart_material", salesData, specificOptions, true);
}





function analyzeData(data) {
    // Проверяем заголовки
    const header = data[0];

    if (header.includes("weekday")) {
        // Обработка дней недели
        const daysOfWeek = [
            "", // Пустой, так как дни недели начинаются с 1
            "Понедельник",
            "Вторник",
            "Среда",
            "Четверг",
            "Пятница",
            "Суббота",
            "Воскресенье",
        ];

        // Преобразуем данные, заменяя номера дней на их названия
        const transformedData = data.map((row, index) => {
            if (index === 0) {
                // Заголовок остаётся неизменным
                return row;
            }
            // Преобразуем числовой день недели в название
            const dayName = daysOfWeek[parseInt(row[0])];
            return [dayName, row[1]];
        });

        // Вызываем функцию для построения графика
        drawChart_Pie(transformedData);
    } else if (header.includes("time")) {
        // Обработка данных времени
        const transformedData = data.map((row, index) => {
            if (index === 0) {
                // Заголовок остаётся неизменным
                return row;
            }
            // Преобразуем время в объект Date
            const timeParts = row[0].split(":"); // Разделяем часы, минуты, секунды
            const date = new Date(1970, 0, 1, timeParts[0], timeParts[1], timeParts[2]);
            return [date, row[1]];
        });

        // Вызываем функцию для построения временного графика
        drawChart_Timeline(transformedData);
    } else {
        // По умолчанию, строим круговую диаграмму
        drawChart_Pie(data);
    }
}




function loadIframeChart(parentTabID, className, src) {
    const container = document.getElementById(parentTabID);
    if (!container) {
        console.error("Element with ID" +parentTabID+" not found.");
        return;
    }
   

    const chart = document.createElement("div");
    const iframeWrapper = document.createElement("div");
   iframeWrapper.className=" iframe-wrapper"
    if(className==""){
      chart.className = parentTabID+"-chart";
    }else{
      chart.className=className
    }


var match = src.match(/[?&]large=([^&]+)/);

// Если параметр найден, выводим его значение, если нет, выводим "не найдено"
if (match) {
  var largeValue = match[1];
  if(largeValue==1){
chart.setAttribute("style",'min-width: -webkit-fill-available; height: 500px;')
  }
} else {
  console.log("Параметр 'large' не найден");
}


      chart.appendChild(iframeWrapper);
     iframeWrapper.innerHTML = '<iframe id="mainIframe" class="card-iframe" width="100%" height="100%" seamless frameborder="0" scrolling="no"  src="' +src +'" </iframe>'
    container.appendChild(chart); // Добавляем созданный элемент в контейнер



}






}








