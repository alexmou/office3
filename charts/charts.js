const bgColor = [
  'rgba(30, 119, 182, 0.4)',
  'rgba(255, 127, 14, 0.4)',
  'rgba(44, 160, 44, 0.4)',
  'rgba(214, 39, 40, 0.4)',
  'rgba(148, 103, 189, 0.4)'
];

// Поддерживаемые метрики
const availableFields = ['sum_finalPriceVND', 'sum_price', 'sum_discount','count_article', "sum_amount_to_supplier",	"sum_Profit","count_article"];

const MONTH_LABELS_RU = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const pad2 = (n) => String(n).padStart(2, '0');

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toYm(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function formatYmDisplay(ym) {
  const [y, m] = String(ym || '').split('-').map(Number);
  if (!y || !m) return String(ym || '');
  const label = MONTH_LABELS_RU[m - 1] || pad2(m);
  return `${label} ${y}`;
}

function formatDateRu(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatInt(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return Math.round(num).toLocaleString('ru-RU');
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = String(text);
  return el;
}

function ensureSummaryContainer() {
  let container = document.getElementById('summary-container');
  if (container) return container;
  container = document.createElement('div');
  container.id = 'summary-container';
  container.className = 'summary-container';
  const controls = document.getElementById('controls');
  if (controls && controls.parentNode) {
    controls.parentNode.insertBefore(container, controls);
    return container;
  }
  const content = document.getElementById('content');
  if (content) {
    content.prepend(container);
    return container;
  }
  document.body.prepend(container);
  return container;
}

function unwrapMaybe(value, depth = 0) {
  if (depth > 6) return value;
  if (value == null) return null;
  if (typeof value === 'string') {
    try { return unwrapMaybe(JSON.parse(value), depth + 1); } catch (_) { return value; }
  }
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') {
    if (value.data !== undefined) return unwrapMaybe(value.data, depth + 1);
    if (value.result !== undefined) return unwrapMaybe(value.result, depth + 1);
    if (value.payload !== undefined) return unwrapMaybe(value.payload, depth + 1);
    const keys = Object.keys(value);
    if (keys.length === 1) return unwrapMaybe(value[keys[0]], depth + 1);
  }
  return value;
}

function normalizeChartsSummary(raw) {
  const data = unwrapMaybe(raw);
  if (!data) return null;
  if (Array.isArray(data)) {
    if (data.length === 1) return normalizeChartsSummary(data[0]);
    const merged = {};
    data.forEach((item) => {
      if (!item || typeof item !== 'object') return;
      if (item.today) merged.today = item.today;
      if (item.day) merged.day = item.day;
      if (item.month) merged.month = item.month;
      if (item.monthSummary) merged.monthSummary = item.monthSummary;
      if (item.dateISO) merged.dateISO = item.dateISO;
      if (item.monthISO) merged.monthISO = item.monthISO;
    });
    return Object.keys(merged).length ? merged : null;
  }
  return data;
}

function normalizeDailyRow(row = {}) {
  return {
    brand: row.brand ?? row.store ?? row.shop ?? row.label ?? row.name ?? row.Store ?? row.Brand,
    count: row.count ?? row.qty ?? row.items ?? row.count_article,
    revenue: row.revenue ?? row.income ?? row.sum ?? row.sum_price ?? row.sum_finalPriceVND,
    profit: row.profit ?? row.margin ?? row.sum_Profit ?? row.sumProfit,
  };
}

function normalizeMonthCards(monthData) {
  if (!monthData) return [];
  if (Array.isArray(monthData.cards)) return monthData.cards;
  if (Array.isArray(monthData.sections)) return monthData.sections;
  if (Array.isArray(monthData)) return monthData;
  const cards = [];
  const candidates = [
    { key: 'income', title: 'Доход текущий месяц', tone: 'green' },
    { key: 'expenses', title: 'Расходы', tone: 'red' },
    { key: 'salary', title: 'Зарплата сотрудникам', tone: 'red' },
    { key: 'revenue', title: 'Выручка', tone: 'green' },
    { key: 'profit', title: 'Прибыль текущего месяца', tone: 'purple' },
  ];
  candidates.forEach((cfg) => {
    const block = monthData[cfg.key];
    if (!block) return;
    cards.push({
      title: block.title || cfg.title,
      total: block.total ?? block.value ?? block.amount,
      items: block.items || block.lines || block.rows || [],
      tone: block.tone || cfg.tone,
    });
  });
  return cards;
}

function renderSummary(summary) {
  const container = ensureSummaryContainer();
  container.innerHTML = '';

  if (!summary) {
    const msg = createEl('div', 'message error', 'Нет данных для сводки. Проверьте сервис getChartsSummary.');
    container.appendChild(msg);
    return;
  }

  const todayData = summary.today || summary.day || summary.daily || {};
  const rowsRaw = todayData.rows || todayData.items || todayData.lines || [];
  const rows = rowsRaw.map(normalizeDailyRow).filter((r) => r.brand || r.revenue || r.profit || r.count);
  const dateISO = todayData.dateISO || summary.dateISO || toISODate(new Date());

  if (rows.length) {
    const card = createEl('div', 'summary-card summary-card--blue');
    const title = createEl('div', 'summary-title', `Продажи сегодня ${formatDateRu(dateISO)}`);
    card.appendChild(title);

    const table = createEl('table', 'summary-table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const columns = [
      { key: 'brand', label: 'Бренд', fmt: (v) => v || '' },
      { key: 'count', label: 'Кол-во', fmt: formatInt, numeric: true },
      { key: 'revenue', label: 'Доход', fmt: formatMoney, numeric: true },
      { key: 'profit', label: 'Прибыль', fmt: formatMoney, numeric: true },
    ];
    const activeCols = columns.filter((col) => rows.some((r) => r[col.key] !== undefined && r[col.key] !== null && r[col.key] !== ''));
    activeCols.forEach((col) => {
      const th = document.createElement('th');
      th.textContent = col.label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const totals = { count: 0, revenue: 0, profit: 0 };
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      activeCols.forEach((col) => {
        const td = document.createElement('td');
        const value = r[col.key];
        if (col.numeric) td.classList.add('num');
        td.textContent = col.fmt(value);
        tr.appendChild(td);
        if (col.numeric && Number.isFinite(Number(value))) {
          totals[col.key] = (totals[col.key] || 0) + Number(value);
        }
      });
      tbody.appendChild(tr);
    });

    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    activeCols.forEach((col, idx) => {
      const td = document.createElement('td');
      if (idx === 0) {
        td.textContent = 'Итого';
      } else if (col.numeric) {
        td.classList.add('num');
        td.textContent = col.key === 'count' ? formatInt(totals.count) : formatMoney(totals[col.key]);
      } else {
        td.textContent = '';
      }
      totalRow.appendChild(td);
    });
    tbody.appendChild(totalRow);
    table.appendChild(tbody);
    card.appendChild(table);

    const marginPct = totals.revenue ? (totals.profit / totals.revenue) * 100 : null;
    if (Number.isFinite(marginPct)) {
      const marginRow = createEl('div', 'summary-item');
      marginRow.appendChild(createEl('div', 'label', 'Маржа'));
      marginRow.appendChild(createEl('div', 'value', `${marginPct.toFixed(0)}%`));
      const list = createEl('div', 'summary-list');
      list.appendChild(marginRow);
      card.appendChild(list);
    }

    container.appendChild(card);
  }

  const monthData = summary.monthSummary || summary.month || summary.monthly || (summary.cards ? summary : {});
  const cards = normalizeMonthCards(monthData);
  if (cards.length) {
    const row = createEl('div', 'summary-row');
    const header = createEl('div', 'summary-title', `Итоги месяца ${formatYmDisplay(monthData.monthISO || summary.monthISO || summary.ym || toYm(new Date()))}`);
    container.appendChild(header);
    cards.forEach((cardData) => {
      const tone = cardData.tone || '';
      const card = createEl('div', `summary-card${tone ? ` summary-card--${tone}` : ''}`);
      card.appendChild(createEl('div', 'summary-title', cardData.title || 'Блок'));
      if (cardData.total != null) {
        const totalRow = createEl('div', 'summary-total');
        totalRow.appendChild(createEl('div', 'label', 'Итого'));
        totalRow.appendChild(createEl('div', 'value', formatMoney(cardData.total)));
        card.appendChild(totalRow);
      }
      const items = cardData.items || [];
      if (items.length) {
        const list = createEl('div', 'summary-list');
        items.forEach((item) => {
          const rowEl = createEl('div', 'summary-item');
          rowEl.appendChild(createEl('div', 'label', item.label || item.title || item.name || ''));
          rowEl.appendChild(createEl('div', 'value', formatMoney(item.value ?? item.amount ?? item.total)));
          list.appendChild(rowEl);
        });
        card.appendChild(list);
      }
      row.appendChild(card);
    });
    container.appendChild(row);
  }
}

async function loadSummary() {
  const container = ensureSummaryContainer();
  container.innerHTML = '';
  if (!window.API || typeof window.API.getChartsSummary !== 'function') {
    const msg = createEl('div', 'message error', 'Сервис getChartsSummary не найден. Нужен новый endpoint.');
    container.appendChild(msg);
    return;
  }

  const now = new Date();
  const params = {
    action: 'getChartsSummary',
    visible: true,
    dateISO: toISODate(now),
    ym: toYm(now),
  };

  try {
    const raw = await window.API.getChartsSummary(params, { overlayId: "charts" });
    const summary = normalizeChartsSummary(raw);
    renderSummary(summary);
  } catch (e) {
    console.warn('Не удалось получить сводку charts', e);
    const msg = createEl('div', 'message error', 'Не удалось получить сводку. Проверьте сервис getChartsSummary.');
    container.appendChild(msg);
  }
}


// Конфигурация графиков
const chartConfigs = [
  {
    id: 'chartMonth',
    type: 'bar',
    title: 'Данные по месяцам',
    query: { action: 'getChartsData', groupByField: 'month_year', visible: true },
    labelProp: 'month_year',
    seriesProp: 'store',
    labelFmt: s => s || ''
  },
  {
    id: 'chartStore',
    type: 'bar',
    title: 'Данные по магазинам',
    query: { action: 'getChartsData', groupByField: 'store', visible: true },
    labelProp: 'store',
    seriesProp: 'month_year',
    labelFmt: s => s || ''
  }
];




function chartOptions(title) {
  return {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: title }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    interaction: {
      mode: 'nearest',
      intersect: true,
      axis: 'xy'
    },
    // 🔥 обработчик клика
    onClick(evt, elements, chart) {
      if (!elements.length) return;

      const el = elements[0];
      const dataset = chart.data.datasets[el.datasetIndex];
      const value = dataset.data[el.index];
      const label = chart.data.labels[el.index];
      const series = dataset.label;

      onChartClick({
        chartType: chart.config.type,
        chartTitle: chart.options.plugins.title.text,
        value,
        label,
        series
      });
    }
  };
}



