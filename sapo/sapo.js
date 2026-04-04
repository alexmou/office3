const SAPO_UI_LOCALE = String(window.APP_LANG || window.CONFIG?.APP_LANG || "ru").toLowerCase().startsWith("en")
  ? "en-US"
  : "ru-RU";

const SAPO_STATE = {
  loading: false,
  orders: [],
};

function sapoEscapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sapoShowStatus(message, tone = "info") {
  const node = document.getElementById("sapo-status");
  if (!node) return;
  node.innerHTML = "";
  if (!message) return;
  node.innerHTML = `<div class="sapo-status__msg ${sapoEscapeHtml(tone)}">${sapoEscapeHtml(message)}</div>`;
}

function sapoToggleLoading(isLoading) {
  SAPO_STATE.loading = !!isLoading;
  const btn = document.getElementById("sapo-refresh-btn");
  if (!btn) return;
  btn.disabled = SAPO_STATE.loading;
  btn.textContent = SAPO_STATE.loading ? "Обновляю..." : "Обновить";
}

function sapoParseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function sapoStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sapoWithinLast5Days(date) {
  if (!date) return false;
  const now = new Date();
  const start = sapoStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4));
  return date >= start;
}

function sapoGetOrderDate(order) {
  return (
    sapoParseDate(order.created_on) ||
    sapoParseDate(order.processed_on) ||
    sapoParseDate(order.confirmed_on) ||
    sapoParseDate(order.closed_on)
  );
}

function sapoExtractOrders(raw) {
  if (Array.isArray(raw?.orders)) {
    return raw.orders.filter((order) => order && typeof order === "object");
  }

  const base = (() => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.result)) return raw.result;
    if (Array.isArray(raw?.payload)) return raw.payload;
    return [];
  })();

  const groupedOrders = base
    .flatMap((entry) => {
      const value = entry?.json ? entry.json : entry;
      if (Array.isArray(value?.orders)) return value.orders;
      if (value && typeof value === "object" && value.id) return [value];
      return [];
    })
    .filter((order) => order && typeof order === "object");

  return groupedOrders;
}

