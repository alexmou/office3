




function createPieChart(){



  const pieChart=document.createElement("div")
  pieChart.id="PieChart" 
   pieChart.className = "chart";
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



function drawChart_Pie(salesData) {

  console.log(salesData)
    google.charts.load("current", {packages:["corechart"]});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable(salesData);
      const options = {
        title: "Статистика по продажам",
        is3D: true,
        width: '100%',
        chartArea: { width: "94%", height: "94%" }, // Увеличиваем область диаграммы
        legend: { position: "right" }, // Уменьшаем влияние легенды
    };

        var chart = new google.visualization.PieChart(document.getElementById('PieChart'));
        chart.draw(data, options);
      }
}






//-----------------------------------------------------------------------------------------






function setPivotData(data){

  console.log(data)
  //drawChart_Pie_AllSalesData(salesData)
  //drawPChart_Bar_AllSalesData(salesData)
  displayStatistics(data)
}








function drawPChart_Bar_AllSalesData(salesData) {


  // Создаем контейнер для графика
    const chartCard = document.createElement("div");

    chartCard.className = "card chart-card";
    chartCard.innerHTML = `
        <h3>Salary per month</h3>
        <div id="chart_div" style="width: 100%; height: 500px;"></div>
    `;
    dashboard.appendChild(chartCard);
  console.log("salesData",salesData)
        google.charts.load('current', {'packages':['bar']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['Year', 'Sales', 'Expenses', 'Profit'],
          ['2014', 1000, 400, 200],
          ['2015', 1170, 460, 250],
          ['2016', 660, 1120, 300],
          ['2017', 1030, 540, 350]
        ]);

        var options = {
          chart: {
            title: 'Company Performance',
            subtitle: 'Sales, Expenses, and Profit: 2014-2017',
            width: 550*2,
          height: 400*2
          }
        };

        var chart = new google.charts.Bar(document.getElementById('columnchart_material'));

        chart.draw(data, google.charts.Bar.convertOptions(options));
      }
}











function displayStatistics(data) {
    const dashboard = document.getElementById("dashboard");
    dashboard.innerHTML = ""; // Очищаем текущий контент


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

    // Создаем контейнер для графика
    const chartCard = document.createElement("div");
    chartCard.className = "card chart-card";
    chartCard.innerHTML = `
        <h3>Salary per month</h3>
        <div id="chart_div" style="width: 100%; height: 500px;"></div>
    `;
    dashboard.appendChild(chartCard);

    // Загружаем Google Charts
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(drawChart);

 function drawChart() {
        // Преобразуем объект данных в массив для Google Charts
        const chartData = [["Brand", "Net Price", "Sclad Price", "Final Price VND"]];
        for (const brand in data) {
            const { netprice, scladprice, finalpriceVND } = data[brand];
            chartData.push([
                brand || "Unknown", // Если бренд пустой, заменяем на "Unknown"
                netprice,
                scladprice,
                finalpriceVND,
            ]);
        }

        const dataTable = google.visualization.arrayToDataTable(chartData);

        const options = {
            title: "Brand Statistics",
            hAxis: { title: "Brand", titleTextStyle: { color: "#333" } },
            vAxis: { title: "Value", minValue: 0 },
            legend: { position: "top", alignment: "center" },
            chartArea: { width: "70%", height: "70%" },
        };

        const chart = new google.visualization.ColumnChart(document.getElementById("chart_div"));
        chart.draw(dataTable, options);
    }
}





function drawChart_Timeline(rawData){
google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawChart);

function drawChart(rawData) {


    // Преобразование в DataTable
    const data = google.visualization.arrayToDataTable(rawData);

    // Опции графика
    const options = {
        title: "Статистика продаж по времени",
        hAxis: {
            title: "Время",
            format: "HH:mm", // Формат времени
        },
        vAxis: {
            title: "Продажи (VND)",
            minValue: 0,
        },
        legend: "none",
        pointSize: 5, // Размер точек на графике
        chartArea: { width: "80%", height: "70%" },
    };

    // Рендеринг графика
    const chart = new google.visualization.ScatterChart(document.getElementById("PieChart"));
    chart.draw(data, options);
}
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




        
function generateMainTabContent() {
    // Находим элемент MainTab
    const tabPane = document.getElementById("MainTab");

    // Создаём левую часть контента
    const contentLeft = document.createElement("div");
    contentLeft.id = "content_left";
    contentLeft.className = "split_left";

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
    statisticsContainer.innerHTML = "<!-- Здесь будет отображаться статистика -->";

    contentLeft.appendChild(chartsBlock);
    contentLeft.appendChild(statisticsContainer);

    // Создаём правую часть контента
    const contentRight = document.createElement("div");
    contentRight.id = "content_right";
    contentRight.className = "split_right";

    const dashboard = document.createElement("div");
    dashboard.id = "dashboard";
    dashboard.className = "dashboard";

    const columnChart = document.createElement("div");
    columnChart.className = "chart";
    columnChart.id = "columnchart_material";
    columnChart.style.width = "300px";
    columnChart.style.height = "300px";

    const chartDiv = document.createElement("div");
    chartDiv.id = "chart_div";
    chartDiv.style.width = "100%";
    chartDiv.style.height = "1000px";

    contentRight.appendChild(dashboard);
    contentRight.appendChild(columnChart);
    contentRight.appendChild(chartDiv);

    tabPane.appendChild(contentLeft);
    tabPane.appendChild(contentRight);
}









