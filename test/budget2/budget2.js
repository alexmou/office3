




const OPERATION_TYPE_FIELD_ID="OperationType"
const OPERATION_VID_FIELD_ID="Vid_Prognoz-Fact"
const ACTIVITY_FIELD_ID="activity"
const SUMM_FIELD_ID="CashSum"
const COMMENT_FIELD_ID="Comment"
const BUDGET_NAME="BUTTON ROUGE"
var BUDGET_TYPE
var ID_COLUMN_INDEX
var VID_COLUMN_INDEX 
var DATE_COLUMN_INDEX
var TIP_COLUMN_INDEX

var VOCABULARY

  (async function() {

  const ARTICLE_DICTIONARY = await window.API.getBudgetVocabulary(
    { action: "getVocabulary", visible: true, mode: "notest" },
    { overlayId: "budget" }
  );

  //console.log("ARTICLE_DICTIONARY",ARTICLE_DICTIONARY)
/* 
     
      [
    "Ведение фирмы","Содержание магазина","Зарплата фикс","Прочее","Возврат","Отшив",
    "Зарплата бухгалтеру","Обслуживание магазина","Налоги","Аренда","Закупка ткани",
    "Закупка товара","Визиран","Маркетинг","Логистика","IT-обслуживание"
  ];

*/
  function formatMonth(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('ru-RU', { year: 'numeric', month: 'long' });
  }
  function formatNumber(amount) {
    const num = Number(amount);
    if (isNaN(num)) return amount;
    return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
function getNumberClass(num) {
  const n = Number(num);
  if (!n) return 'zero';
  return n < 0 ? 'neg' : 'pos';
}

  let budgetData = {};  
  let monthsSummary = {};
  let selectedMonth = null;
  let selectedArticle = null;
  let changedItems = new Map();
  let months = [];

  // ===== Новое: карусель =====
  let carouselInited = false;
  function ensureCarouselShell() {
    const summary = document.getElementById('summary');
    if (!summary) return null;

    // оборачиваем один раз
    if (!carouselInited) {
      const wrap = document.createElement('div');
      wrap.id = 'summary-wrap';
      summary.parentNode.insertBefore(wrap, summary);
      wrap.appendChild(summary);

      // стрелки
      const btnLeft = document.createElement('button');
      btnLeft.className = 'carousel-arrow left';
      btnLeft.setAttribute('aria-label', 'Прокрутить к прошлым');
      btnLeft.textContent = '◀';

      const btnRight = document.createElement('button');
      btnRight.className = 'carousel-arrow right';
      btnRight.setAttribute('aria-label', 'Прокрутить к будущим');
      btnRight.textContent = '▶';

      wrap.append(btnLeft, btnRight);

      // скролл по кнопкам на ширину одной карточки
      const stepByOneCard = (dir) => {
        const first = summary.querySelector('.month-summary');
        if (!first) return;
        const styles = getComputedStyle(summary);
        const gap = parseFloat(styles.gap) || 0;
        const step = first.getBoundingClientRect().width + gap;
        summary.scrollBy({ left: dir * step, behavior: 'smooth' });
      };
      btnLeft.addEventListener('click', () => stepByOneCard(-1));
      btnRight.addEventListener('click', () => stepByOneCard(1));

      // колесо мыши -> горизонтальный скролл
      /*
      summary.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          summary.scrollLeft += e.deltaY;
        }
      }, { passive: false });
*/
      // обновление доступности стрелок
      const updateArrows = () => {
        const maxLeft = summary.scrollWidth - summary.clientWidth - 1;
        btnLeft.disabled  = summary.scrollLeft <= 0;
        btnRight.disabled = summary.scrollLeft >= maxLeft;
      };
      summary.addEventListener('scroll', updateArrows, { passive: true });
      window.addEventListener('resize', updateArrows);
      setTimeout(updateArrows, 0);

      carouselInited = true;
    }

    // 6 карточек в вьюпорте: текущий + 5 справа
    summary.style.setProperty('--per-view', 5);
    return summary;
  }

  function scrollSelectedMonthToLeftEdge() {
    const summary = document.getElementById('summary');
    if (!summary || !selectedMonth) return;
    const el = summary.querySelector(`.month-summary[data-month="${CSS.escape(selectedMonth)}"]`);
    if (!el) return;
    requestAnimationFrame(() => { summary.scrollLeft = el.offsetLeft; });
  }
  // ===== /карусель =====

  async function init() {
        let query
    let params

     query = { action: "getBudgetData", visible: true, mode:"no test" };
     budgetData = await window.API.getBudgetData(query, { overlayId: "budget" });

     query = { action: "getMonthsSummary", visible: true};
     monthsSummary = await window.API.getMonthsSummary(query, { overlayId: "budget" });



    months = Object.keys(monthsSummary);

    const today = new Date();
    let foundCurrent = months.find(m => {
      const md = new Date(m);
      return md.getFullYear() === today.getFullYear() && md.getMonth() === today.getMonth();
    });
    selectedMonth = foundCurrent || months[0];

    populateArticleSelect();
    renderSummary();     // построит карточки
    renderArticles();
    selectMonth(selectedMonth); // и выставит выбранный с проскроллом
    scrollSelectedMonthToLeftEdge();
    enableSaveButton();

  const raw = transformToRaw(monthsSummary);
  const prepared = prepareDatasets(raw);
  renderPnLChart(prepared);

  }

  function calculateMonthlySummary(month) {
    const data = budgetData[month];
    let sumIncome = 0, sumOutcome = 0;
   //   console.log("month",month)
     for (const key in data) {
    const item = data[key];
    const outcome = Number(item.outcome) || 0;

    if (isPastMonth(month)) {
      // прошедшие месяцы → только оплаченные
      if (item.paid) {
        sumOutcome += outcome;
      }
    } else {
      // текущий и будущие месяцы → все
      sumOutcome += outcome;
    }
  }

          sumIncome = Number(monthsSummary[month].income) || 0;
        //  console.log("sumIncome",sumIncome)
    const revenueFact = sumIncome - sumOutcome ;
    const revenueForecast = sumOutcome;
    return { income: sumIncome, outcome: sumOutcome, revenueFact, revenueForecast };
  }


// Хелпер: сортировка ключей-месяцев по возрастанию (YYYY-MM-DD)
function sortMonthsAsc(arr) {
  return [...arr].sort((a, b) => new Date(a) - new Date(b));
}

/**
 * 1) Пересчитать monthsSummary на основе calculateMonthlySummary:
 *    - outcome (факт/прогноз расходов по твоей логике paid/isPastMonth)
 *    - revenueFact (доход - расход)
 *    - profit (накопительная прибыль с начала периода)
 * 2) Отрисовать карточки месяцев в прежнем порядке (с prepend)
 */
function renderSummary() {
  const summaryDiv = document.getElementById('summary');
  summaryDiv.innerHTML = '';

  // 1) считаем в хронологическом порядке
  const monthsAsc = months;
  let cumulativeProfit = 0;

  for (const m of monthsAsc) {
    const sums = calculateMonthlySummary(m);         // { income, outcome, revenueFact }
    if (!monthsSummary[m]) monthsSummary[m] = {};

    const income  = Number(sums.income)       || 0;
    const outcome = Number(sums.outcome)      || 0;
    const profitMonth = Number(sums.revenueFact) || 0; // прибыль месяца = доход - расход

    // обновляем сводку
    monthsSummary[m].income      = income;
    monthsSummary[m].outcome     = outcome;
    monthsSummary[m].revenueFact = profitMonth;  // можно оставить для совместимости
    monthsSummary[m].profitMonth = profitMonth;  // ЯВНО: прибыль месяца

    cumulativeProfit += profitMonth;
    monthsSummary[m].profit = cumulativeProfit;  // ЯВНО: накопительная прибыль
  }

  // 2) рендерим карточки в твоём порядке (prepend)
  months.forEach(m => {
    const div = document.createElement('div');
    const s = monthsSummary[m] || { income: 0, outcome: 0, revenueFact: 0, profit: 0, profitMonth: 0 };

    const total = Math.abs(s.income) + Math.abs(s.outcome) || 1;
    const factPct = Math.round((Math.abs(s.income) / total) * 100);
    const forecastPct = 100 - factPct;

    div.className = 'month-summary' + (m === selectedMonth ? ' selected' : '');
    div.dataset.month = m;
    div.tabIndex = 0;

    div.innerHTML = `
      <div class="ms-head">
        <b>${formatMonth(m)}</b>
      </div>
      <div class="ms-grid">
        <div>Доход:</div>
        <div class="num ${getNumberClass(s.income)}">${formatNumber(s.income)}</div>

        <div>Расход:</div>
        <div class="num ${getNumberClass(s.outcome)}">${formatNumber(s.outcome)}</div>

        <div>Выручка месяца:</div>
        <div class="num ${getNumberClass(s.profitMonth)}">${formatNumber(s.profitMonth)}</div>

        <div>Выручка накопительно:</div>
        <div class="num ${getNumberClass(s.profit)}">${formatNumber(s.profit)}</div>
      </div>

      <div class="ms-bar" id="ms-bar"
           aria-label="Соотношение факт/прогноз"
           title="Факт/Прогноз"
           style="--fact-pct:${factPct}%; --forecast-pct:${forecastPct}%"></div>
    `;

    div.onclick = () => selectMonth(m);
    summaryDiv.appendChild(div);
  });

  ensureCarouselShell();
  return monthsSummary;
}


function renderArticles() {
  const tbody = document.getElementById('articles-tbody');
  tbody.innerHTML = '';
  if (!selectedMonth) return;
  const data = budgetData[selectedMonth];

  for (const articleKey in data) {
    const item = data[articleKey];
    const titleToShow = item.title || articleKey; // <= вот это

    const factVal = Number(item.outcome) || 0;
    const paid = !!item.paid;
    const comment = item.comment;

    const row = document.createElement('tr');
    row.dataset.article = articleKey;

    const artCell = document.createElement('td');
    artCell.style.textAlign = 'left';

    const titleSpan = document.createElement('span');
    titleSpan.textContent = titleToShow;         // <= вот это
    titleSpan.className = 'article-title';

    const badge = document.createElement('span');
    badge.className = 'payment-status ' + (paid ? 'paid' : 'not-paid');
    badge.textContent = paid ? 'Оплачено' : 'Не оплачено';

    artCell.appendChild(titleSpan);
    artCell.appendChild(badge);


    const factCell = document.createElement('td');
    factCell.textContent = formatNumber(factVal);
    factCell.className = getNumberClass(factVal);

    const commentCell = document.createElement('td');
    commentCell.textContent = comment;


    row.appendChild(artCell);
    row.appendChild(factCell);

    row.appendChild(commentCell);

    if (articleKey === selectedArticle) row.classList.add('selected');

    row.onclick = () => {
      selectArticle(articleKey);
      highlightSelectedRow(articleKey);
    };

    tbody.appendChild(row);
  }
}


  function highlightSelectedRow(article) {
    const rows = document.querySelectorAll('#articles tbody tr');
    rows.forEach(row => {
      if (row.dataset.article === article) row.classList.add('selected');
      else row.classList.remove('selected');
    });
  }

  function selectMonth(month) {
    selectedMonth = month;
    selectedArticle = null;
    renderSummary();
    renderArticles();
    populateArticleSelect();
    hideArticleDetail();
    // после перерисовки снова выставляем выбранный месяц левым краем
    //scrollSelectedMonthToLeftEdge();
  }

  function populateArticleSelect() {
    const select = document.getElementById('modal-article-select');
    select.innerHTML = '';
    if (!selectedMonth) return;



    const existingArticles = new Set(Object.keys(budgetData[selectedMonth]));
    ARTICLE_DICTIONARY.forEach(article => {
    //  if (existingArticles.has(article)) return;
      const option = document.createElement('option');
      option.value = article;
      option.textContent = article;
      select.appendChild(option);
    });

    updateModalAddButtonState();
  }

  function updateModalAddButtonState() {
    const select = document.getElementById('modal-article-select');
    const addBtn = document.getElementById('modal-add-btn');
    addBtn.disabled = (select.options.length === 0 || !select.value);
  }

  const modalBackground = document.getElementById('modal-background');
  const modalAddBtn = document.getElementById('modal-add-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalArticleSelect = document.getElementById('modal-article-select');
  const addArticleBtn = document.getElementById('add-article-btn');

  addArticleBtn.addEventListener('click', () => {
    populateArticleSelect();
    modalBackground.style.display = 'flex';
    modalArticleSelect.focus();
  });
  modalCancelBtn.addEventListener('click', () => { modalBackground.style.display = 'none'; });
  modalArticleSelect.addEventListener('change', updateModalAddButtonState);

 modalAddBtn.addEventListener('click', () => {
  const newArticleTitle = modalArticleSelect.value;
  if (!newArticleTitle) return;

  if (!budgetData[selectedMonth]) budgetData[selectedMonth] = {};

  const uniqueKey = makeUniqueKey(selectedMonth, newArticleTitle);

  budgetData[selectedMonth][uniqueKey] = {
    title: newArticleTitle,          // <- человекочитаемое имя
    income: 0,
    outcome: 0,
    editable: true,
    paid: false,
    newArticle: true,
    comment: ""
  };

  changedItems.set(selectedMonth + '|' + uniqueKey, {
    month: selectedMonth,
    article: uniqueKey,              // <- ключ (идентификатор)
    displayTitle: newArticleTitle,   // <- полезно отправлять на бэк
    outcome: 0,
    paid: false,
    newArticle: true,
    comment: ""
  });

  modalBackground.style.display = 'none';
  renderArticles();
  renderSummary();
  populateArticleSelect();
  enableSaveButton();
});


  modalBackground.addEventListener('click', e => {
    if (e.target === modalBackground) modalBackground.style.display = 'none';
  });

  function selectArticle(article) {
    selectedArticle = article;
    highlightSelectedRow(article);

    const detailDiv = document.getElementById('article-detail');
    const data = budgetData[selectedMonth][article];

    document.getElementById('detail-article-name').textContent = article;
    const factInput = document.getElementById('outcome-value');
    const commentField = document.getElementById('commentField');
    
   // const forecastInput = document.getElementById('forecast-value');
    const paidCheckbox = document.getElementById('paid-checkbox');

    factInput.value  = toLocaleStringCorrect(data.outcome);
    commentField.textContent=data.comment

    //forecastInput.value = data.forecast;

    factInput.disabled = !data.editable;
    //forecastInput.disabled = !data.editable;

    paidCheckbox.checked = !!data.paid;
    paidCheckbox.disabled = !data.editable;

    detailDiv.style.display = 'flex';
  }

  function hideArticleDetail() {
    selectedArticle = null;
    highlightSelectedRow(null);
    const detailDiv = document.getElementById('article-detail');
    detailDiv.style.display = 'none';
  }

  function onArticleValueChange() {
    if (!selectedMonth || !selectedArticle) return;

    const factInput = document.getElementById('outcome-value');
    //const forecastInput = document.getElementById('forecast-value');
    const paidCheckbox = document.getElementById('paid-checkbox');
    const commentField = document.getElementById('commentField');

    const outcome =  Number(factInput.value.replace(/[\s,]/g, ''));
    factInput.value=toLocaleStringCorrect(factInput.value)
    //const forecast = parseFloat(forecastInput.value) || 0;
    const paid = paidCheckbox.checked;

    const articleData = budgetData[selectedMonth][selectedArticle];
    if (!articleData.editable) return;

    articleData.outcome = outcome;
   // articleData.forecast = forecast;
    articleData.paid = paid;
    

    let newArticle 
    if(articleData.newArticle==true) {newArticle= true} else {newArticle= false}

    const comment=document.getElementById('commentField').textContent 

    changedItems.set(selectedMonth + '|' + selectedArticle, {
      month: selectedMonth, article: selectedArticle, outcome,  paid, newArticle, comment
    });

    renderArticles();
    monthsSummary= renderSummary();
    enableSaveButton();

  const raw = transformToRaw(monthsSummary);
  const prepared = prepareDatasets(raw);
  renderPnLChart(prepared);

  }


 document.getElementById('commentField').addEventListener('input', onArticleValueChange);
  document.getElementById('outcome-value').addEventListener('input', onArticleValueChange);
 // document.getElementById('forecast-value').addEventListener('input', onArticleValueChange);
  document.getElementById('paid-checkbox').addEventListener('change', onArticleValueChange);
  document.getElementById('close-detail').addEventListener('click', () => { hideArticleDetail(); });

  document.getElementById('save-btn').addEventListener('click', async function() {
    const changedArray = Array.from(changedItems.values());
    if (changedArray.length === 0) return;
    try {
      //console.log("Сохраняем", changedArray)
      await new Promise(r => setTimeout(r, 1000));

      const resp = await window.API.saveBudgetChanges(changedArray, { timeout: 8000, overlayId: "budget" });
      if (resp == null) throw new Error("Не удалось сохранить изменения бюджета");
      showToast('Изменения успешно сохранены!','success');
      init()
      //changedItems.clear();
      //enableSaveButton();
    } catch (e) {
      alert('Ошибка при сохранении: ' + e.message);
    }
  });

  function enableSaveButton() {
    const saveBtn = document.getElementById('save-btn');
    if (!saveBtn) return;
    saveBtn.disabled = changedItems.size === 0;
    //saveBtn.style.display = changedItems.size > 0 ? 'inline-block' : 'none';
  }





//-----------------------------------------------PNL Chart-----------------------------------------------------------



// Форматтеры для подсказок и подписей осей
const currencyFmt = (value, currency = "VND", locale = "ru-RU") =>
  new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

const percentFmt = (value, locale = "ru-RU") =>
  new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(value / 100);

/**
 * Подготовка данных для графика
 */
function prepareDatasets({ months, income, expense, profitMonth, cumulativeProfit, currency }) {
  // Рентабельность, %
  const profitabilityPct = income.map((inc, i) => {
    const exp = expense[i] ?? 0;
    if (!inc) return null;
    return ((inc - exp) / inc) * 100;
  });

  // labels у тебя уже человекочитаемые (из transformToRaw)
  const labels = months;

  return { labels, income, expense, profitMonth, cumulativeProfit, profitabilityPct, currency };
}


/**
 * Создание/обновление графика
 */
let pnlChart; // ссылка на экземпляр Chart.js

function renderPnLChart(prepared) {
  const { labels, income, expense, profitMonth, cumulativeProfit, profitabilityPct, currency } = prepared;

  const data = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "Накопительно",
        data: cumulativeProfit,
        yAxisID: "yMoney",
        borderWidth: 0,
        backgroundColor: "rgba(124, 77, 255, 0.35)"
      },
      {
        type: "bar",
        label: "Доход",
        data: income,
        yAxisID: "yMoney",
        borderWidth: 0,
        backgroundColor: "rgba(33, 150, 243, 0.6)"
      },
      {
        type: "bar",
        label: "Расход",
        data: expense,
        yAxisID: "yMoney",
        borderWidth: 0,
        backgroundColor: "rgba(239, 83, 80, 0.6)"
      },
      {
        type: "line",
        label: "Прибыль (абс.)",
        data: profitMonth,              // <-- помесячная прибыль
        yAxisID: "yMoney",
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 3,
        borderColor: "rgba(0, 150, 136, 1)",
        fill: false
      },
      {
        type: "line",
        label: "Рентабельность, %",
        data: profitabilityPct,
        yAxisID: "yPct",
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 3,
        borderColor: "rgba(255, 193, 7, 1)",
        fill: false
      }
    ]
  };

  const ctx = document.getElementById("pnlChart1").getContext("2d");
  if (pnlChart) {
    pnlChart.data = data;
    pnlChart.options = buildOptions(currency);
    pnlChart.update();
    return pnlChart;
  }
  pnlChart = new Chart(ctx, { data, options: buildOptions(currency) });
  return pnlChart;
}


/**
 * Опции графика (2 оси Y + форматтеры)
 */
function buildOptions(currency) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const dsLabel = ctx.dataset.label || "";
            const raw = ctx.raw;
            if (ctx.dataset.yAxisID === "yPct") {
              return ` ${dsLabel}: ${percentFmt(raw)}`;
            } else {
              return ` ${dsLabel}: ${currencyFmt(raw, currency)}`;
            }
          },
          footer: (items) => {
            // В футере подсказки показываем «Профит» и «Маржа %» суммарно по точке,
            // если вам нужно — можно оставить только стандартные лейблы.
            let inc = 0, exp = 0;
            for (const it of items) {
              if (it.dataset.label === "Доход") inc = it.raw || 0;
              if (it.dataset.label === "Расход") exp = it.raw || 0;
            }
            const p = inc - exp;
            const pct = inc ? (p / inc) * 100 : null;
            const lines = [];
            lines.push(` Профит: ${currencyFmt(p, items[0].chart.options.scales.yMoney.currencyCode)}`);
            lines.push(` Маржа накопительно: ${pct == null ? "—" : percentFmt(pct)}`);
            return lines.join("\n");
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      yMoney: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Деньги" },
        ticks: {
          callback: (v) => currencyFmt(v, currency)
        },
        currencyCode: currency
      },
      yPct: {
        type: "linear",
        position: "right",
        title: { display: true, text: "Рентабельность, %" },
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (v) => percentFmt(v)
        }
      }
    }
  };
}


