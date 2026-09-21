const APP_LANG = String(window.APP_LANG || window.CONFIG?.APP_LANG || "en").toLowerCase();
const CHARTS_UI_LOCALE = APP_LANG.startsWith("ru") ? "ru-RU" : "en-US";

const MONTH_NAMES = {
  ru: {
    "янв": "01",
    "фев": "02",
    "мар": "03",
    "апр": "04",
    "май": "05",
    "июн": "06",
    "июл": "07",
    "авг": "08",
    "сен": "09",
    "сент": "09",
    "oct": "10",
    "окт": "10",
    "ноя": "11",
    "дек": "12"
  },
  en: {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12"
  }
};

const METRICS = [
  { id: "sum_finalPriceVND", label: "Выручка", type: "money", color: "rgba(58, 134, 255, 0.75)" },
  { id: "sum_Profit", label: "Прибыль", type: "money", color: "rgba(42, 157, 143, 0.75)" },
  { id: "sum_price", label: "Себестоимость", type: "money", color: "rgba(123, 97, 255, 0.75)" },
  { id: "sum_discount", label: "Скидка", type: "money", color: "rgba(244, 162, 97, 0.75)" },
  { id: "sum_amount_to_supplier", label: "Поставщику", type: "money", color: "rgba(231, 111, 81, 0.75)" },
  { id: "count_article", label: "Товаров", type: "count", color: "rgba(20, 33, 61, 0.75)" }
];

const METRIC_BY_ID = Object.fromEntries(METRICS.map((metric) => [metric.id, metric]));

