



  //https://codepen.io/suriyag/pen/jOyxjO

var salaryData

if (typeof registerPageInit === "function") {
  registerPageInit("salary", bodyOnLoad);
} else {
  window.addEventListener("DOMContentLoaded", bodyOnLoad);
}

function bodyOnLoad() {
  const resolvedUsername = String(
    document.getElementById("username")?.textContent ||
    window.currentLoginName ||
    window.username ||
    (typeof username !== "undefined" ? username : "")
  ).trim();

  if (!resolvedUsername) {
    const msg =
      typeof window.localizeUiText === "function"
        ? window.localizeUiText("Не удалось определить пользователя для расчёта зарплаты", "Не удалось определить пользователя для расчёта зарплаты")
        : "Не удалось определить пользователя для расчёта зарплаты";
    showErrorPopup(msg);
    return;
  }

	let request = {
  		googleFuncName: "getMySalary",
  		callbackJSfunctionName: "getMySalary",
  		params: { username: resolvedUsername, value: resolvedUsername }
   	};
  	runGSfunction(request); 





}

function parseNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const s = String(value).trim().replace(/\s+/g, "").replace(",", ".");
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function normalizeDateKey(rawDate) {
  if (!rawDate) return null;
  const s = String(rawDate).trim();
  if (!s) return null;
  // DD.MM.YYYY
  const m1 = s.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (m1) return `${m1[1]}.${m1[2]}.${m1[3]}`;
  // YYYY-MM-DD
  const m2 = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return `${m2[3]}.${m2[2]}.${m2[1]}`;
  // DD/MM/YYYY
  const m3 = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (m3) return `${m3[1]}.${m3[2]}.${m3[3]}`;
  return null;
}

function unwrapSalaryPayload(raw, depth = 0) {
  if (depth > 6) return raw;
  let val = raw;
  if (typeof val === "string") {
    try { val = JSON.parse(val); } catch (_) { return raw; }
  }
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") {
    if (val.days || val.months || val.years) return val;
    if (val.data !== undefined) return unwrapSalaryPayload(val.data, depth + 1);
    if (val.result !== undefined) return unwrapSalaryPayload(val.result, depth + 1);
    if (val.payload !== undefined) return unwrapSalaryPayload(val.payload, depth + 1);
  }
  return val;
}

function normalizeSalaryResponse(raw) {
  const payload = unwrapSalaryPayload(raw);

  // Новый формат: массив операций/продаж с полем date + salary
  if (Array.isArray(payload)) {
    const days = {};
    const months = {};
    const years = {};
    payload.forEach((item) => {
      if (!item) return;
      const dateKey = normalizeDateKey(item.date || item.day || item.createdAt || item.datetime);
      if (!dateKey) return;
      const salary = parseNumber(item.salary ?? item.amount ?? item.value ?? 0);
      days[dateKey] = (days[dateKey] || 0) + salary;
      const [dd, mm, yyyy] = dateKey.split(".");
      const monthKey = String(parseInt(mm, 10));
      months[monthKey] = (months[monthKey] || 0) + salary;
      years[yyyy] = (years[yyyy] || 0) + salary;
    });
    return { days, months, years, entries: payload };
  }

  // Старый формат: уже агрегированные данные
  if (payload && typeof payload === "object") {
    const days = {};
    const months = {};
    const years = {};
    Object.entries(payload.days || {}).forEach(([k, v]) => {
      const key = normalizeDateKey(k) || k;
      if (key) days[key] = parseNumber(v);
    });
    Object.entries(payload.months || {}).forEach(([k, v]) => {
      const mk = String(parseInt(k, 10));
      if (mk !== "NaN") months[mk] = parseNumber(v);
    });
    Object.entries(payload.years || {}).forEach(([k, v]) => {
      const yk = String(parseInt(k, 10));
      if (yk !== "NaN") years[yk] = parseNumber(v);
    });
    return { days, months, years, entries: payload.entries || [] };
  }

  return { days: {}, months: {}, years: {}, entries: [] };
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
salaryData = normalizeSalaryResponse(res)

const eventDates = Object.keys(salaryData.days || {}).reduce((acc, date) => {
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
        const daySalaryNum = parseNumber(salaryData.days?.[formattedDate] || 0);
        const daySalary = formatMoney(daySalaryNum);

        // Проверяем месяц и год
        const year = currentDate.split(".")[2];
        
        const month = parseInt(currentDate.split(".")[1], 10)
        const monthSalary = formatMoney(parseNumber(salaryData.months?.[month] || 0));
        const yearSalary = formatMoney(parseNumber(salaryData.years?.[year] || 0));

        // Создаем карточки
        const cards = [
            {
                title: `Salary for <span class="styled-box">${formattedDate} </span>`,
                value: daySalaryNum !== 0 ? daySalary : "No salary for this date",
                label: daySalaryNum !== 0 ? CONFIG.currency : "",
                class: daySalaryNum === 0 ? "red" : "green", // Красный, если зарплаты не было
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




const monthKeys = Object.keys(salaryData.months || {}).sort((a, b) => Number(a) - Number(b));
const gradeWiseData = {
    labels: monthKeys.map((month) => `Month ${month}`), // Генерируем метки для месяцев
    data: monthKeys.map((month) => parseNumber(salaryData.months?.[month] || 0)),
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


    renderSalaryDetails(formattedDate);

    }

function renderSalaryDetails(formattedDate) {
  const container = document.getElementById("statistics-container");
  if (!container) return;
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "carddetails";
  card.innerHTML = `
        <h3>Details for <span class="styled-box">${formattedDate}</span></h3>
      `;

  const entries = Array.isArray(salaryData?.entries) ? salaryData.entries : [];
  const normalizedSelected = normalizeDateKey(formattedDate) || formattedDate;
  const rows = entries.filter((e) => (normalizeDateKey(e?.date) || e?.date) === normalizedSelected);

  if (!rows.length) {
    const p = document.createElement("p");
    p.textContent = "No data for this date";
    card.appendChild(p);
    container.appendChild(card);
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "details-table-wrap";

  const table = document.createElement("table");
  table.className = "details-table";
  table.innerHTML = `
        <thead>
          <tr>
            <th>time</th>
            <th>article</th>
            <th>Brand</th>
            <th>Name</th>
            <th class="num">salary</th>
            <th>paymentmethod</th>
            <th>description</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

  const tbody = table.querySelector("tbody");
  rows.forEach((item) => {
    const tr = document.createElement("tr");
    const salary = formatMoney(parseNumber(item?.salary ?? 0));

    const cells = [
      String(item?.time ?? ""),
      String(item?.article ?? ""),
      String(item?.Brand ?? ""),
      String(item?.Name ?? ""),
      salary,
      String(item?.paymentmethod ?? ""),
      String(item?.description ?? ""),
    ];
    cells.forEach((value, idx) => {
      const td = document.createElement("td");
      if (idx === 4) td.className = "num";
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  wrap.appendChild(table);
  card.appendChild(wrap);
  container.appendChild(card);
}
