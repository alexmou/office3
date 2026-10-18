(function () {
  const PAGE_ID = "budget";
  const API_OVERLAY = "budget";
  // ?budgetEndpoint=<webhook> перенаправляет запросы страницы на другой webhook (для тестов).
  const ENDPOINT = new URLSearchParams(window.location.search).get("budgetEndpoint") || "";
  const apiOpts = (extra = {}) => ({ overlayId: API_OVERLAY, ...(ENDPOINT ? { webhookAction: ENDPOINT } : {}), ...extra });
  const DEVIATION_PCT = 20;   // порог отклонения расхода статьи, %
  const BASELINE_MONTHS = 3;  // сколько прошлых месяцев берём как "норму"
  const MATRIX_MONTHS = 6;    // ширина таблицы сравнения
  const LOCALE = window.APP_LANG === "en" ? "en-US" : "ru-RU";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  // ---------- состояние ----------
  let vocabulary = []; // статьи: [{ id, title, group }]
  let vocabGroupRows = []; // записи-категории без статьи (title пустой): [{ id, name }]
  let budgetData = {};
  let monthsSummary = {};
  let months = [];
  let selectedMonth = null;
  let selectedKey = null;
  let filterTitle = "";
  let compareTitle = "";
  let changed = new Map();
  let vocabGroups = [];
  let charts = { pnl: null, compare: null };
  let ctx = null;

  // ---------- форматирование и разбор ----------
  function parseDate(value) {
    const v = String(value || "").trim();
    let m = v.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3] || 1));
    m = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return new Date(v);
  }

  function monthKey(value) {
    const d = parseDate(value);
    return Number.isNaN(d.getTime()) ? String(value) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function isPastMonth(value) {
    const d = parseDate(value);
    const now = new Date();
    return d.getFullYear() < now.getFullYear() || (d.getFullYear() === now.getFullYear() && d.getMonth() < now.getMonth());
  }

  function monthLabel(value, opts = { year: "numeric", month: "long" }) {
    return parseDate(value).toLocaleString(LOCALE, opts);
  }

  function parseAmount(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    let s = String(value ?? "").replace(/[\s\u00a0]/g, "");
    const comma = s.lastIndexOf(",");
    const dot = s.lastIndexOf(".");
    if (comma !== -1 && dot !== -1) {
      s = comma > dot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
    } else if (comma !== -1) {
      s = LOCALE === "en-US" ? s.replace(/,/g, "") : s.replace(",", ".");
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  const fmt = (n) => Number(n || 0).toLocaleString(LOCALE, { maximumFractionDigits: 0 });
  const signClass = (n) => (!Number(n) ? "zero" : Number(n) < 0 ? "neg" : "pos");
  const pctText = (p) => (p == null ? "—" : `${p > 0 ? "+" : ""}${p.toFixed(0)}%`);

  function commentToText(html) {
    const box = document.createElement("div");
    box.innerHTML = String(html || "");
    box.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    box.querySelectorAll("div,p,li").forEach((el) => el.append("\n"));
    return box.textContent.replace(/\n{2,}/g, "\n").trim();
  }

  function notify(message, type = "info") {
    if (typeof window.showToast === "function") window.showToast(message, type);
    else console.info(`[budget] ${message}`);
  }

  // ---------- модель данных ----------
  const UNGROUPED = "Без группы";

  // Сервис может вернуть строки, объекты { title, group } или объект { группа: [статьи] }.
  // Запись справочника: { Id, title, category }; пустой title означает категорию без статей.
  function normalizeVocabulary(raw) {
    const toEntry = (value, group = "") => {
      if (value && typeof value === "object") {
        const title = value.title ?? value.article ?? value.Article ?? value.name ?? "";
        const own = value.category ?? value.Category ?? value.group ?? value.Group ?? group;
        const id = value.Id ?? value.id ?? value.ID ?? null;
        return title || own ? { id, title: String(title), group: String(own || "") } : null;
      }
      return value ? { id: null, title: String(value), group: String(group || "") } : null;
    };
    let entries = [];
    if (Array.isArray(raw)) entries = raw.map((v) => toEntry(v));
    else if (raw && typeof raw === "object") {
      Object.entries(raw).forEach(([group, list]) => {
        if (Array.isArray(list)) entries.push(...list.map((v) => toEntry(v, group)));
      });
    }
    return entries.filter(Boolean);
  }

  function setVocabulary(raw) {
    const entries = normalizeVocabulary(raw);
    vocabulary = entries.filter((e) => e.title);
    vocabGroupRows = entries.filter((e) => !e.title).map((e) => ({ id: e.id, name: e.group }));
  }

  function groupOf(item, title) {
    const own = item?.group ?? item?.category ?? item?.Category ?? item?.Group;
    if (own) return String(own);
    return vocabulary.find((v) => v.title === title)?.group || UNGROUPED;
  }

  function groupTotals(month) {
    const totals = new Map();
    Object.entries(monthData(month)).forEach(([key, item]) => {
      const group = groupOf(item, displayTitle(item, key));
      totals.set(group, (totals.get(group) || 0) + effective(item, month));
    });
    return totals;
  }

  const recordId = (item) => item?.id ?? item?.Id ?? item?.ID ?? item?.recordId ?? null;
  const recordTitle = (item, fallback = "") => item?.title || item?.article || item?.Article || fallback;

  function displayTitle(item, fallback = "") {
    const id = recordId(item);
    let title = String(recordTitle(item, fallback));
    if (id != null && title.endsWith(`__${id}`)) title = title.slice(0, -`__${id}`.length);
    return title.replace(/ #\d+$/, "");
  }

  function uniqueKey(item, fallback, used) {
    const id = recordId(item);
    const base = id == null ? String(fallback) : `${recordTitle(item, fallback)}__${id}`;
    let key = base;
    let n = 2;
    while (Object.prototype.hasOwnProperty.call(used, key)) key = `${base} #${n++}`;
    return key;
  }

  function normalizeBudget(raw) {
    const out = {};
    Object.entries(raw || {}).forEach(([month, monthData]) => {
      const records = {};
      const entries = Array.isArray(monthData)
        ? monthData.map((item, i) => [recordTitle(item, `record-${i + 1}`), item])
        : Object.entries(monthData || {});
      entries.forEach(([fallback, item]) => { records[uniqueKey(item, fallback, records)] = item; });
      out[month] = records;
    });
    return out;
  }

  function monthData(month) {
    const k = monthKey(month);
    const found = Object.keys(budgetData).find((m) => monthKey(m) === k);
    return found ? budgetData[found] : {};
  }

  function ensureMonthData(month) {
    const k = monthKey(month);
    const found = Object.keys(budgetData).find((m) => monthKey(m) === k);
    if (found) return budgetData[found];
    budgetData[month] = {};
    return budgetData[month];
  }

  // В прошлых месяцах считаем только оплаченное, в текущем и будущих — всё.
  function effective(item, month) {
    const amount = parseAmount(item?.outcome);
    return isPastMonth(month) && !item?.paid ? 0 : amount;
  }

  // title -> { sum, count, paid }
  function articleTotals(month) {
    const totals = new Map();
    Object.entries(monthData(month)).forEach(([key, item]) => {
      const title = displayTitle(item, key);
      const t = totals.get(title) || { sum: 0, count: 0, paid: 0 };
      t.sum += effective(item, month);
      t.count += 1;
      t.paid += item.paid ? 1 : 0;
      totals.set(title, t);
    });
    return totals;
  }

  // Как на старой странице: доход из getMonthsSummary, расход — сумма записей (расход сервиса только если записей с суммой нет).
  function monthTotals(month) {
    const data = monthData(month);
    const detailed = Object.values(data).some((i) => i && Object.prototype.hasOwnProperty.call(i, "outcome"));
    let outcome = detailed ? 0 : parseAmount(monthsSummary[month]?.outcome);
    Object.values(data).forEach((item) => { outcome += effective(item, month); });
    const income = parseAmount(monthsSummary[month]?.income);
    return { income, outcome, profit: income - outcome };
  }

  function buildSummary() {
    const result = {};
    let cumulative = 0;
    months.forEach((m) => {
      const t = monthTotals(m);
      cumulative += t.profit;
      result[m] = { ...t, cumulative };
    });
    return result;
  }

  // ---------- аналитика ----------
  function analyze(month) {
    const idx = months.indexOf(month);
    const history = months.slice(Math.max(0, idx - BASELINE_MONTHS), Math.max(0, idx));
    const current = articleTotals(month);
    const historyTotals = history.map(articleTotals);
    const result = { deviations: [], missing: [], groups: [], total: null, history };

    // Отклонение расхода статьи от среднего за прошлые месяцы (учитываем только месяцы, где статья была).
    current.forEach((cur, title) => {
      const past = historyTotals.map((m) => m.get(title)?.sum).filter((v) => v != null);
      if (!past.length) return;
      const baseline = past.reduce((a, b) => a + b, 0) / past.length;
      if (baseline <= 0) return;
      const pct = ((cur.sum - baseline) / baseline) * 100;
      if (Math.abs(pct) > DEVIATION_PCT) result.deviations.push({ title, current: cur.sum, baseline, pct });
    });
    result.deviations.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

    // Забытые статьи: были в большинстве прошлых месяцев, но в этом отсутствуют.
    const need = history.length >= 2 ? 2 : 1;
    const titles = new Set(historyTotals.flatMap((m) => Array.from(m.keys())));
    titles.forEach((title) => {
      if (current.has(title)) return;
      const seen = historyTotals.filter((m) => m.has(title));
      if (seen.length < need) return;
      const last = [...historyTotals].reverse().find((m) => m.has(title)).get(title).sum;
      const avg = seen.reduce((s, m) => s + m.get(title).sum, 0) / seen.length;
      result.missing.push({ title, group: groupOf(null, title), last, avg, months: seen.length, of: history.length });
    });
    result.missing.sort((a, b) => b.avg - a.avg);

    // Итоги по группам статей против среднего за прошлые месяцы.
    const groupHistory = history.map(groupTotals);
    groupTotals(month).forEach((sum, group) => {
      const past = groupHistory.map((m) => m.get(group)).filter((v) => v != null);
      const baseline = past.length ? past.reduce((a, b) => a + b, 0) / past.length : null;
      result.groups.push({ group, current: sum, baseline, pct: baseline > 0 ? ((sum - baseline) / baseline) * 100 : null });
    });
    result.groups.sort((a, b) => b.current - a.current);

    // Итоговые расходы месяца против среднего.
    const histSums = history.map((m) => monthTotals(m).outcome).filter((v) => v > 0);
    if (histSums.length) {
      const baseline = histSums.reduce((a, b) => a + b, 0) / histSums.length;
      const cur = monthTotals(month).outcome;
      result.total = { current: cur, baseline, pct: baseline ? ((cur - baseline) / baseline) * 100 : null };
    }
    return result;
  }

  // ---------- добавление статей ----------
  function makeKey(month, title) {
    const data = monthData(month);
    let key = title;
    let n = 1;
    while (Object.prototype.hasOwnProperty.call(data, key)) key = `${title} #${++n}`;
    return key;
  }

  function addArticle(title, amount = 0, comment = "") {
    const key = makeKey(selectedMonth, title);
    ensureMonthData(selectedMonth)[key] = { title, income: 0, outcome: amount, editable: true, paid: false, newArticle: true, comment };
    changed.set(`${selectedMonth}|${key}`, { month: selectedMonth, article: title, outcome: amount, paid: false, newArticle: true, comment });
  }

  function trackChange(key) {
    const item = monthData(selectedMonth)[key];
    const id = recordId(item);
    changed.set(`${selectedMonth}|${key}`, {
      ...(id == null ? {} : { id }),
      month: selectedMonth,
      article: displayTitle(item, key),
      outcome: parseAmount(item.outcome),
      paid: !!item.paid,
      newArticle: !!item.newArticle,
      comment: item.comment || "",
    });
  }

  // ---------- отрисовка ----------
  function renderAll() {
    renderMonths();
    renderArticles();
    renderSuggestions();
    renderAnalytics();
    renderMatrix();
    renderPnlChart();
    $("#bv2-save-btn").disabled = changed.size === 0;
  }

  function renderMonths() {
    const track = $("#bv2-months");
    const summary = buildSummary();
    track.replaceChildren();
    months.forEach((m) => {
      const s = summary[m];
      const total = Math.abs(s.income) + Math.abs(s.outcome) || 1;
      const incomePct = Math.round((Math.abs(s.income) / total) * 100);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "bv2-month" + (m === selectedMonth ? " is-selected" : "");
      card.dataset.month = m;
      card.innerHTML = `
        <b>${esc(monthLabel(m))}</b>
        <span>Доход</span><span class="num ${signClass(s.income)}">${fmt(s.income)}</span>
        <span>Расход</span><span class="num ${signClass(s.outcome)}">${fmt(s.outcome)}</span>
        <span>Выручка</span><span class="num ${signClass(s.profit)}">${fmt(s.profit)}</span>
        <span>Накоп.</span><span class="num ${signClass(s.cumulative)}">${fmt(s.cumulative)}</span>
        <i class="bv2-bar" style="--a:${incomePct}%"></i>`;
      card.addEventListener("click", () => selectMonth(m));
      track.appendChild(card);
    });
  }

  function scrollToSelectedMonth() {
    const el = $(`.bv2-month[data-month="${CSS.escape(selectedMonth || "")}"]`);
    if (el) $("#bv2-months").scrollLeft = el.offsetLeft - $("#bv2-months").offsetLeft;
  }

  function selectMonth(month) {
    selectedMonth = month;
    selectedKey = null;
    $("#bv2-detail").hidden = true;
    renderAll();
  }

  function renderArticles() {
    const tbody = $("#bv2-articles");
    const data = monthData(selectedMonth);
    tbody.replaceChildren();

    const filter = $("#bv2-filter");
    const titles = Array.from(new Set(Object.entries(data).map(([k, i]) => displayTitle(i, k))));
    if (!titles.includes(filterTitle)) filterTitle = "";
    filter.innerHTML = `<option value="">Все статьи</option>` + titles.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
    filter.value = filterTitle;

    Object.entries(data).forEach(([key, item]) => {
      const title = displayTitle(item, key);
      if (filterTitle && title !== filterTitle) return;
      const amount = parseAmount(item.outcome);
      const tr = document.createElement("tr");
      tr.dataset.key = key;
      if (key === selectedKey) tr.classList.add("is-selected");
      tr.innerHTML = `
        <td><span class="bv2-title">${esc(title)}</span>
          <span class="bv2-status ${item.paid ? "is-paid" : "is-unpaid"}">${item.paid ? "Оплачено" : "Не оплачено"}</span></td>
        <td class="num ${signClass(amount)}">${fmt(amount)}</td>
        <td class="bv2-comment">${esc(commentToText(item.comment))}</td>`;
      tr.addEventListener("click", () => selectArticle(key));
      tbody.appendChild(tr);
    });
  }

  function selectArticle(key) {
    selectedKey = key;
    const item = monthData(selectedMonth)[key];
    if (!item) return;
    $("#bv2-detail-title").textContent = displayTitle(item, key);
    $("#bv2-amount").value = fmt(parseAmount(item.outcome));
    $("#bv2-paid").checked = !!item.paid;
    $("#bv2-comment").value = commentToText(item.comment);
    ["#bv2-amount", "#bv2-paid", "#bv2-comment"].forEach((s) => { $(s).disabled = !item.editable; });
    $("#bv2-detail").hidden = false;
    $$("#bv2-articles tr").forEach((tr) => tr.classList.toggle("is-selected", tr.dataset.key === key));
  }

  function onDetailChange(event) {
    const item = monthData(selectedMonth)[selectedKey];
    if (!item || !item.editable) return;
    if (event.target.id === "bv2-amount") item.outcome = parseAmount(event.target.value);
    if (event.target.id === "bv2-paid") item.paid = event.target.checked;
    if (event.target.id === "bv2-comment") item.comment = event.target.value;
    trackChange(selectedKey);
    renderAll();
  }

  let suggestions = [];

  function renderSuggestions() {
    const box = $("#bv2-suggest");
    suggestions = selectedMonth && !isPastMonth(selectedMonth) ? analyze(selectedMonth).missing : [];
    box.hidden = !suggestions.length;
    if (!suggestions.length) return;
    box.innerHTML = `
      <span>В этом месяце не хватает статей из прошлых месяцев: <b>${suggestions.length}</b></span>
      <button type="button" class="bv2-btn" id="bv2-suggest-open">Показать</button>`;
    $("#bv2-suggest-open").addEventListener("click", openSuggestModal);
  }

  function openSuggestModal() {
    const list = $("#bv2-suggest-list");
    const byGroup = new Map();
    suggestions.forEach((m, i) => {
      if (!byGroup.has(m.group)) byGroup.set(m.group, []);
      byGroup.get(m.group).push(i);
    });
    list.innerHTML = Array.from(byGroup, ([group, indexes]) => `
      <details class="bv2-tree__group" open>
        <summary>${esc(group)}</summary>
        <ul class="bv2-suggest__list">${indexes.map((i) => `
          <li>
            <label><input type="checkbox" data-i="${i}" checked> ${esc(suggestions[i].title)}</label>
            <span class="bv2-muted">было ${suggestions[i].months} из ${suggestions[i].of} мес.</span>
            <input type="text" class="bv2-suggest__amount" data-i="${i}" value="${fmt(suggestions[i].last)}" inputmode="decimal" aria-label="Сумма: ${esc(suggestions[i].title)}">
          </li>`).join("")}
        </ul>
      </details>`).join("");
    $("#bv2-modal-suggest").hidden = false;
  }

  async function applySuggestions() {
    const list = $("#bv2-suggest-list");
    let added = 0;
    $$("input[type=checkbox][data-i]", list).forEach((cb) => {
      if (!cb.checked) return;
      const i = cb.dataset.i;
      addArticle(suggestions[i].title, parseAmount($(`.bv2-suggest__amount[data-i="${i}"]`, list).value));
      added += 1;
    });
    $("#bv2-modal-suggest").hidden = true;
    if (!added) return;
    renderAll();
    await saveChanges();
  }

  function renderAnalytics() {
    const box = $("#bv2-analytics");
    const badge = $("#bv2-alert-count");
    if (!selectedMonth) return;
    const a = analyze(selectedMonth);
    const count = a.deviations.length;
    badge.hidden = !count;
    badge.textContent = count;

    const section = (title, hint, body) => `<div class="bv2-card"><div class="bv2-card__head"><h3>${title}</h3><span class="bv2-muted">${hint}</span></div>${body}</div>`;
    const empty = `<p class="bv2-muted">Замечаний нет</p>`;

    const totalHtml = a.total
      ? `<p>Расходы месяца: <b>${fmt(a.total.current)}</b> при среднем <b>${fmt(a.total.baseline)}</b>
         <span class="bv2-flag ${Math.abs(a.total.pct ?? 0) > DEVIATION_PCT ? "is-warn" : ""}">${pctText(a.total.pct)}</span></p>`
      : `<p class="bv2-muted">Недостаточно истории для сравнения</p>`;

    const deviations = a.deviations.length
      ? `<table class="bv2-table"><thead><tr><th>Статья</th><th class="num">Сейчас</th><th class="num">Норма</th><th class="num">Откл.</th></tr></thead><tbody>
          ${a.deviations.map((d) => `<tr data-compare="${esc(d.title)}"><td>${esc(d.title)}</td><td class="num">${fmt(d.current)}</td><td class="num">${fmt(d.baseline)}</td>
            <td class="num"><span class="bv2-flag is-warn">${pctText(d.pct)}</span></td></tr>`).join("")}
        </tbody></table>` : empty;

    const hasGroups = a.groups.some((g) => g.group !== UNGROUPED);
    const groups = hasGroups
      ? `<table class="bv2-table"><thead><tr><th>Группа</th><th class="num">Сейчас</th><th class="num">Норма</th><th class="num">Откл.</th></tr></thead><tbody>
          ${a.groups.map((g) => `<tr><td>${esc(g.group)}</td><td class="num">${fmt(g.current)}</td><td class="num">${g.baseline == null ? "—" : fmt(g.baseline)}</td>
            <td class="num"><span class="bv2-flag ${g.pct != null && Math.abs(g.pct) > DEVIATION_PCT ? "is-warn" : ""}">${pctText(g.pct)}</span></td></tr>`).join("")}
        </tbody></table>`
      : `<p class="bv2-muted">Группы появятся, когда сервис вернёт категорию статей</p>`;

    box.innerHTML =
      section(`Итого за ${esc(monthLabel(selectedMonth))}`, `порог отклонения ${DEVIATION_PCT}%`, totalHtml) +
      section("Итоги по группам статей", "против среднего за прошлые мес.", groups) +
      section("Отклонение статей от нормы", `среднее за ${a.history.length || 0} прошлых мес.`, deviations);

    $$("[data-compare]", box).forEach((tr) => tr.addEventListener("click", () => {
      compareTitle = tr.dataset.compare;
      switchTab("compare");
    }));
  }

  function renderMatrix() {
    const table = $("#bv2-matrix");
    if (!selectedMonth) return;
    const idx = months.indexOf(selectedMonth);
    const window_ = months.slice(Math.max(0, idx - MATRIX_MONTHS + 1), idx + 1);
    const totals = window_.map(articleTotals);
    const titles = Array.from(new Set(totals.flatMap((t) => Array.from(t.keys()))));
    const last = totals[totals.length - 1];
    titles.sort((a, b) => (last.get(b)?.sum || 0) - (last.get(a)?.sum || 0) || a.localeCompare(b, LOCALE));

    let html = `<thead><tr><th>Статья</th>${window_.map((m) => `<th class="num">${esc(monthLabel(m, { month: "short", year: "2-digit" }))}</th>`).join("")}</tr></thead><tbody>`;
    titles.forEach((title) => {
      html += `<tr data-title="${esc(title)}" class="${title === compareTitle ? "is-selected" : ""}"><td>${esc(title)}</td>`;
      totals.forEach((t, i) => {
        const cur = t.get(title)?.sum;
        const prev = i > 0 ? totals[i - 1].get(title)?.sum : null;
        let cls = "";
        let hint = "";
        if (cur != null && prev) {
          const pct = ((cur - prev) / prev) * 100;
          if (Math.abs(pct) > DEVIATION_PCT) { cls = pct > 0 ? "is-up" : "is-down"; hint = ` title="${pctText(pct)} к прошлому месяцу"`; }
        }
        html += `<td class="num ${cls}"${hint}>${cur == null ? "—" : fmt(cur)}</td>`;
      });
      html += "</tr>";
    });
    table.innerHTML = html + "</tbody>";
    $$("tbody tr", table).forEach((tr) => tr.addEventListener("click", () => {
      compareTitle = tr.dataset.title;
      renderMatrix();
      renderCompareChart();
    }));
    renderCompareChart();
  }

  function chartDefaults() {
    return { responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false } };
  }

  function renderCompareChart() {
    const title = $("#bv2-compare-title");
    if (typeof Chart === "undefined") return;
    if (!compareTitle) { title.textContent = "Выберите статью в таблице"; return; }
    title.textContent = `Статья: ${compareTitle}`;
    const values = months.map((m) => articleTotals(m).get(compareTitle)?.sum ?? null);
    const data = {
      labels: months.map((m) => monthLabel(m, { month: "short", year: "2-digit" })),
      datasets: [{ type: "bar", label: compareTitle, data: values, backgroundColor: "rgba(26,115,232,.55)" }],
    };
    if (charts.compare) { charts.compare.data = data; charts.compare.update(); return; }
    charts.compare = new Chart($("#bv2-compare-chart").getContext("2d"), { data, options: chartDefaults() });
  }

  function renderPnlChart() {
    if (typeof Chart === "undefined") return;
    const summary = buildSummary();
    const data = {
      labels: months.map((m) => monthLabel(m, { month: "short", year: "numeric" })),
      datasets: [
        { type: "bar", label: "Накопительно", data: months.map((m) => summary[m].cumulative), backgroundColor: "rgba(124,77,255,.35)" },
        { type: "bar", label: "Доход", data: months.map((m) => summary[m].income), backgroundColor: "rgba(33,150,243,.6)" },
        { type: "bar", label: "Расход", data: months.map((m) => summary[m].outcome), backgroundColor: "rgba(239,83,80,.6)" },
        { type: "line", label: "Прибыль", data: months.map((m) => summary[m].profit), borderColor: "rgb(0,150,136)", tension: 0.25, fill: false },
      ],
    };
    if (charts.pnl) { charts.pnl.data = data; charts.pnl.update(); return; }
    charts.pnl = new Chart($("#bv2-pnl-chart").getContext("2d"), { data, options: chartDefaults() });
  }

  function switchTab(tab) {
    $$(".bv2-tab").forEach((b) => {
      const active = b.dataset.tab === tab;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
    $$(".bv2-panel").forEach((p) => { p.hidden = p.dataset.panel !== tab; });
    if (tab === "compare") renderMatrix();
    if (tab === "analytics") charts.pnl?.resize();
  }

  // ---------- справочник статей (группа -> статьи) ----------
  function openVocab() {
    const byGroup = new Map([["", { rowId: null, isNew: false, items: [] }]]);
    const ensureGroup = (name, rowId = null) => {
      if (!byGroup.has(name)) byGroup.set(name, { rowId, isNew: false, items: [] });
      else if (rowId != null && byGroup.get(name).rowId == null) byGroup.get(name).rowId = rowId;
      return byGroup.get(name);
    };
    vocabGroupRows.forEach((r) => ensureGroup(r.name, r.id));
    vocabulary.forEach((v) => ensureGroup(v.group).items.push({ id: v.id, title: v.title }));
    vocabGroups = Array.from(byGroup, ([name, g]) => ({ ...g, name }));
    collapsedGroups.clear();
    vocabGroups.forEach((g) => collapsedGroups.add(g));
    $("#bv2-vocab-search").value = "";
    $("#bv2-vocab-status").textContent = "";
    renderVocab();
    $("#bv2-modal-vocab").hidden = false;
  }

  function vocabInput(value, onInput, placeholder = "", className = "bv2-ghost") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = className;
    input.value = value;
    input.placeholder = placeholder;
    input.addEventListener("input", () => onInput(input.value));
    return input;
  }

  function vocabIconButton(text, label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bv2-icon";
    btn.textContent = text;
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.addEventListener("click", onClick);
    return btn;
  }

  const collapsedGroups = new Set();
  let vocabFocusGroup = null;

  function renderVocab() {
    const list = $("#bv2-vocab-list");
    const query = $("#bv2-vocab-search").value.trim().toLowerCase();
    list.replaceChildren();

    vocabGroups.forEach((group, gi) => {
      const isUngrouped = gi === 0;
      const matches = group.items.filter((item) => !query || item.title.toLowerCase().includes(query));
      const groupMatches = !query || group.name.toLowerCase().includes(query);
      if (query && !groupMatches && !matches.length) return;
      if (isUngrouped && !group.items.length) return;

      const visibleItems = groupMatches ? group.items : matches;
      const collapsed = !query && collapsedGroups.has(group);
      const li = document.createElement("li");
      li.className = "bv2-vocab__group";

      const head = document.createElement("div");
      head.className = "bv2-vocab__head";
      const toggleGroup = () => {
        if (collapsed) collapsedGroups.delete(group); else collapsedGroups.add(group);
        renderVocab();
      };
      const toggle = vocabIconButton(collapsed ? "\u25b8" : "\u25be", collapsed ? "Развернуть" : "Свернуть", toggleGroup);
      toggle.setAttribute("aria-expanded", String(!collapsed));
      head.appendChild(toggle);

      const label = document.createElement("button");
      label.type = "button";
      label.className = "bv2-vocab__label";
      label.textContent = isUngrouped ? UNGROUPED : group.name;
      label.addEventListener("click", toggleGroup);
      head.appendChild(label);
      if (!isUngrouped) {
        head.appendChild(vocabIconButton("\u00d7", "Удалить группу вместе со статьями", () => {
          if (group.items.length && !window.confirm(`Удалить группу «${group.name}» и все её статьи (${group.items.length})?`)) return;
          vocabGroups.splice(gi, 1);
          renderVocab();
        }));
      }
      li.appendChild(head);
      if (collapsed) { list.appendChild(li); return; }

      const ul = document.createElement("ul");
      ul.className = "bv2-vocab__items";
      visibleItems.forEach((item) => {
        const row = document.createElement("li");
        const name = document.createElement("span");
        name.className = "bv2-vocab__item";
        name.textContent = item.title;
        row.append(
          name,
          vocabIconButton("\u00d7", "Удалить статью", () => { group.items.splice(group.items.indexOf(item), 1); renderVocab(); })
        );
        ul.appendChild(row);
      });

      let lastDraftInput = null;
      (group.drafts || []).forEach((_, di) => {
        const row = document.createElement("li");
        lastDraftInput = vocabInput(group.drafts[di], (v) => { group.drafts[di] = v; }, "Название статьи");
        row.append(lastDraftInput, vocabIconButton("\u00d7", "Убрать поле", () => { group.drafts.splice(di, 1); renderVocab(); }));
        ul.appendChild(row);
      });

      const addRow = document.createElement("li");
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "bv2-vocab__addbtn";
      addBtn.textContent = "+ Новая статья";
      addBtn.addEventListener("click", () => {
        (group.drafts ||= []).push("");
        vocabFocusGroup = group;
        renderVocab();
      });
      addRow.appendChild(addBtn);
      ul.appendChild(addRow);
      li.appendChild(ul);
      list.appendChild(li);
      if (vocabFocusGroup === group) { vocabFocusGroup = null; lastDraftInput?.focus(); }
    });
  }

  function vocabError(message) {
    $("#bv2-vocab-status").textContent = message;
  }

  async function saveVocab() {
    vocabError("");
    // Неподтверждённые черновики (текст без Enter) тоже считаем добавленными.
    vocabGroups.forEach((g) => {
      (g.drafts || []).forEach((draft) => {
        const title = draft.trim();
        if (title) g.items.push({ id: null, title });
      });
      g.drafts = [];
    });
    const newGroupInput = $("#bv2-vocab-new");
    if (newGroupInput.value.trim()) {
      vocabGroups.push({ rowId: null, isNew: true, name: newGroupInput.value.trim(), items: [] });
      newGroupInput.value = "";
    }
    renderVocab();

    const groups = vocabGroups.map((g) => ({ ...g, name: g.name.trim() }));
    const names = groups.map((g) => g.name).filter(Boolean);
    if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) { vocabError("В справочнике есть повторяющиеся группы"); return; }

    // Разница с загруженным справочником: удаление по id, добавление по title + category.
    const keptIds = new Set(groups.flatMap((g) => g.items.map((i) => i.id)).filter((id) => id != null));
    const keptRowIds = new Set(groups.map((g) => g.rowId).filter((id) => id != null));
    const add = [];
    const del = [];
    vocabulary.forEach((v) => { if (v.id != null && !keptIds.has(v.id)) del.push({ id: v.id }); });
    vocabGroupRows.forEach((r) => { if (r.id != null && !keptRowIds.has(r.id)) del.push({ id: r.id }); });
    groups.forEach((g) => {
      if (g.isNew && g.name) add.push({ title: "", category: g.name });
      g.items.forEach((i) => {
        const title = i.title.trim();
        if (i.id == null && title) add.push({ title, category: g.name });
      });
    });
    if (!add.length && !del.length) { $("#bv2-modal-vocab").hidden = true; return; }

    const resp = await window.API.saveBudgetVocabulary({ add, delete: del }, apiOpts({ timeout: 8000 }));
    if (resp == null) { vocabError("Сервер не ответил на сохранение справочника"); return; }
    // Перечитываем справочник, чтобы получить id новых записей.
    setVocabulary(await window.API.getBudgetVocabulary({ action: "getVocabulary", visible: true, mode: "notest" }, apiOpts()));
    $("#bv2-modal-vocab").hidden = true;
    notify("Справочник сохранён", "success");
    renderAll();
  }

  // ---------- сохранение и загрузка ----------
  async function saveChanges() {
    const payload = Array.from(changed.values());
    if (!payload.length) return;
    const resp = await window.API.saveBudgetChanges({ changes: payload }, apiOpts({ timeout: 8000 }));
    if (resp == null) { notify("Не удалось сохранить изменения бюджета", "error"); return; }
    notify("Изменения успешно сохранены!", "success");
    changed.clear();
    await load();
  }

  // Общий overlay снимается первым завершившимся запросом, поэтому возвращаем его, пока есть незавершённые.
  const LOAD_OVERLAY = `${PAGE_ID}-load`;

  async function load() {
    hidePage(LOAD_OVERLAY);
    let pending = 3;
    const tracked = (promise) => promise.finally(() => {
      pending -= 1;
      if (pending > 0) hidePage(LOAD_OVERLAY);
    });
    try {
      const [vocab, data, summary] = await Promise.all([
        tracked(window.API.getBudgetVocabulary({ action: "getVocabulary", visible: true, mode: "notest" }, apiOpts())),
        tracked(window.API.getBudgetData({ action: "getBudgetData", visible: true, mode: "no test" }, apiOpts())),
        tracked(window.API.getMonthsSummary({ action: "getMonthsSummary", visible: true }, apiOpts())),
      ]);
      if (ctx && ctx.isActive && !ctx.isActive()) return;
      setVocabulary(vocab);
      budgetData = normalizeBudget(data);
      monthsSummary = summary || {};
      months = Object.keys(monthsSummary).sort((a, b) => parseDate(a) - parseDate(b));
      const now = new Date();
      const current = months.find((m) => {
        const d = parseDate(m);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
      if (!months.includes(selectedMonth)) selectedMonth = current || months[months.length - 1] || months[0];
      renderAll();
      scrollToSelectedMonth();
    } finally {
      showPage(LOAD_OVERLAY);
    }
  }

  // ---------- инициализация ----------
  let addChoice = "";

  function openAddModal() {
    const tree = $("#bv2-add-tree");
    const confirm = $("#bv2-add-confirm");
    const groups = new Map();
    vocabulary.forEach((v) => {
      const name = v.group || UNGROUPED;
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(v.title);
    });
    addChoice = "";
    confirm.disabled = true;
    tree.replaceChildren();
    groups.forEach((titles, name) => {
      const details = document.createElement("details");
      details.className = "bv2-tree__group";
      details.open = groups.size === 1;
      const summary = document.createElement("summary");
      summary.textContent = name;
      const ul = document.createElement("ul");
      ul.className = "bv2-tree__items";
      titles.forEach((title) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bv2-tree__item";
        btn.textContent = title;
        btn.addEventListener("click", () => {
          addChoice = title;
          $$(".bv2-tree__item", tree).forEach((b) => b.classList.toggle("is-selected", b === btn));
          confirm.disabled = false;
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      details.append(summary, ul);
      tree.appendChild(details);
    });
    $("#bv2-modal-add").hidden = false;
  }

  function initBudgetV2(context) {
    ctx = context;
    context?.onCleanup?.(() => {
      Object.values(charts).forEach((c) => c?.destroy());
      charts = { pnl: null, compare: null };
    });

    $$(".bv2-tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
    $("#bv2-prev").addEventListener("click", () => $("#bv2-months").scrollBy({ left: -240, behavior: "smooth" }));
    $("#bv2-next").addEventListener("click", () => $("#bv2-months").scrollBy({ left: 240, behavior: "smooth" }));
    $("#bv2-filter").addEventListener("change", (e) => { filterTitle = e.target.value; renderArticles(); });
    $("#bv2-add-btn").addEventListener("click", openAddModal);
    $("#bv2-add-cancel").addEventListener("click", () => { $("#bv2-modal-add").hidden = true; });
    $("#bv2-add-confirm").addEventListener("click", () => {
      if (!addChoice) return;
      addArticle(addChoice);
      $("#bv2-modal-add").hidden = true;
      renderAll();
    });
    ["#bv2-amount", "#bv2-paid", "#bv2-comment"].forEach((s) => $(s).addEventListener(s === "#bv2-paid" ? "change" : "input", onDetailChange));
    $("#bv2-amount").addEventListener("blur", (e) => { e.target.value = fmt(parseAmount(e.target.value)); });
    $("#bv2-detail-close").addEventListener("click", () => { selectedKey = null; $("#bv2-detail").hidden = true; renderArticles(); });
    $("#bv2-save-btn").addEventListener("click", () => saveChanges().catch((e) => notify(`Ошибка при сохранении: ${e.message}`, "error")));

    $("#bv2-vocab-btn").addEventListener("click", openVocab);
    $("#bv2-vocab-cancel").addEventListener("click", () => { $("#bv2-modal-vocab").hidden = true; });
    $("#bv2-vocab-search").addEventListener("input", renderVocab);
    $("#bv2-vocab-add").addEventListener("click", () => {
      const input = $("#bv2-vocab-new");
      const name = input.value.trim();
      if (!name) return;
      vocabGroups.push({ rowId: null, isNew: true, name, items: [] });
      input.value = "";
      renderVocab();
    });
    $("#bv2-suggest-cancel").addEventListener("click", () => { $("#bv2-modal-suggest").hidden = true; });
    $("#bv2-suggest-apply").addEventListener("click", () => applySuggestions().catch((e) => notify(`Ошибка при сохранении: ${e.message}`, "error")));
    $("#bv2-vocab-save").addEventListener("click", () => saveVocab().catch((e) => vocabError(`Ошибка: ${e.message}`)));

    load().catch((error) => {
      if (error?.name === "AbortError") return;
      console.error("Failed to load budget", error);
      notify("Не удалось загрузить бюджет", "error");
    });
  }

  if (typeof registerPageInit === "function") registerPageInit(PAGE_ID, initBudgetV2);
})();