const state = {
  rows: [],
  currentTab: "day",
  currentDayIndex: 0,
  dailyMetric: "sum_finalPriceVND",
  monthlyMetric: "sum_finalPriceVND",
  customGranularity: "auto",
  customFrom: "",
  customTo: "",
  customMetrics: ["sum_finalPriceVND", "sum_Profit", "count_article"],
  sidePanels: {
    day: false,
    month: false,
    custom: false
  },
  charts: []
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toIsoDate(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return "";
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalized = String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(/,/g, ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString(CHARTS_UI_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function formatCount(value) {
  return Math.round(Number(value || 0)).toLocaleString(CHARTS_UI_LOCALE);
}

function formatMetricValue(metricId, value) {
  const metric = METRIC_BY_ID[metricId];
  if (!metric) return String(value ?? "0");
  return metric.type === "money" ? formatMoney(value) : formatCount(value);
}

function getMetricUnit(metricId) {
  const metric = METRIC_BY_ID[metricId];
  return metric?.type === "money" ? "VND" : "шт";
}

function formatDateLabel(dateISO) {
  if (!dateISO) return "Без даты";
  const date = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateISO;
  return date.toLocaleDateString(CHARTS_UI_LOCALE, {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function formatMonthLabel(monthISO) {
  if (!monthISO) return "Без месяца";
  const [year, month] = String(monthISO).split("-").map(Number);
  if (!year || !month) return monthISO;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(CHARTS_UI_LOCALE, {
    month: "long",
    year: "numeric"
  });
}

function getDaysInMonth(monthISO) {
  const [year, month] = String(monthISO || "").split("-").map(Number);
  if (!year || !month) return 0;
  return new Date(year, month, 0).getDate();
}

function getCurrentMonthISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = String(text);
  return el;
}

function destroyCharts() {
  state.charts.forEach((chart) => {
    if (chart && typeof chart.destroy === "function") {
      chart.destroy();
    }
  });
  state.charts = [];
}

function showStatus(message, tone = "info") {
  const node = document.getElementById("charts-status");
  if (!node) return;
  node.innerHTML = "";
  if (!message) return;
  const msg = createEl("div", `charts-message ${tone}`, message);
  node.appendChild(msg);
}

function unwrapMaybe(value, depth = 0) {
  if (depth > 6) return value;
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return unwrapMaybe(JSON.parse(value), depth + 1);
    } catch (_) {
      return value;
    }
  }
  if (Array.isArray(value)) return value;
  if (typeof value === "object") {
    if (value.data !== undefined) return unwrapMaybe(value.data, depth + 1);
    if (value.result !== undefined) return unwrapMaybe(value.result, depth + 1);
    if (value.payload !== undefined) return unwrapMaybe(value.payload, depth + 1);
    if (value.json !== undefined && Object.keys(value).length === 1) return unwrapMaybe(value.json, depth + 1);
  }
  return value;
}

function normalizeMonthToken(token) {
  if (!token) return "";
  const normalized = String(token).trim().toLowerCase();
  return MONTH_NAMES.ru[normalized] || MONTH_NAMES.en[normalized] || "";
}

function parseDateString(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const dotMatch = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dotMatch) {
    return toIsoDate(dotMatch[3], dotMatch[2], dotMatch[1]);
  }

  const compactMonth = raw.match(/^([A-Za-zА-Яа-я]+)\s+(\d{4})$/);
  if (compactMonth) {
    const month = normalizeMonthToken(compactMonth[1].slice(0, 3));
    return month ? `${compactMonth[2]}-${month}-01` : "";
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return toIsoDate(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
  }

  return "";
}

function resolveMonthISO(row, dateISO) {
  if (row.monthISO) return String(row.monthISO);
  if (row.year && row.month) return `${row.year}-${pad2(row.month)}`;
  if (row.month_year) {
    const parts = String(row.month_year).trim().split(/\s+/);
    if (parts.length >= 2) {
      const month = normalizeMonthToken(parts[0].slice(0, 3));
      const year = Number(parts[parts.length - 1]);
      if (month && year) return `${year}-${month}`;
    }
  }
  if (dateISO) return dateISO.slice(0, 7);
  return "";
}

function resolveDateISO(row) {
  if (row.dateISO) return String(row.dateISO);
  if (row.year && row.month && row.day) return toIsoDate(row.year, row.month, row.day);
  if (row.date) return parseDateString(row.date);
  if (row.Date) return parseDateString(row.Date);
  if (row.dateConverted) return parseDateString(row.dateConverted);
  return "";
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function parseDoneFlag(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value == null || value === "") return false;
  const normalized = String(value).trim().toLowerCase();
  return ["true", "1", "yes", "y", "done", "paid", "оплачено", "да", "ok", "x"].includes(normalized);
}

function normalizeRow(row, index) {
  const dateISO = resolveDateISO(row);
  const monthISO = resolveMonthISO(row, dateISO);
  const store = String(firstDefined(row.store, row.Store, row.brand, row.Brand, row.shop, "Без магазина")).trim();
  const brand = String(firstDefined(row.Brand, row.brandName, row.brand_title, row.brand, "")).trim();
  const amountToSupplier = parseNumber(firstDefined(row["amount to supplier"], row.amount_to_supplier, row.sum_amount_to_supplier));

  return {
    id: `${monthISO || "no-month"}-${dateISO || "no-date"}-${store}-${index}`,
    dateISO,
    monthISO,
    store,
    brand,
    done: parseDoneFlag(firstDefined(row.done, row.Done, row.isDone, row.paid, row.Paid)),
    metrics: {
      sum_finalPriceVND: parseNumber(firstDefined(row.finalPriceVND, row.sum_finalPriceVND, row.revenue)),
      sum_price: parseNumber(firstDefined(row.price, row.sum_price, row.cost)),
      sum_discount: parseNumber(firstDefined(row.discount, row.sum_discount)),
      sum_amount_to_supplier: amountToSupplier,
      sum_Profit: parseNumber(firstDefined(row.Profit, row.sum_Profit, row.profit)),
      count_article: Math.max(1, parseNumber(firstDefined(row.count_article, row.count, row.qty, 1)))
    }
  };
}

function extractRows(raw) {
  const data = unwrapMaybe(raw);
  if (!Array.isArray(data)) return [];
  return data
    .map((entry) => (entry && typeof entry === "object" && entry.json ? entry.json : entry))
    .filter((entry) => entry && typeof entry === "object");
}

function getAllDates(rows) {
  return [...new Set(rows.map((row) => row.dateISO).filter(Boolean))].sort();
}

function getAllMonths(rows) {
  return [...new Set(rows.map((row) => row.monthISO).filter(Boolean))].sort();
}

function sumRows(rows) {
  return rows.reduce((acc, row) => {
    Object.keys(acc).forEach((metricId) => {
      acc[metricId] += Number(row.metrics[metricId] || 0);
    });
    return acc;
  }, {
    sum_finalPriceVND: 0,
    sum_price: 0,
    sum_discount: 0,
    sum_amount_to_supplier: 0,
    sum_Profit: 0,
    count_article: 0
  });
}

function aggregateRows(rows, groupKey) {
  const map = new Map();
  rows.forEach((row) => {
    const key = groupKey(row);
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, { key, rows: [], totals: sumRows([]) });
    }
    const bucket = map.get(key);
    bucket.rows.push(row);
  });

  map.forEach((bucket) => {
    bucket.totals = sumRows(bucket.rows);
  });

  return [...map.values()];
}

function getDateRangeLabel(from, to) {
  if (!from && !to) return "Все доступные даты";
  if (from && to) return `${formatDateLabel(from)} - ${formatDateLabel(to)}`;
  return from ? `С ${formatDateLabel(from)}` : `До ${formatDateLabel(to)}`;
}

function getVisibleRowsInRange() {
  const from = state.customFrom;
  const to = state.customTo;
  return state.rows.filter((row) => {
    if (!row.dateISO) return false;
    if (from && row.dateISO < from) return false;
    if (to && row.dateISO > to) return false;
    return true;
  });
}

function resolveCustomGranularity(rows) {
  if (state.customGranularity !== "auto") return state.customGranularity;
  const dates = [...new Set(rows.map((row) => row.dateISO).filter(Boolean))];
  return dates.length > 45 ? "month" : "day";
}

function buildShell() {
  const root = document.getElementById("charts-root");
  if (!root) return;
  root.innerHTML = `
    <div class="charts-page">
      <section class="charts-hero">
        <div class="charts-hero__header">
          <div>
            <div class="charts-kicker">Charts</div>
            <h1>Статистика продаж по дням, месяцам и произвольным периодам</h1>
            <p>Одна страница для детализации по каждому дню, общей динамики по месяцам и кастомного анализа по выбранным метрикам.</p>
          </div>
          <div class="charts-badge" id="charts-badge">Подготовка данных...</div>
        </div>
        <div class="charts-overview" id="charts-overview"></div>
      </section>
      <div id="charts-status" class="charts-status"></div>
      <nav class="charts-tabs" id="charts-tabs" aria-label="Переключение разделов статистики">
        <button class="charts-tab" data-tab="day" type="button">По дням</button>
        <button class="charts-tab" data-tab="month" type="button">По месяцам</button>
        <button class="charts-tab" data-tab="custom" type="button">Кастомный период</button>
      </nav>
      <section class="charts-panel" id="charts-panel"></section>
    </div>
  `;
}

function renderOverview() {
  const overview = document.getElementById("charts-overview");
  const badge = document.getElementById("charts-badge");
  if (!overview || !badge) return;

  const totals = sumRows(state.rows);
  const dates = getAllDates(state.rows);
  const months = getAllMonths(state.rows);
  const rangeLabel = dates.length ? `${formatDateLabel(dates[0])} - ${formatDateLabel(dates[dates.length - 1])}` : "Нет дат";

  badge.textContent = `${dates.length || 0} дней | ${months.length || 0} месяцев`;
  overview.innerHTML = `
    <article class="charts-stat">
      <span class="charts-stat__label">Период в данных</span>
      <div class="charts-stat__value">${rangeLabel}</div>
    </article>
    <article class="charts-stat">
      <span class="charts-stat__label">Выручка всего</span>
      <div class="charts-stat__value">${formatMetricValue("sum_finalPriceVND", totals.sum_finalPriceVND)}</div>
    </article>
    <article class="charts-stat">
      <span class="charts-stat__label">Прибыль всего</span>
      <div class="charts-stat__value">${formatMetricValue("sum_Profit", totals.sum_Profit)}</div>
    </article>
    <article class="charts-stat">
      <span class="charts-stat__label">Продано товаров</span>
      <div class="charts-stat__value">${formatMetricValue("count_article", totals.count_article)}</div>
    </article>
  `;
}

function bindTabs() {
  document.querySelectorAll(".charts-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.currentTab);
    button.onclick = () => {
      if (state.currentTab === button.dataset.tab) return;
      state.currentTab = button.dataset.tab;
      renderActivePanel();
    };
  });
}

function buildMetricOptions(selectedMetric) {
  return METRICS.map((metric) => `
    <option value="${metric.id}" ${metric.id === selectedMetric ? "selected" : ""}>${metric.label}</option>
  `).join("");
}

function getChartOptions({ tooltipFormatter, legendPosition = "bottom", dualAxis = false } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    hover: {
      mode: "index",
      intersect: false
    },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(20, 33, 61, 0.94)",
        titleFont: {
          size: 14,
          weight: "700"
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          label(context) {
            if (typeof tooltipFormatter === "function") {
              return tooltipFormatter(context);
            }
            const metricId = context.dataset.metricId;
            return `${context.dataset.label}: ${formatMetricValue(metricId, context.parsed.y)}`;
          }
        }
      },
      legend: {
        display: true,
        position: legendPosition,
        labels: {
          usePointStyle: true,
          boxWidth: 12,
          boxHeight: 12,
          padding: 18,
          font: {
            size: 13,
            weight: "700"
          },
          color: "#14213d"
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#52607a",
          font: {
            size: 12,
            weight: "600"
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#52607a",
          font: {
            size: 12
          }
        },
        grid: {
          color: "rgba(20, 33, 61, 0.08)"
        }
      },
      ...(dualAxis ? {
        yAvg: {
          position: "right",
          beginAtZero: true,
          ticks: {
            color: "#52607a",
            font: {
              size: 12
            }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      } : {})
    }
  };
}

function createMetricCards(metrics, totals, subtitleResolver) {
  return metrics.map((metricId) => `
    <article class="charts-card">
      <div class="charts-card__eyebrow">${METRIC_BY_ID[metricId].label}</div>
      <div class="charts-card__value">${formatMetricValue(metricId, totals[metricId])}</div>
      <div class="charts-card__sub">${subtitleResolver(metricId)}</div>
    </article>
  `).join("");
}

function renderDailyPanel() {
  const panel = document.getElementById("charts-panel");
  const dates = getAllDates(state.rows);
  if (!panel) return;

  if (!dates.length) {
    panel.innerHTML = `<div class="charts-card"><h2>Нет дневных данных</h2><p>В ответе сервиса нет корректных дат, поэтому помесячная и произвольная аналитика доступны, а дневной режим - нет.</p></div>`;
    return;
  }

  state.currentDayIndex = Math.min(state.currentDayIndex, dates.length - 1);
  const activeDate = dates[state.currentDayIndex];
  const rows = state.rows.filter((row) => row.dateISO === activeDate);
  const totals = sumRows(rows);
  const byStore = aggregateRows(rows, (row) => row.store)
    .map((bucket) => ({
      ...bucket,
      brands: [...new Set(bucket.rows.map((row) => row.brand).filter(Boolean))].sort()
    }))
    .sort((a, b) => b.totals[state.dailyMetric] - a.totals[state.dailyMetric]);

  panel.innerHTML = `
    <div class="charts-toolbar">
      <div class="charts-toolbar__group">
        <button class="charts-button is-ghost" id="charts-day-prev" type="button" ${state.currentDayIndex === 0 ? "disabled" : ""}>Назад</button>
        <div class="charts-range-label">${formatDateLabel(activeDate)}</div>
        <button class="charts-button is-ghost" id="charts-day-next" type="button" ${state.currentDayIndex >= dates.length - 1 ? "disabled" : ""}>Вперед</button>
      </div>
      <div class="charts-toolbar__group">
        <label class="charts-label">
          <span>Быстрый переход</span>
          <select id="charts-day-select" class="charts-select">${dates.map((dateISO, index) => `<option value="${index}" ${index === state.currentDayIndex ? "selected" : ""}>${formatDateLabel(dateISO)}</option>`).join("")}</select>
        </label>
        <label class="charts-label">
          <span>Метрика на графике</span>
          <select id="charts-daily-metric" class="charts-select">${buildMetricOptions(state.dailyMetric)}</select>
        </label>
      </div>
    </div>
    <div class="charts-grid">
      ${createMetricCards(["sum_finalPriceVND", "sum_Profit", "count_article", "sum_discount"], totals, () => "За выбранный день")}
    </div>
    <div class="charts-layout ${state.sidePanels.day ? "is-expanded" : ""}">
      <article class="charts-card charts-figure">
        <h2>По магазинам за день</h2>
        <p class="charts-card__eyebrow">${METRIC_BY_ID[state.dailyMetric].label}</p>
        <canvas id="charts-day-canvas"></canvas>
      </article>
      <article class="charts-card charts-side-card ${state.sidePanels.day ? "is-open" : "is-collapsed"}">
        <div class="charts-side-card__header">
          <h2>Сводка по магазинам</h2>
          <button class="charts-button is-ghost" id="charts-toggle-day-table" type="button">${state.sidePanels.day ? "Скрыть таблицу" : "Показать таблицу"}</button>
        </div>
        ${state.sidePanels.day ? `
          <div class="charts-table-wrap">
            <table class="charts-table">
              <thead>
                <tr>
                  <th>Магазин</th>
                  <th>Проданный бренд</th>
                  <th class="num">Выручка</th>
                  <th class="num">Прибыль</th>
                  <th class="num">Товаров</th>
                </tr>
              </thead>
              <tbody>
                ${byStore.map((bucket) => `
                  <tr>
                    <td>${bucket.key}</td>
                    <td>${bucket.brands.length ? bucket.brands.join(", ") : "—"}</td>
                    <td class="num">${formatMetricValue("sum_finalPriceVND", bucket.totals.sum_finalPriceVND)}</td>
                    <td class="num">${formatMetricValue("sum_Profit", bucket.totals.sum_Profit)}</td>
                    <td class="num">${formatMetricValue("count_article", bucket.totals.count_article)}</td>
                  </tr>
                `).join("")}
                <tr class="is-total">
                  <td>Итого</td>
                  <td>—</td>
                  <td class="num">${formatMetricValue("sum_finalPriceVND", totals.sum_finalPriceVND)}</td>
                  <td class="num">${formatMetricValue("sum_Profit", totals.sum_Profit)}</td>
                  <td class="num">${formatMetricValue("count_article", totals.count_article)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : `<p class="charts-card__sub">Таблица свернута по умолчанию, чтобы график оставался широким.</p>`}
      </article>
    </div>
  `;

  document.getElementById("charts-day-prev").onclick = () => {
    if (state.currentDayIndex <= 0) return;
    state.currentDayIndex -= 1;
    renderActivePanel();
  };
  document.getElementById("charts-day-next").onclick = () => {
    if (state.currentDayIndex >= dates.length - 1) return;
    state.currentDayIndex += 1;
    renderActivePanel();
  };
  document.getElementById("charts-day-select").onchange = (event) => {
    state.currentDayIndex = Number(event.target.value || 0);
    renderActivePanel();
  };
  document.getElementById("charts-daily-metric").onchange = (event) => {
    state.dailyMetric = event.target.value;
    renderActivePanel();
  };
  document.getElementById("charts-toggle-day-table").onclick = () => {
    state.sidePanels.day = !state.sidePanels.day;
    renderActivePanel();
  };

  const chart = new Chart(document.getElementById("charts-day-canvas"), {
    type: "bar",
    data: {
      labels: byStore.map((bucket) => bucket.key),
      datasets: [{
        label: METRIC_BY_ID[state.dailyMetric].label,
        data: byStore.map((bucket) => bucket.totals[state.dailyMetric]),
        backgroundColor: METRIC_BY_ID[state.dailyMetric].color,
        borderRadius: 10,
        metricId: state.dailyMetric
      }]
    },
    options: getChartOptions({
      tooltipFormatter(context) {
        return `${context.label}: ${formatMetricValue(state.dailyMetric, context.parsed.y)} ${getMetricUnit(state.dailyMetric)}`;
      }
    })
  });
  state.charts.push(chart);
}

function renderMonthlyPanel() {
  const panel = document.getElementById("charts-panel");
  if (!panel) return;

  const months = aggregateRows(state.rows, (row) => row.monthISO).sort((a, b) => a.key.localeCompare(b.key));
  if (!months.length) {
    panel.innerHTML = `<div class="charts-card"><h2>Нет данных по месяцам</h2></div>`;
    return;
  }

  const bestMonth = months.reduce((best, item) => (
    !best || item.totals[state.monthlyMetric] > best.totals[state.monthlyMetric] ? item : best
  ), null);
  const average = months.reduce((sum, month) => sum + month.totals[state.monthlyMetric], 0) / months.length;
  const totalTotals = sumRows(state.rows);
  const currentMonthISO = getCurrentMonthISO();
  const monthAnalytics = months.map((month) => {
    const daysInMonth = getDaysInMonth(month.key);
    const uniqueDays = [...new Set(month.rows.map((row) => row.dateISO).filter(Boolean))].sort();
    const lastRecordedDay = uniqueDays.length ? Number(uniqueDays[uniqueDays.length - 1].slice(-2)) : 0;
    const elapsedDays = month.key === currentMonthISO
      ? Math.min(daysInMonth, lastRecordedDay || new Date().getDate())
      : daysInMonth;
    const avgPerDay = elapsedDays ? month.totals[state.monthlyMetric] / elapsedDays : 0;
    const forecastTotal = month.key === currentMonthISO && elapsedDays
      ? avgPerDay * daysInMonth
      : month.totals[state.monthlyMetric];

    return {
      ...month,
      daysInMonth,
      elapsedDays,
      avgPerDay,
      forecastTotal,
      isCurrentMonth: month.key === currentMonthISO
    };
  });
  const currentMonthAnalytics = monthAnalytics.find((month) => month.isCurrentMonth) || null;

  panel.innerHTML = `
    <div class="charts-toolbar">
      <div class="charts-toolbar__group charts-meta">
        <span>Всего месяцев: ${monthAnalytics.length}</span>
        <span>Лучший месяц: ${bestMonth ? formatMonthLabel(bestMonth.key) : "—"}</span>
        ${currentMonthAnalytics ? `<span>Текущий прогноз: ${formatMetricValue(state.monthlyMetric, currentMonthAnalytics.forecastTotal)}</span>` : ""}
      </div>
      <div class="charts-toolbar__group">
        <label class="charts-label">
          <span>Метрика</span>
          <select id="charts-monthly-metric" class="charts-select">${buildMetricOptions(state.monthlyMetric)}</select>
        </label>
      </div>
    </div>
    <div class="charts-grid">
      <article class="charts-card">
        <div class="charts-card__eyebrow">Выручка всего</div>
        <div class="charts-card__value">${formatMetricValue("sum_finalPriceVND", totalTotals.sum_finalPriceVND)}</div>
        <div class="charts-card__sub">За весь период</div>
      </article>
      <article class="charts-card">
        <div class="charts-card__eyebrow">Прибыль всего</div>
        <div class="charts-card__value">${formatMetricValue("sum_Profit", totalTotals.sum_Profit)}</div>
        <div class="charts-card__sub">За весь период</div>
      </article>
      <article class="charts-card">
        <div class="charts-card__eyebrow">Продано товаров</div>
        <div class="charts-card__value">${formatMetricValue("count_article", totalTotals.count_article)}</div>
        <div class="charts-card__sub">За весь период</div>
      </article>
      <article class="charts-card">
        <div class="charts-card__eyebrow">Среднее по метрике</div>
        <div class="charts-card__value">${formatMetricValue(state.monthlyMetric, average)}</div>
        <div class="charts-card__sub">${METRIC_BY_ID[state.monthlyMetric].label} в месяц</div>
      </article>
      <article class="charts-card">
        <div class="charts-card__eyebrow">Среднее в день</div>
        <div class="charts-card__value">${currentMonthAnalytics ? formatMetricValue(state.monthlyMetric, currentMonthAnalytics.avgPerDay) : "—"}</div>
        <div class="charts-card__sub">${currentMonthAnalytics ? `Текущий месяц: ${currentMonthAnalytics.elapsedDays} дн. в расчете` : "Для выбранной метрики"}</div>
      </article>
    </div>
    <div class="charts-layout ${state.sidePanels.month ? "is-expanded" : ""}">
      <article class="charts-card charts-figure">
        <h2>Динамика по месяцам</h2>
        <p class="charts-card__eyebrow">${METRIC_BY_ID[state.monthlyMetric].label}, среднее в день и прогноз по текущему месяцу</p>
        <canvas id="charts-month-canvas"></canvas>
      </article>
      <article class="charts-card charts-side-card ${state.sidePanels.month ? "is-open" : "is-collapsed"}">
        <div class="charts-side-card__header">
          <h2>Таблица по месяцам</h2>
          <button class="charts-button is-ghost" id="charts-toggle-month-table" type="button">${state.sidePanels.month ? "Скрыть таблицу" : "Показать таблицу"}</button>
        </div>
        ${state.sidePanels.month ? `
          <div class="charts-table-wrap">
            <table class="charts-table">
              <thead>
                <tr>
                  <th>Месяц</th>
                  <th class="num">${METRIC_BY_ID[state.monthlyMetric].label}</th>
                  <th class="num">Среднее в день</th>
                  <th class="num">Прогноз</th>
                </tr>
              </thead>
              <tbody>
                ${monthAnalytics.map((month) => `
                  <tr>
                    <td>${formatMonthLabel(month.key)}</td>
                    <td class="num">${formatMetricValue(state.monthlyMetric, month.totals[state.monthlyMetric])}</td>
                    <td class="num">${formatMetricValue(state.monthlyMetric, month.avgPerDay)}</td>
                    <td class="num">${formatMetricValue(state.monthlyMetric, month.forecastTotal)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="charts-card__sub">Таблица свернута по умолчанию, чтобы график не сплющивался.</p>`}
      </article>
    </div>
  `;

  document.getElementById("charts-monthly-metric").onchange = (event) => {
    state.monthlyMetric = event.target.value;
    renderActivePanel();
  };
  document.getElementById("charts-toggle-month-table").onclick = () => {
    state.sidePanels.month = !state.sidePanels.month;
    renderActivePanel();
  };

  const chart = new Chart(document.getElementById("charts-month-canvas"), {
    type: "bar",
    data: {
      labels: monthAnalytics.map((month) => formatMonthLabel(month.key)),
      datasets: [
        {
          type: "bar",
          label: "Факт",
          data: monthAnalytics.map((month) => month.totals[state.monthlyMetric]),
          backgroundColor: METRIC_BY_ID[state.monthlyMetric].color,
          borderRadius: 10,
          metricId: state.monthlyMetric,
          order: 3
        },
        {
          type: "line",
          label: "Прогноз",
          data: monthAnalytics.map((month) => month.forecastTotal),
          borderColor: "rgba(231, 111, 81, 0.95)",
          backgroundColor: "rgba(231, 111, 81, 0.95)",
          borderDash: [8, 6],
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.2,
          fill: false,
          metricId: state.monthlyMetric,
          order: 1
        },
        {
          type: "line",
          label: "Среднее в день",
          data: monthAnalytics.map((month) => month.avgPerDay),
          borderColor: "rgba(20, 33, 61, 0.88)",
          backgroundColor: "rgba(20, 33, 61, 0.88)",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.25,
          fill: false,
          metricId: state.monthlyMetric,
          yAxisID: "yAvg",
          order: 2
        }
      ]
    },
    options: getChartOptions({
      dualAxis: true,
      tooltipFormatter(context) {
        const value = context.parsed.y;
        const month = monthAnalytics[context.dataIndex];
        if (context.dataset.label === "Среднее в день") {
          return `${context.dataset.label}: ${formatMetricValue(state.monthlyMetric, value)} ${getMetricUnit(state.monthlyMetric)}/день`;
        }
        if (context.dataset.label === "Прогноз" && month?.isCurrentMonth) {
          return `${context.dataset.label}: ${formatMetricValue(state.monthlyMetric, value)} ${getMetricUnit(state.monthlyMetric)} (${month.elapsedDays} дн. факта из ${month.daysInMonth})`;
        }
        return `${context.dataset.label}: ${formatMetricValue(state.monthlyMetric, value)} ${getMetricUnit(state.monthlyMetric)}`;
      }
    })
  });
  state.charts.push(chart);
}

function renderCustomPanel() {
  const panel = document.getElementById("charts-panel");
  if (!panel) return;

  const visibleRows = getVisibleRowsInRange();
  const granularity = resolveCustomGranularity(visibleRows);
  const groupKey = {
    day: (row) => row.dateISO,
    month: (row) => row.monthISO,
    store: (row) => row.store
  }[granularity];

  const groups = aggregateRows(visibleRows, groupKey).sort((a, b) => {
    if (granularity === "store") return a.key.localeCompare(b.key);
    return a.key.localeCompare(b.key);
  });
  const selectedMetrics = state.customMetrics.filter((metricId) => METRIC_BY_ID[metricId]);
  const totals = sumRows(visibleRows);

  panel.innerHTML = `
    <div class="charts-toolbar">
      <div class="charts-toolbar__group">
        <label class="charts-label">
          <span>От</span>
          <input id="charts-custom-from" class="charts-input" type="date" value="${state.customFrom}">
        </label>
        <label class="charts-label">
          <span>До</span>
          <input id="charts-custom-to" class="charts-input" type="date" value="${state.customTo}">
        </label>
        <label class="charts-label">
          <span>Группировка</span>
          <select id="charts-custom-granularity" class="charts-select">
            <option value="auto" ${state.customGranularity === "auto" ? "selected" : ""}>Авто</option>
            <option value="day" ${state.customGranularity === "day" ? "selected" : ""}>По дням</option>
            <option value="month" ${state.customGranularity === "month" ? "selected" : ""}>По месяцам</option>
            <option value="store" ${state.customGranularity === "store" ? "selected" : ""}>По магазинам</option>
          </select>
        </label>
      </div>
      <div class="charts-toolbar__group charts-meta">
        <span>${getDateRangeLabel(state.customFrom, state.customTo)}</span>
        <span>${visibleRows.length} записей</span>
      </div>
    </div>
    <article class="charts-card">
      <h2>Выбор метрик</h2>
      <div class="charts-metrics" id="charts-custom-metrics">
        ${METRICS.map((metric) => `
          <label class="charts-metric">
            <input type="checkbox" value="${metric.id}" ${selectedMetrics.includes(metric.id) ? "checked" : ""}>
            <span>${metric.label}</span>
          </label>
        `).join("")}
      </div>
    </article>
    <div class="charts-grid">
      ${createMetricCards(selectedMetrics.slice(0, 4), totals, () => "За выбранный диапазон")}
    </div>
    <div class="charts-layout ${state.sidePanels.custom ? "is-expanded" : ""}">
      <article class="charts-card charts-figure">
        <h2>Сравнение метрик</h2>
        <p class="charts-card__eyebrow">Группировка: ${granularity === "store" ? "по магазинам" : granularity === "month" ? "по месяцам" : "по дням"}</p>
        <canvas id="charts-custom-canvas"></canvas>
      </article>
      <article class="charts-card charts-side-card ${state.sidePanels.custom ? "is-open" : "is-collapsed"}">
        <div class="charts-side-card__header">
          <h2>Таблица периода</h2>
          <button class="charts-button is-ghost" id="charts-toggle-custom-table" type="button">${state.sidePanels.custom ? "Скрыть таблицу" : "Показать таблицу"}</button>
        </div>
        ${state.sidePanels.custom ? `
          <div class="charts-table-wrap">
            <table class="charts-table">
              <thead>
                <tr>
                  <th>Период</th>
                  ${selectedMetrics.map((metricId) => `<th class="num">${METRIC_BY_ID[metricId].label}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${groups.map((group) => `
                  <tr>
                    <td>${granularity === "day" ? formatDateLabel(group.key) : granularity === "month" ? formatMonthLabel(group.key) : group.key}</td>
                    ${selectedMetrics.map((metricId) => `<td class="num">${formatMetricValue(metricId, group.totals[metricId])}</td>`).join("")}
                  </tr>
                `).join("")}
                <tr class="is-total">
                  <td>Итого</td>
                  ${selectedMetrics.map((metricId) => `<td class="num">${formatMetricValue(metricId, totals[metricId])}</td>`).join("")}
                </tr>
              </tbody>
            </table>
          </div>
        ` : `<p class="charts-card__sub">Таблица свернута по умолчанию, чтобы график оставался читабельным.</p>`}
      </article>
    </div>
  `;

  document.getElementById("charts-custom-from").onchange = (event) => {
    state.customFrom = event.target.value || "";
    if (state.customTo && state.customFrom && state.customFrom > state.customTo) {
      state.customTo = state.customFrom;
    }
    renderActivePanel();
  };
  document.getElementById("charts-custom-to").onchange = (event) => {
    state.customTo = event.target.value || "";
    if (state.customFrom && state.customTo && state.customTo < state.customFrom) {
      state.customFrom = state.customTo;
    }
    renderActivePanel();
  };
  document.getElementById("charts-custom-granularity").onchange = (event) => {
    state.customGranularity = event.target.value;
    renderActivePanel();
  };
  document.querySelectorAll("#charts-custom-metrics input[type='checkbox']").forEach((input) => {
    input.onchange = () => {
      const checked = [...document.querySelectorAll("#charts-custom-metrics input[type='checkbox']:checked")].map((node) => node.value);
      state.customMetrics = checked.length ? checked : [input.value];
      renderActivePanel();
    };
  });
  document.getElementById("charts-toggle-custom-table").onclick = () => {
    state.sidePanels.custom = !state.sidePanels.custom;
    renderActivePanel();
  };

  const chart = new Chart(document.getElementById("charts-custom-canvas"), {
    type: granularity === "store" ? "bar" : "line",
    data: {
      labels: groups.map((group) => (
        granularity === "day" ? formatDateLabel(group.key) : granularity === "month" ? formatMonthLabel(group.key) : group.key
      )),
      datasets: selectedMetrics.map((metricId) => ({
        label: METRIC_BY_ID[metricId].label,
        data: groups.map((group) => group.totals[metricId]),
        borderColor: METRIC_BY_ID[metricId].color,
        backgroundColor: METRIC_BY_ID[metricId].color,
        borderRadius: granularity === "store" ? 10 : 0,
        tension: 0.22,
        fill: false,
        metricId
      }))
    },
    options: getChartOptions({
      tooltipFormatter(context) {
        const metricId = context.dataset.metricId;
        const suffix = metricId && METRIC_BY_ID[metricId]?.type === "count" ? " шт" : " VND";
        return `${context.dataset.label}: ${formatMetricValue(metricId, context.parsed.y)}${suffix}`;
      }
    })
  });
  state.charts.push(chart);
}

function renderActivePanel() {
  destroyCharts();
  bindTabs();
  if (state.currentTab === "day") {
    renderDailyPanel();
    return;
  }
  if (state.currentTab === "month") {
    renderMonthlyPanel();
    return;
  }
  renderCustomPanel();
}

async function loadRows() {
  if (!window.API || typeof window.API.getStatisticData !== "function") {
    throw new Error("Сервис getChartsData недоступен");
  }

  const raw = await window.API.getChartsData({
    action: "getStatisticData",
    groupByField: "",
    visible: true
  }, { overlayId: "charts" });

  const rows = extractRows(raw).map(normalizeRow).filter((row) => row.monthISO || row.dateISO);
  if (!rows.length) {
    throw new Error("Сервис charts не вернул пригодные строки");
  }
  return rows.sort((a, b) => {
    const left = `${a.dateISO || a.monthISO || ""}-${a.store}`;
    const right = `${b.dateISO || b.monthISO || ""}-${b.store}`;
    return left.localeCompare(right);
  });
}

async function boot() {
  buildShell();
  showStatus("Загружаю данные charts...", "info");

  if (typeof Chart === "undefined") {
    showStatus("Chart.js не загружен.", "error");
    return;
  }

  try {
    state.rows = await loadRows();
    const dates = getAllDates(state.rows);
    state.currentDayIndex = Math.max(0, dates.length - 1);
    state.customFrom = dates[0] || "";
    state.customTo = dates[dates.length - 1] || "";

    renderOverview();
    showStatus("");
    renderActivePanel();
  } catch (error) {
    console.error("Не удалось загрузить charts", error);
    renderOverview();
    showStatus(error?.message || "Не удалось загрузить данные charts.", "error");
  }
}

if (typeof registerPageInit === "function") {
  registerPageInit("charts", boot);
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