/**
 * Преобразует monthsSummary в объект raw для графика
 * @param {Object} monthsSummary
 * @param {String} currency
 * @returns {Object} raw
 */

function transformToRaw(monthsSummary, currency = "VND") {
  const entries = Object.entries(monthsSummary)
    .sort(([a],[b]) => new Date(a) - new Date(b)); // по возрастанию

  const months = [];
  const income = [];
  const expense = [];
  const profitMonth = [];      // линия «Прибыль (абс.)»
  const cumulativeProfit = []; // столбец/линия «Накопительно»

  for (const [date, v] of entries) {
    const inc  = Number(v?.income)      || 0;
    const out  = Number(v?.outcome)     || 0;
    const pMon = Number(v?.profitMonth) || Number(v?.revenueFact) || (inc - out);
    const pCum = Number(v?.profit)      || 0;

    const d = new Date(date);
    const label = d.toLocaleDateString("ru-RU", { year: "numeric", month: "short" });

    months.push(label);
    income.push(inc);
    expense.push(out);
    profitMonth.push(pMon);
    cumulativeProfit.push(pCum);
  }

  return { months, income, expense, profitMonth, cumulativeProfit, currency };
}

function makeUniqueKey(month, baseTitle) {
  const data = budgetData[month] || {};
  // вариант 1: нумерация "Название #2"
  let idx = 1;
  let key = baseTitle;
  while (Object.prototype.hasOwnProperty.call(data, key)) {
    idx += 1;
    key = `${baseTitle} #${idx}`;
  }
  return key;

  // альтернатива — короткий UID:
  // return `${baseTitle}__${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
}




function isPastMonth(dateStr) {
  // создаём дату из строки (например, "2025-08-01" или "2025-08")
  const d = new Date(dateStr);

  // берём только год и месяц
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 = январь

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // сравнение
  return year < currentYear || (year === currentYear && month < currentMonth);
}



  await init();
})();




