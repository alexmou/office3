const SUPPLIERS_LANG = String(window.APP_LANG || window.CONFIG?.APP_LANG || "en").toLowerCase();
const SUPPLIERS_LOCALE = SUPPLIERS_LANG.startsWith("ru") ? "ru-RU" : "en-US";
const DEFAULT_INTERNAL_BRANDS = ["button rouge", "button rouge2", "button rouge 2"];

const suppliersState = {
  rows: [],
  chart: null,
  payingActions: new Set()
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = String(text);
  return el;
}

function normalizeBrandLabel(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeBrandKey(value) {
  return normalizeBrandLabel(value).toLowerCase();
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const compact = String(value).trim().replace(/[\s\u00A0]+/g, "");
  let normalized = compact;

  // 1,234,567.89 -> 1234567.89
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(compact)) {
    normalized = compact.replace(/,/g, "");
  // 1.234.567,89 -> 1234567.89
  } else if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(compact)) {
    normalized = compact.replace(/\./g, "").replace(",", ".");
  // 123,45 -> 123.45
  } else if (compact.includes(",") && !compact.includes(".")) {
    normalized = compact.replace(",", ".");
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

function getSupplierPaymentState(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["done", "paid", "1", "true", "yes", "ok"].includes(normalized)) return "paid";
  return "unpaid";
}

function isSupplierPaymentDone(value) {
  return getSupplierPaymentState(value) === "paid";
}

function isSupplierPaymentUnpaid(value) {
  return getSupplierPaymentState(value) === "unpaid";
}