/*
function resetZoomAll() {
  Chart.instances && Object.values(Chart.instances).forEach(chart => {
    if (chart.resetZoom) chart.resetZoom();
  });
}
*/

// Создание графика
function createChart(type, labels, data, title, containerId) {
  const canvas = document.createElement("canvas");
  const wrapper = document.createElement("div");
  wrapper.className = "chart-wrapper";
  wrapper.appendChild(canvas);
  document.getElementById(containerId).appendChild(wrapper);

  return new Chart(canvas, {
    type: type,
    data: {
      labels: labels,
      datasets: data
    },
    options: chartOptions(title)
  });
}



// Формируем матрицы
function toChartMatrix(source, {
  labelProp = 'month_year',
  seriesProp = 'store',
  valueFields,
  labelFormatter = v => v
} = {}) {
  const labels = source.map(m => labelFormatter(m[labelProp]));
  const seriesSet = new Set();
  for (const m of source) {
    for (const it of m.items ?? []) {
      if (it && it[seriesProp] != null) seriesSet.add(it[seriesProp]);
    }
  }
  const seriesLabels = [...seriesSet];

  if (!valueFields) {
    const numeric = new Set();
    for (const m of source) {
      for (const it of m.items ?? []) {
        for (const [k, v] of Object.entries(it)) {
          if (k === seriesProp) continue;
          const isNum = typeof v === 'number' ||
                        (typeof v === 'string' && v.trim() !== '' && !isNaN(+v));
          if (isNum) numeric.add(k);
        }
      }
    }
    valueFields = [...numeric];
  }

  const matrices = {};
  for (const field of valueFields) {
    matrices[field] = seriesLabels.map(() => Array(labels.length).fill(null));
  }

  source.forEach((block, colIdx) => {
    (block.items ?? []).forEach(it => {
      const rowIdx = seriesLabels.indexOf(it[seriesProp]);
      if (rowIdx === -1) return;
      for (const field of valueFields) {
        const raw = it[field];
        const num = typeof raw === 'number'
          ? raw
          : (typeof raw === 'string' && raw.trim() !== '' ? +raw : null);
        if (num != null && !Number.isNaN(num)) {
          matrices[field][rowIdx][colIdx] = num;
        }
      }
    });
  });

  return { labels, seriesLabels, matrices };
}