function sapoFormatDate(date) {
  if (!date) return "—";
  return date.toLocaleString(SAPO_UI_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sapoFormatMoney(value, currency = "VND") {
  const number = Number(value || 0);
  return Number.isFinite(number)
    ? number.toLocaleString(SAPO_UI_LOCALE, { maximumFractionDigits: 0 }) + ` ${currency || "VND"}`
    : "—";
}

function sapoBuildShell() {
  const root = document.getElementById("sapo-root");
  if (!root) return;

  root.innerHTML = `
    <section class="sapo-page">
      <article class="sapo-card">
        <div class="sapo-head">
          <div>
            <h1>Sapo: продажи за последние 5 дней</h1>
            <p class="sapo-sub">Источник данных: n8n endpoint <code>/webhook/sapo</code> (без входных параметров).</p>
          </div>
          <button id="sapo-refresh-btn" class="sapo-button" type="button">Обновить</button>
        </div>
        <div id="sapo-status" class="sapo-status"></div>
      </article>

      <article class="sapo-card">
        <div id="sapo-summary" class="sapo-summary"></div>
      </article>

      <article class="sapo-card">
        <h2>Список продаж</h2>
        <div class="sapo-table-wrap">
          <table class="sapo-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Заказ</th>
                <th>Источник</th>
                <th>Оплата</th>
                <th>Статус</th>
                <th class="num">Сумма</th>
              </tr>
            </thead>
            <tbody id="sapo-orders-tbody"></tbody>
          </table>
        </div>
      </article>
    </section>
  `;
}

function sapoRender() {
  const tbody = document.getElementById("sapo-orders-tbody");
  const summary = document.getElementById("sapo-summary");
  if (!tbody || !summary) return;

  const orders = SAPO_STATE.orders;
  const paidCount = orders.filter((order) => String(order.financial_status || "").toLowerCase() === "paid").length;
  const totalAmount = orders.reduce((sum, order) => {
    const val = Number(order.total_line_items_price || order.total_price || order.subtotal_price || 0);
    return sum + (Number.isFinite(val) ? val : 0);
  }, 0);

  summary.innerHTML = `
    <div class="sapo-kpi">
      <span class="sapo-kpi__label">Продаж за 5 дней</span>
      <strong class="sapo-kpi__value">${orders.length}</strong>
    </div>
    <div class="sapo-kpi">
      <span class="sapo-kpi__label">Оплаченных заказов</span>
      <strong class="sapo-kpi__value">${paidCount}</strong>
    </div>
    <div class="sapo-kpi">
      <span class="sapo-kpi__label">Сумма (если есть в ответе)</span>
      <strong class="sapo-kpi__value">${sapoFormatMoney(totalAmount, "VND")}</strong>
    </div>
  `;

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="sapo-empty">Нет продаж за последние 5 дней.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders
    .map((order) => {
      const date = sapoGetOrderDate(order);
      const amount = order.total_line_items_price || order.total_price || order.subtotal_price;
      return `
        <tr>
          <td>${sapoEscapeHtml(sapoFormatDate(date))}</td>
          <td>
            <div>${sapoEscapeHtml(order.name || `#${order.order_number || order.number || order.id || "—"}`)}</div>
            <small class="sapo-muted">ID: ${sapoEscapeHtml(order.id || "—")}</small>
          </td>
          <td>${sapoEscapeHtml(order.source_name || order.source || "—")}</td>
          <td>${sapoEscapeHtml(order.gateway || "—")}</td>
          <td>${sapoEscapeHtml(order.financial_status || order.status || "—")}</td>
          <td class="num">${sapoEscapeHtml(sapoFormatMoney(amount, order.currency || "VND"))}</td>
        </tr>
      `;
    })
    .join("");
}

async function sapoLoadOrders() {
  if (!window.API || typeof window.API.getSapoOrders !== "function") {
    throw new Error("Сервис getSapoOrders недоступен");
  }

  sapoToggleLoading(true);
  sapoShowStatus("Загружаю продажи из Sapo...", "info");

  try {
    const raw = await window.API.getSapoOrders({ action: "getSapoOrders" }, { overlayId: "sapo" });
    const allOrders = sapoExtractOrders(raw);
    if (!allOrders.length && raw && typeof raw === "object" && raw.message) {
      throw new Error(`Sapo endpoint вернул: ${raw.message}. Проверьте, что workflow отвечает данными, а не только сообщением о запуске.`);
    }
    SAPO_STATE.orders = allOrders
      .filter((order) => sapoWithinLast5Days(sapoGetOrderDate(order)))
      .sort((a, b) => {
        const da = sapoGetOrderDate(a)?.getTime() || 0;
        const db = sapoGetOrderDate(b)?.getTime() || 0;
        return db - da;
      });

    sapoRender();
    sapoShowStatus(`Загружено ${SAPO_STATE.orders.length} продаж за последние 5 дней.`, "success");
  } finally {
    sapoToggleLoading(false);
  }
}

function sapoBindEvents() {
  const btn = document.getElementById("sapo-refresh-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await sapoLoadOrders();
    } catch (error) {
      console.error("Failed to load Sapo orders", error);
      sapoShowStatus(error?.message || "Не удалось загрузить продажи Sapo", "error");
    }
  });
}

async function sapoBoot() {
  sapoBuildShell();
  sapoBindEvents();
  try {
    await sapoLoadOrders();
  } catch (error) {
    console.error("Sapo page initialization failed", error);
    sapoShowStatus(error?.message || "Не удалось инициализировать страницу Sapo", "error");
  }
}

if (typeof registerPageInit === "function") {
  registerPageInit("sapo", sapoBoot);
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", sapoBoot);
} else {
  sapoBoot();
}