function resolveAmountToSupplier(row) {
  const directAmount = parseNumber(row.AmountToSupplier);
  if (directAmount > 0) return directAmount;

  const finalPrice = parseNumber(row.finalPriceVND ?? row.sum_finalPriceVND);
  const profit = parseNumber(row.Profit ?? row.sum_Profit ?? row.profit);
  const salary = parseNumber(row.salary ?? row.sum_salary);
  const terminal = parseNumber(row.Terminal ?? row.sum_Terminal);
  const derivedAmount = finalPrice - profit - salary - terminal;

  return derivedAmount > 0 ? derivedAmount : directAmount;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString(SUPPLIERS_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function formatCount(value) {
  return Math.round(Number(value || 0)).toLocaleString(SUPPLIERS_LOCALE);
}

function formatMonthLabel(monthISO) {
  if (!monthISO) return "Без месяца";
  const [year, month] = String(monthISO).split("-").map(Number);
  if (!year || !month) return monthISO;
  return new Date(year, month - 1, 1).toLocaleDateString(SUPPLIERS_LOCALE, {
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

function getPreviousMonthISO() {
  const now = new Date();
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${previousMonthDate.getFullYear()}-${pad2(previousMonthDate.getMonth() + 1)}`;
}

function resolveConfigBrandList() {
  const raw =
    window.CONFIG?.SUPPLIERS_INTERNAL_BRANDS ??
    window.CONFIG?.SUPPLIERS_EXCLUDED_BRANDS ??
    window.CONFIG?.INTERNAL_BRANDS ??
    window.CONFIG?.internalBrands ??
    window.CONFIG?.supplierInternalBrands;

  if (Array.isArray(raw)) {
    return raw.map((item) => normalizeBrandKey(item)).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,\n;]/)
      .map((item) => normalizeBrandKey(item))
      .filter(Boolean);
  }
  return DEFAULT_INTERNAL_BRANDS;
}

function parseDateString(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const dotMatch = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dotMatch) return `${dotMatch[3]}-${pad2(dotMatch[2])}-${pad2(dotMatch[1])}`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
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

function extractRows(raw) {
  const data = unwrapMaybe(raw);
  if (!Array.isArray(data)) return [];
  return data
    .map((entry) => (entry && typeof entry === "object" && entry.json ? entry.json : entry))
    .filter((entry) => entry && typeof entry === "object");
}

function normalizeMonthToken(token) {
  const map = {
    янв: "01",
    фев: "02",
    мар: "03",
    апр: "04",
    май: "05",
    июн: "06",
    июл: "07",
    авг: "08",
    сен: "09",
    сент: "09",
    окт: "10",
    ноя: "11",
    дек: "12",
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
  };
  return map[String(token || "").trim().toLowerCase()] || "";
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

function normalizeRow(row, index) {
  const dateISO = parseDateString(row.dateISO || row.date || row.Date || row.dateConverted);
  const monthISO = resolveMonthISO(row, dateISO);
  const store = String(row.store || row.Store || row.shop || "").trim();
  const fallbackBrand = normalizeBrandLabel(row.brand);
  const primaryBrand = normalizeBrandLabel(row.Brand || row.brandName || row.brand_title || "");
  const brand = primaryBrand || (fallbackBrand && fallbackBrand !== store ? fallbackBrand : "");
 // const basketId = String(row.basketid || row.basketId || row.BasketId || "").trim();
    const basketId = String(row.Id).trim();
  const article = String(row.article || row.Article || "").trim();
  const doneValue = row.done ?? row.Done ?? row.isDone ?? row.paid ?? row.Paid ?? "";

  return {
    id: basketId || `${monthISO || "no-month"}-${brand || "no-brand"}-${article || "no-article"}-${index}`,
    monthISO,
    dateISO,
    brand,
    brandKey: normalizeBrandKey(brand),
    store,
    article,
    basketId,
    doneValue,
    paymentState: getSupplierPaymentState(doneValue),
    done: isSupplierPaymentDone(doneValue),
    unpaid: isSupplierPaymentUnpaid(doneValue),
    amountToSupplier: resolveAmountToSupplier(row),
    source: { ...row }
  };
}

function sumAmount(rows) {
  return rows.reduce((sum, row) => sum + row.amountToSupplier, 0);
}

function groupRows(rows, keyFn) {
  const map = new Map();
  rows.forEach((row) => {
    const key = keyFn(row);
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  });
  return [...map.entries()].map(([key, items]) => ({ key, items }));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSupplierPaymentPayload(brand, supplierRows, periodMeta) {
  const rows = supplierRows.map((row) => ({
    id: row.id,
    basketid: row.basketId || row.source?.basketid || row.source?.basketId || "",
    article: row.article || row.source?.article || row.source?.Article || "",
    brand: row.brand,
    store: row.store,
    date: row.source?.date || row.source?.Date || row.dateISO,
    dateISO: row.dateISO,
    monthISO: row.monthISO,
    amountToSupplier: row.amountToSupplier,
    done: row.doneValue ?? "",
    nextDone: "done"
  }));

  return {
    action: "markSupplierPaymentsDone",
    token: window.token || "",
    supplier: brand,
    monthISO: periodMeta.monthISO || "",
    period: periodMeta.period,
    done: "done",
    sales: rows,
    unpaidSales: rows.filter((row) => isSupplierPaymentUnpaid(row.done))
  };
}

function getPayingActionKey(brandKey, period) {
  return `${brandKey || ""}::${period || ""}`;
}

function resolvePeriodMeta(period, currentMonthISO, previousMonthISO) {
  if (period === "current") {
    return {
      period: "current",
      monthISO: currentMonthISO,
      title: `текущий месяц (${formatMonthLabel(currentMonthISO)})`
    };
  }
  return {
    period: "previous",
    monthISO: previousMonthISO,
    title: "долг прошлых периодов"
  };
}

async function markSupplierAsPaid(brand, brandKey, period) {
  if (!brand) return;
  if (!["previous", "current"].includes(period)) {
    throw new Error("Неизвестный период оплаты");
  }
  const actionKey = getPayingActionKey(brandKey, period);
  if (suppliersState.payingActions.has(actionKey)) return;
  if (!window.API || typeof window.API.markSupplierPaymentsDone !== "function") {
    throw new Error("Сервис markSupplierPaymentsDone недоступен");
  }

  const currentMonthISO = getCurrentMonthISO();
  const previousMonthISO = getPreviousMonthISO();
  const periodMeta = resolvePeriodMeta(period, currentMonthISO, previousMonthISO);
  const supplierRows = suppliersState.rows.filter((row) => (
    row.brandKey === brandKey
    && row.amountToSupplier > 0
    && (period === "previous" ? row.monthISO < currentMonthISO : row.monthISO === currentMonthISO)
  ));
  const targetRows = supplierRows.filter((row) => row.unpaid);
  if (!targetRows.length) {
    throw new Error(`Для ${brand} нет неоплаченных строк: ${periodMeta.title}`);
  }

  const payload = buildSupplierPaymentPayload(brand, targetRows, periodMeta);
  suppliersState.payingActions.add(actionKey);
  renderDashboard();
  showStatus(`Отправляю webhook оплаты для ${brand}: ${periodMeta.title}...`);

  try {
    const response = await window.API.markSupplierPaymentsDone(payload, {
      overlayId: "suppliers",
      responseType: "blob",
      download: true
    });

    if (!response) {
      throw new Error(`suppliers webhook не подтвердил оплату для ${brand}`);
    }

    suppliersState.rows = suppliersState.rows.map((row) => (
      row.brandKey === brandKey
      && row.unpaid
      && row.amountToSupplier > 0
      && (period === "previous" ? row.monthISO < currentMonthISO : row.monthISO === currentMonthISO)
        ? {
            ...row,
            doneValue: "done",
            paymentState: "paid",
            done: true,
            unpaid: false,
            source: { ...row.source, done: "done" }
          }
        : row
    ));

    const downloadedFileName = response?.fileName ? ` Файл: ${response.fileName}.` : "";
    showStatus(`Оплата для ${brand} отправлена (${periodMeta.title}). Отчет скачан.${downloadedFileName} Локальная таблица обновлена.`, "info");
    renderDashboard();
  } finally {
    suppliersState.payingActions.delete(actionKey);
    renderDashboard();
  }
}

function bindPaymentButtons() {
  document.querySelectorAll("[data-supplier-pay]").forEach((button) => {
    button.addEventListener("click", async () => {
      const brand = button.getAttribute("data-supplier-pay");
      const brandKey = button.getAttribute("data-supplier-key");
      const period = button.getAttribute("data-supplier-period");
      try {
        await markSupplierAsPaid(brand, brandKey, period);
      } catch (error) {
        console.error("Не удалось отметить оплату поставщику", error);
        showStatus(error?.message || "Не удалось отправить webhook оплаты.", "error");
      }
    });
  });
}

function destroyChart() {
  if (suppliersState.chart && typeof suppliersState.chart.destroy === "function") {
    suppliersState.chart.destroy();
  }
  suppliersState.chart = null;
}

function showStatus(message, tone = "info") {
  const node = document.getElementById("suppliers-status");
  if (!node) return;
  node.innerHTML = "";
  if (!message) return;
  const msg = createEl("div", `suppliers-message ${tone}`, message);
  node.appendChild(msg);
}

function buildShell() {
  const root = document.getElementById("suppliers-root");
  if (!root) return;
  root.innerHTML = `
    <div class="suppliers-page">
      <section class="suppliers-hero">
        <div class="suppliers-kicker">suppliers</div>
        <h1>Выплаты поставщикам по месяцам и текущий долг</h1>
        <p>Поставщики считаются по брендам, исключая внутренние бренды вроде Button Rouge. Для каждого месяца показываются оплаченные и неоплаченные суммы, а открытый долг отдельно разделен на накопительный с прошлых месяцев и долг текущего месяца.</p>
      </section>
      <div id="suppliers-status" class="suppliers-status"></div>
      <section id="suppliers-content" class="suppliers-page"></section>
    </div>
  `;
}

function renderDashboard() {
  const content = document.getElementById("suppliers-content");
  if (!content) return;

  const excludedBrands = resolveConfigBrandList();
  const supplierRows = suppliersState.rows.filter((row) => {
    if (row.amountToSupplier <= 0) return false;
    if (row.brandKey && excludedBrands.includes(row.brandKey)) return false;
    return true;
  });

  const monthBuckets = groupRows(supplierRows, (row) => row.monthISO)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((bucket) => {
      const paid = bucket.items.filter((row) => row.done);
      const unpaid = bucket.items.filter((row) => row.unpaid);
      return {
        key: bucket.key,
        paidTotal: sumAmount(paid),
        unpaidTotal: sumAmount(unpaid),
        items: bucket.items
      };
    });

  const currentMonthISO = getCurrentMonthISO();
  const allDebtRows = supplierRows.filter((row) => row.unpaid);
  const openDebtByBrand = groupRows(allDebtRows, (row) => row.brandKey || "Без бренда")
    .map((bucket) => {
      const previous = bucket.items.filter((row) => row.monthISO < currentMonthISO);
      const current = bucket.items.filter((row) => row.monthISO === currentMonthISO);
      const label = bucket.items.find((row) => row.brand)?.brand || "Без бренда";
      return {
        key: bucket.key,
        label,
        stores: [...new Set(bucket.items.map((row) => row.store).filter(Boolean))].sort(),
        unpaidCount: bucket.items.length,
        previousUnpaidCount: previous.length,
        currentUnpaidCount: current.length,
        previousTotal: sumAmount(previous),
        currentTotal: sumAmount(current),
        total: sumAmount(bucket.items),
        isPayingPrevious: suppliersState.payingActions.has(getPayingActionKey(bucket.key, "previous")),
        isPayingCurrent: suppliersState.payingActions.has(getPayingActionKey(bucket.key, "current")),
        canPayPrevious: bucket.items.every((row) => row.brand) && previous.length > 0,
        canPayCurrent: bucket.items.every((row) => row.brand) && current.length > 0
      };
    })
    .sort((a, b) => b.total - a.total);

  const currentMonthBucket = monthBuckets.find((bucket) => bucket.key === currentMonthISO) || {
    paidTotal: 0,
    unpaidTotal: 0
  };
  const previousUnpaidTotal = monthBuckets
    .filter((bucket) => bucket.key < currentMonthISO)
    .reduce((sum, bucket) => sum + bucket.unpaidTotal, 0);
  const debtTablePreviousTotal = openDebtByBrand.reduce((sum, bucket) => sum + bucket.previousTotal, 0);
  const debtTableCurrentTotal = openDebtByBrand.reduce((sum, bucket) => sum + bucket.currentTotal, 0);
  const debtTableGrandTotal = openDebtByBrand.reduce((sum, bucket) => sum + bucket.total, 0);

  const totals = {
    paid: monthBuckets.reduce((sum, bucket) => sum + bucket.paidTotal, 0),
    unpaid: monthBuckets.reduce((sum, bucket) => sum + bucket.unpaidTotal, 0),
    currentPaid: currentMonthBucket.paidTotal,
    previousUnpaid: previousUnpaidTotal,
    currentUnpaid: currentMonthBucket.unpaidTotal,
    debtTablePrevious: debtTablePreviousTotal,
    debtTableCurrent: debtTableCurrentTotal,
    debtTableGrand: debtTableGrandTotal,
    brands: [...new Set(supplierRows.map((row) => row.brandKey).filter(Boolean))].length
  };

  content.innerHTML = `
    <div class="suppliers-grid">
      <article class="suppliers-card">
        <div class="suppliers-card__eyebrow">Оплачено за весь период</div>
        <div class="suppliers-card__value">${formatMoney(totals.paid)}</div>
        <div class="suppliers-card__sub">Сумма строк с признаком \`done\`</div>
      </article>
      <article class="suppliers-card">
        <div class="suppliers-card__eyebrow">Открытый долг всего</div>
        <div class="suppliers-card__value">${formatMoney(totals.unpaid)}</div>
        <div class="suppliers-card__sub">Открытый долг по всем месяцам</div>
      </article>
      <article class="suppliers-card">
        <div class="suppliers-card__eyebrow">Накопительный долг прошлых месяцев</div>
        <div class="suppliers-card__value">${formatMoney(totals.previousUnpaid)}</div>
        <div class="suppliers-card__sub">Все неоплаченные суммы до начала ${formatMonthLabel(currentMonthISO)}</div>
      </article>
      <article class="suppliers-card">
        <div class="suppliers-card__eyebrow">Факт текущего месяца</div>
        <div class="suppliers-card__value">${formatMoney(totals.currentPaid)}</div>
        <div class="suppliers-card__sub">Оплаченные поставщикам суммы за ${formatMonthLabel(currentMonthISO)}</div>
      </article>
      <article class="suppliers-card">
        <div class="suppliers-card__eyebrow">Долг текущего месяца</div>
        <div class="suppliers-card__value">${formatMoney(totals.currentUnpaid)}</div>
        <div class="suppliers-card__sub">${formatMonthLabel(currentMonthISO)}</div>
      </article>
      <article class="suppliers-card">
        <div class="suppliers-card__eyebrow">Брендов-поставщиков</div>
        <div class="suppliers-card__value">${formatCount(totals.brands)}</div>
        <div class="suppliers-card__sub">Исключены: ${excludedBrands.join(", ")}</div>
      </article>
    </div>
    <article class="suppliers-card">
      <div class="suppliers-meta">
        <span>Месяцев в статистике: ${formatCount(monthBuckets.length)}</span>
        <span>Текущий месяц: ${formatMonthLabel(currentMonthISO)}</span>
        <span>Дней в текущем месяце: ${getDaysInMonth(currentMonthISO)}</span>
      </div>
    </article>
    <article class="suppliers-card suppliers-figure">
      <h2>Оплачено и не оплачено по месяцам</h2>
      <p class="suppliers-card__eyebrow">Stacked bar по выплатам брендам-поставщикам</p>
      <canvas id="suppliers-months-canvas"></canvas>
    </article>
    <article class="suppliers-card">
      <h2>Помесячная таблица</h2>
      <div class="suppliers-table-wrap">
        <table class="suppliers-table">
          <thead>
            <tr>
              <th>Месяц</th>
              <th class="num">Оплачено</th>
              <th class="num">Не оплачено</th>
            </tr>
          </thead>
          <tbody>
            ${monthBuckets.map((bucket) => `
              <tr>
                <td>${formatMonthLabel(bucket.key)}</td>
                <td class="num">${formatMoney(bucket.paidTotal)}</td>
                <td class="num">${formatMoney(bucket.unpaidTotal)}</td>
              </tr>
            `).join("")}
            <tr class="is-total">
              <td>Итого</td>
              <td class="num">${formatMoney(totals.paid)}</td>
              <td class="num">${formatMoney(totals.unpaid)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
    <article class="suppliers-card suppliers-figure">
      <h2>Открытый долг по брендам</h2>
      <p class="suppliers-card__eyebrow">Разделение на накопительный долг прошлых месяцев и ${formatMonthLabel(currentMonthISO)}</p>
      <canvas id="suppliers-current-debt-canvas"></canvas>
    </article>
    <article class="suppliers-card">
      <h2>Бренды в долге</h2>
      <div class="suppliers-table-wrap">
        <table class="suppliers-table">
          <thead>
            <tr>
              <th>Бренд</th>
              <th class="num">Прошлые месяцы</th>
              <th class="num">Текущий месяц</th>
              <th class="num">Всего</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            ${openDebtByBrand.map((bucket) => `
              <tr>
                <td>${escapeHtml(bucket.label)}</td>
                <td class="num">${formatMoney(bucket.previousTotal)}</td>
                <td class="num">${formatMoney(bucket.currentTotal)}</td>
                <td class="num">${formatMoney(bucket.total)}</td>
                <td>
                  <div class="suppliers-action-group">
                    <div class="suppliers-action-row">
                      <span class="suppliers-action-label">Долг</span>
                      <button
                        type="button"
                        class="suppliers-action-btn"
                        data-supplier-pay="${escapeHtml(bucket.label)}"
                        data-supplier-key="${escapeHtml(bucket.key)}"
                        data-supplier-period="previous"
                        ${bucket.isPayingPrevious || !bucket.canPayPrevious ? "disabled" : ""}
                        title="${bucket.canPayPrevious ? `Неоплаченных строк: ${formatCount(bucket.previousUnpaidCount)}` : "Нет долга прошлых периодов"}"
                      >
                        ${bucket.isPayingPrevious ? "Отправка..." : "Оплатить"}
                      </button>
                    </div>
                    <div class="suppliers-action-row">
                      <span class="suppliers-action-label">Текущий</span>
                      <button
                        type="button"
                        class="suppliers-action-btn suppliers-action-btn--current"
                        data-supplier-pay="${escapeHtml(bucket.label)}"
                        data-supplier-key="${escapeHtml(bucket.key)}"
                        data-supplier-period="current"
                        ${bucket.isPayingCurrent || !bucket.canPayCurrent ? "disabled" : ""}
                        title="${bucket.canPayCurrent ? `Неоплаченных строк: ${formatCount(bucket.currentUnpaidCount)}` : "Нет долга текущего месяца"}"
                      >
                        ${bucket.isPayingCurrent ? "Отправка..." : "Оплатить"}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            `).join("")}
            <tr class="is-total">
              <td>Итого</td>
              <td class="num">${formatMoney(totals.debtTablePrevious)}</td>
              <td class="num">${formatMoney(totals.debtTableCurrent)}</td>
              <td class="num">${formatMoney(totals.debtTableGrand)}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  `;

  destroyChart();

  const monthChart = new Chart(document.getElementById("suppliers-months-canvas"), {
    type: "bar",
    data: {
      labels: monthBuckets.map((bucket) => formatMonthLabel(bucket.key)),
      datasets: [
        {
          label: "Оплачено",
          data: monthBuckets.map((bucket) => bucket.paidTotal),
          backgroundColor: "rgba(42, 157, 143, 0.78)",
          borderRadius: 10
        },
        {
          label: "Не оплачено",
          data: monthBuckets.map((bucket) => bucket.unpaidTotal),
          backgroundColor: "rgba(231, 111, 81, 0.78)",
          borderRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        tooltip: {
          backgroundColor: "rgba(20, 33, 61, 0.94)",
          callbacks: {
            label(context) {
              return `${context.dataset.label}: ${formatMoney(context.parsed.y)} VND`;
            }
          }
        },
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            font: {
              size: 13,
              weight: "700"
            }
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });

  const debtChart = new Chart(document.getElementById("suppliers-current-debt-canvas"), {
    type: "bar",
    data: {
      labels: openDebtByBrand.map((bucket) => bucket.label),
      datasets: [
        {
          label: "Прошлые месяцы",
          data: openDebtByBrand.map((bucket) => bucket.previousTotal),
          backgroundColor: "rgba(231, 111, 81, 0.78)",
          borderRadius: 10
        },
        {
          label: "Текущий месяц",
          data: openDebtByBrand.map((bucket) => bucket.currentTotal),
          backgroundColor: "rgba(244, 162, 97, 0.85)",
          borderRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        tooltip: {
          backgroundColor: "rgba(20, 33, 61, 0.94)",
          callbacks: {
            label(context) {
              return `${context.label}: ${formatMoney(context.parsed.y)} VND`;
            }
          }
        },
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            font: {
              size: 13,
              weight: "700"
            }
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });

  suppliersState.chart = {
    destroy() {
      monthChart.destroy();
      debtChart.destroy();
    }
  };

  bindPaymentButtons();
}

async function loadRows() {
  if (!window.API || typeof window.API.getSuppliersData !== "function") {
    throw new Error("Сервис getSuppliersData недоступен");
  }
  const raw = await window.API.getSuppliersData({
    action: "getSuppliersData",
    groupByField: "",
    visible: true
  }, { overlayId: "Suppliers" });

  const rows = extractRows(raw).map(normalizeRow).filter((row) => row.monthISO);
  if (!rows.length) {
    throw new Error("Нет данных для страницы поставщиков");
  }
  return rows.sort((a, b) => `${a.monthISO}-${a.brand}`.localeCompare(`${b.monthISO}-${b.brand}`));
}

async function boot() {
  buildShell();
  showStatus("Загружаю данные поставщиков...");

  if (typeof Chart === "undefined") {
    showStatus("Chart.js не загружен.", "error");
    return;
  }

  try {
    suppliersState.rows = await loadRows();
    showStatus("");
    renderDashboard();
  } catch (error) {
    console.error("Не удалось загрузить suppliers", error);
    showStatus(error?.message || "Не удалось загрузить данные поставщиков.", "error");
  }
}

if (typeof registerPageInit === "function") {
  registerPageInit("suppliers", boot);
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