function onChartClick(info) {
  console.log('Клик по точке графика:', info);
  // можно: открыть модалку, вызвать webhook, отфильтровать что-то и т.д.
}

// Асинхронная отрисовка всех графиков
async function renderCharts(valueField) {
  const container = document.getElementById('charts-container');
  container.innerHTML = ''; // очистить перед перерисовкой

  const charts = await Promise.all(chartConfigs.map(async cfg => {
    const rawData = await window.API.getChartsData(cfg.query, { overlayId: "charts" });

    const { labels, seriesLabels, matrices } = toChartMatrix(rawData, {
      labelProp: cfg.labelProp,
      seriesProp: cfg.seriesProp,
      labelFormatter: cfg.labelFmt,
      valueFields: [valueField]
    });

    if (!matrices[valueField]) {
      console.warn(`[${cfg.title}] Колонка ${valueField} не найдена`);
      return null;
    }

    const datasets = seriesLabels.map((series, row) => ({
      label: series,
      data: matrices[valueField][row].map(v => v ?? 0),
      backgroundColor: bgColor[row % bgColor.length],
      borderColor: bgColor[row % bgColor.length],
      borderWidth: 2
    }));

    return createChart(cfg.type, labels, datasets, cfg.title, 'charts-container');
  }));

  return charts.filter(Boolean);
}

// Селектор поля детализации
function createFieldSelector() {
  const select = document.createElement('select');
  select.id = 'field-selector';
  select.style.marginBottom = '20px';

  availableFields.forEach(field => {
    const opt = document.createElement('option');
    opt.value = field;
    opt.textContent = field;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    renderCharts(select.value);
  });

  document.getElementById('controls').appendChild(select);
}

function boot() {
  loadSummary();
  if (typeof Chart === "undefined") {
    const msg = "Chart.js не загружен (ожидался через system/pageConfig.js).";
    console.error(msg);
    if (typeof showErrorPopup === "function") showErrorPopup(msg);
    return;
  }
  createFieldSelector();
  renderCharts(availableFields[0]);
}

if (typeof registerPageInit === "function") {
  registerPageInit("charts", boot);
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
