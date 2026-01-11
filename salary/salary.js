



  //https://codepen.io/suriyag/pen/jOyxjO

var salaryData
registerPageInit("salary", bodyOnLoad);
function bodyOnLoad() {
	let request = {
  		googleFuncName: "getMySalary",
  		callbackJSfunctionName: "getMySalary",
  		params: username
  	};
  	runGSfunction(request); 





}


function createDataPicker(eventDates){

    // Инициализация Datepicker
    $('#datepicker').datepicker({
        dateFormat: 'dd.mm.yy',
        beforeShowDay: function(date) {
            // Преобразуем дату в формат 'dd.mm.yy'
            const formattedDate = $.datepicker.formatDate('dd.mm.yy', date);
            if (eventDates[formattedDate]) {
                return [true, 'ui-state-highlight', 'This is an event date']; // Добавляем класс и подсказку
            } else {
                return [true, '', '']; // Без изменений
            }
        }
    });

    // Обработка изменения даты
    $('#datepicker').change(function() {
        const startDate = $(this).datepicker('getDate'); // Получаем дату

        if (startDate) {
            const formattedDate = $.datepicker.formatDate('dd.mm.yy', startDate); // Форматируем дату
            displayStatistics(formattedDate); // Вызов вашей функции
        } else {
            alert("Пожалуйста, выберите дату");
        }
    });



}











function getMySalary(res){
    console.log("jjjjjjjjjjjjjjjjj")
  console.log(res)
salaryData=res

const eventDates = Object.keys(salaryData.days).reduce((acc, date) => {
    acc[date] = true;
    return acc;
}, {});
createDataPicker(eventDates)



    // Отображаем статистику за текущую дату при загрузке страницы
    const today = new Date().toISOString().split("T")[0]; // Формат YYYY-MM-DD
    const rightFormatData = today.split("-").reverse().join(".");
    displayStatistics(rightFormatData);

}





       // Функция для отображения статистики
    function displayStatistics(currentDate) {
          const dashboard = document.getElementById("dashboard");
      console.log("rightFormatData",currentDate)
        dashboard.innerHTML = ""; // Очищаем текущий контент

        // Преобразуем дату в формат DD.MM.YYYY
        const formattedDate = currentDate

        // Проверяем данные за день
        const daySalary = salaryData.days[formattedDate] || "0,00";

        // Проверяем месяц и год
        const year = currentDate.split(".")[2];
        
        const month = parseInt(currentDate.split(".")[1], 10)
        const monthSalary = salaryData.months[month] || "0,00";
        const yearSalary = salaryData.years[year] || "0,00";

        // Создаем карточки
        const cards = [
            {
                title: `Salary for <span class="styled-box">${formattedDate} </span>`,
                value: daySalary !== "0,00" ? daySalary : "No salary for this date",
                label: daySalary !== "0,00" ? CONFIG.currency : "",
                class: daySalary === "0,00" ? "red" : "green", // Красный, если зарплаты не было
            },
            {
                title: `Salary for Month <span class="styled-box">${month} </span>`,
                value: monthSalary,
                label: CONFIG.currency,
                class: "green",
            },
            {
                title: `Salary for Year <span class="styled-box">${year} </span>`,
                value: yearSalary,
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

        // Добавление графика (грейды остаются статичными в данном примере)
        const chartCard = document.createElement("div");
        chartCard.className = "card chart-card";
        chartCard.innerHTML = `
            <h3>Salary per month</h3>
            <canvas id="grade-salary-chart"></canvas>
        `;
        dashboard.appendChild(chartCard);

        // Отрисовка графика
        const ctx = document.getElementById("grade-salary-chart").getContext("2d");




const gradeWiseData = {
    labels: Object.keys(salaryData.months).map((month) => `Month ${month}`), // Генерируем метки для месяцев
    data: Object.values(salaryData.months).map((value) => {
        const cleanedValue = value.replace(/\s/g, "").replace(/,/g, "."); // Убираем пробелы и заменяем запятые на точки
        return isNaN(cleanedValue) ? 0 : Number(cleanedValue); // Преобразуем в число или возвращаем 0
    }),
};

new Chart(ctx, {
    type: "bar",
    data: {
        labels: gradeWiseData.labels, // Добавляем метки
        datasets: [
            {
                label: "Salary "+ CONFIG.currency,
                data: gradeWiseData.data, // Добавляем данные
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString("en-US") +" "+ CONFIG.currency; // Форматируем числа
                    },
                },
            },
        },
    },
});


    }





bodyOnLoad()










