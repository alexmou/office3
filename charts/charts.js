
WEBHOOK = 'https://buttonrouge.org/n8n/webhook/';
//WEBHOOK = 'https://buttonrouge.org/n8n/webhook-test/';

const bgColor = [
  'rgba(30, 119, 182, 0.4)',
  'rgba(255, 127, 14, 0.4)',
  'rgba(44, 160, 44, 0.4)',
  'rgba(214, 39, 40, 0.4)',
  'rgba(148, 103, 189, 0.4)'
];

// Поддерживаемые метрики
const availableFields = ['sum_finalPriceVND', 'sum_price', 'sum_discount','count_article', "sum_amount_to_supplier",	"sum_Profit","count_article"];


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
    const rawData = await getDataFromN8n('charts', { data: { query: cfg.query } });

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
  if (typeof Chart === "undefined") {
    const msg = "Chart.js не загружен (ожидался через system/pageConfig.js).";
    console.error(msg);
    if (typeof showErrorPopup === "function") showErrorPopup(msg);
    return;
  }
  createFieldSelector();
  renderCharts(availableFields[0]);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
