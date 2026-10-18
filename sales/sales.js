registerPageInit("sales", initSalesPage);

async function initSalesPage() {
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function parseNumberMaybe(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    let normalized = String(value).trim().replace(/\s+/g, "");
    if (!normalized) return null;
    if (normalized.includes(",") && normalized.includes(".")) {
      const decimalPos = Math.max(normalized.lastIndexOf(","), normalized.lastIndexOf("."));
      const integerPart = normalized.slice(0, decimalPos).replace(/[.,]/g, "");
      const fractionalPart = normalized.slice(decimalPos + 1).replace(/[.,]/g, "");
      normalized = `${integerPart}.${fractionalPart}`;
    } else {
      normalized = normalized.replace(",", ".");
    }
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }

  // VND values may come as "1,200,000", "1.200.000" or "1 200 000 ₫": a lone separator followed by 3 digits is thousands
  function parseMoney(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const s = String(value ?? "").replace(/[^\d.,-]/g, "");
    if (!s) return 0;
    const m = s.match(/^(-?\d{1,3})((?:[.,]\d{3})+)$/);
    if (m) return Number(m[1] + m[2].replace(/[.,]/g, ""));
    return parseNumberMaybe(s) || 0;
  }

  function formatPriceValueRu(value) {
    const n = parseNumberMaybe(value);
    return n === null ? value : n.toLocaleString("ru-RU");
  }

  // ── Employee colors (same rules as schedule legend) ──────────────────
  function normName(v) { return String(v || "").trim(); }

  function normalizeColorMap(raw) {
    const source = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    return source.map((entry) => {
      const employee = normName(entry?.employee || entry?.Employee || entry?.name || entry?.Name ||
        entry?.user || entry?.username || entry?.login || entry?.email || entry?.[0]);
      if (!employee) return null;
      const color = String(entry?.color ?? entry?.Color ?? entry?.hex ?? entry?.hexColor ??
        entry?.schedulecolor ?? entry?.scheduleColor ?? entry?.schedule_color ?? entry?.value ?? entry?.[1] ?? "").trim();
      const fontColor = String(entry?.fontcolor ?? entry?.fontColor ?? entry?.FontColor ??
        entry?.textColor ?? entry?.text_color ?? "").trim();
      // Empty color from the service renders black
      return { employee, color: color || "#000000", fontColor: fontColor || null };
    }).filter(Boolean);
  }

  async function loadColorMap() {
    try {
      const raw = await window.API.getEmployeeColorMap({ action: "getEmployeeColorMap", visible: true }, { overlayId: "sales" });
      return normalizeColorMap(raw);
    } catch (e) {
      console.warn("Failed to load employee colors", e);
      return [];
    }
  }

  const colorMap = await loadColorMap();

  function employeeBadge(name) {
    const n = normName(name);
    if (!n) return "";
    const entry = colorMap.find((e) => e.employee.toLowerCase() === n.toLowerCase());
    const bg = entry ? entry.color : "#000000";
    const font = entry?.fontColor ? `;color:${esc(entry.fontColor)}` : "";
    return `<span class="badge employee" style="--badge-bg:${esc(bg)}${font}">${esc(n)}</span>`;
  }

  // ── Data ─────────────────────────────────────────────────────────────
  const data = await window.API.getSalesData({ visible: true }, { overlayId: "sales" });
  const payload = Array.isArray(data) ? data[0] : data;
  const header = Array.isArray(payload?.header) ? payload.header : [];
  const values = Array.isArray(payload?.values) ? payload.values : [];

  function getColIdx(name) {
    return header.findIndex((h) => String(h || "").toLowerCase() === name.toLowerCase());
  }

  const idxRowNumber  = getColIdx("row_number");
  const idxIsReturn   = getColIdx("is_return");
  const idxRetStatus  = getColIdx("return_status");
  const idxRetReason  = getColIdx("return_reason");
  const idxRetDate    = getColIdx("return_date");
  const idxRetTime    = getColIdx("return_time");
  const idxRetComment = getColIdx("return_comment");
  const idxRetApprBy  = getColIdx("return_approved_by");
  const idxDate       = getColIdx("date");
  const idxTime       = getColIdx("time");
  const idxName       = getColIdx("name");
  const idxArticle    = getColIdx("article");
  const idxFinalPrice = getColIdx("finalpricevnd");
  const idxBasketid   = getColIdx("basketid");
  const idxUser       = getColIdx("username");
  const idxStore      = getColIdx("store");
  const idxPrice      = getColIdx("price");
  const idxPayment    = getColIdx("paymentmethod");

  const HIDDEN = new Set(["row_number", "is_return", "return_status", "return_date",
    "return_time", "return_reason", "return_comment", "return_approved_by", "basketid",
    "date", "time", "username", "price", "paymentmethod", "store"]);
  const visibleCols = header.map((h, i) => i).filter((i) => !HIDDEN.has(String(header[i] || "").toLowerCase()));

  const cell = (row, idx) => (idx >= 0 ? row[idx] : "");
  const isReturnRow = (row) => idxIsReturn >= 0 && String(row[idxIsReturn] || "").toUpperCase() === "TRUE";

  // ── Grouping by basketid ─────────────────────────────────────────────
  function groupBaskets(rows) {
    const map = new Map();
    rows.forEach((row, i) => {
      const bid = String(cell(row, idxBasketid) || "").trim();
      const key = bid || `__row_${cell(row, idxRowNumber) || i}`;
      if (!map.has(key)) map.set(key, { key, rows: [] });
      map.get(key).rows.push(row);
    });
    return Array.from(map.values());
  }

  // Accepts DD.MM.YYYY / YYYY-MM-DD / DD/MM/YYYY plus H:MM[:SS]
  function rowTimestamp(row) {
    const d = String(cell(row, idxDate) || "").trim();
    const t = String(cell(row, idxTime) || "").trim();
    let y = 0, mo = 0, da = 0;
    let m = d.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
    if (m) { da = +m[1]; mo = +m[2]; y = +m[3]; }
    else if ((m = d.match(/(\d{4})-(\d{2})-(\d{2})/))) { y = +m[1]; mo = +m[2]; da = +m[3]; }
    const tm = t.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    const secs = tm ? (+tm[1]) * 3600 + (+tm[2]) * 60 + (+(tm[3] || 0)) : 0;
    return Date.UTC(y, mo - 1, da) / 1000 + secs;
  }

  // Order by date+time in the direction the service uses (newest-first or oldest-first)
  const newestFirst = values.length < 2 || rowTimestamp(values[0]) >= rowTimestamp(values[values.length - 1]);
  function sortBaskets(baskets) {
    const dir = newestFirst ? -1 : 1;
    return baskets
      .map((b, i) => ({ b, i, ts: rowTimestamp(b.rows[0]) }))
      .sort((x, y) => (x.ts - y.ts) * dir || x.i - y.i)
      .map((x) => x.b);
  }

  // today / yesterday / earlier, by the basket's first row
  function dayBucket(row) {
    const now = new Date();
    const todayStart = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 1000;
    const dayStart = Math.floor(rowTimestamp(row) / 86400) * 86400;
    const diffDays = Math.round((todayStart - dayStart) / 86400);
    if (diffDays <= 0) return "today";
    return diffDays === 1 ? "yesterday" : "earlier";
  }

  // ── Styles for return feature ────────────────────────────────────────
  const returnStyle = document.createElement("style");
  returnStyle.textContent = `
    .btn-row-select{border:1.5px solid #8b5e83;color:#8b5e83;background:transparent;cursor:pointer;font-size:11px;border-radius:4px;padding:2px 6px;line-height:1.4;}
    .btn-row-select:hover{background:#8b5e8322;}
    .btn-row-select.selected{background:#8b5e83;color:#fff;}
    .btn-row-select.is-pending{border-color:#e6a817;color:#e6a817;}
    .btn-row-select.is-pending.selected{background:#e6a817;color:#fff;}
    .return-toolbar{margin:8px 0;display:flex;align-items:center;gap:10px;}
    .btn-return-open{background:#8b5e83;color:#fff;border:none;padding:7px 16px;border-radius:4px;cursor:pointer;font-size:14px;}
    .btn-return-open:disabled{opacity:.4;cursor:not-allowed;}
    .btn-return-open:not(:disabled):hover{background:#7a4f72;}
    .return-sel-count{font-size:13px;color:#666;}
    #return-modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;overflow-y:auto;}
    #return-modal-overlay.active{display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;}
    #return-modal{background:#fff;border-radius:8px;max-width:700px;width:100%;padding:24px;}
    #return-modal h2{margin:0 0 16px;font-size:18px;}
    .return-items{margin:12px 0;max-height:300px;overflow-y:auto;}
    .return-item-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #eee;font-size:14px;}
    .return-item-row .ri-name{flex:1;}
    .return-badge{font-size:11px;padding:2px 7px;border-radius:10px;white-space:nowrap;}
    .badge-pending{background:#fff3cd;color:#856404;}
    .badge-approved{background:#d4edda;color:#155724;}
    .badge-rejected{background:#f8d7da;color:#721c24;}
    .return-reason-txt{width:100%;margin-top:10px;padding:7px;border:1px solid #ccc;border-radius:4px;font-size:14px;min-height:60px;resize:vertical;box-sizing:border-box;}
    .return-actions{display:flex;gap:8px;margin-top:16px;justify-content:flex-end;}
    .btn-cancel-return{background:#eee;border:none;padding:7px 14px;border-radius:4px;cursor:pointer;}
    .btn-submit-return{background:#8b5e83;color:#fff;border:none;padding:7px 16px;border-radius:4px;cursor:pointer;}
    .return-approve-section{margin-top:14px;padding:12px;background:#fffde7;border:1px solid #ffe08a;border-radius:6px;}
    .return-approve-section h4{margin:0 0 8px;font-size:14px;}
    .approve-actions{display:flex;gap:8px;margin-top:10px;}
    .btn-approve{background:#28a745;color:#fff;border:none;padding:7px 16px;border-radius:4px;cursor:pointer;}
    .btn-reject{background:#dc3545;color:#fff;border:none;padding:7px 16px;border-radius:4px;cursor:pointer;}
    .row-is-returned td{text-decoration:line-through;color:#b0b0b0 !important;background:#fef2f2 !important;}
    .row-return-pending td{background:#fffbeb !important;}
    .btn-return-info{width:18px;height:18px;border:none;background:transparent;cursor:pointer;font-size:13px;color:#bbb;padding:0;line-height:1;vertical-align:middle;margin-right:1px;}
    .btn-return-info:hover{color:#777;}
    #return-detail-tooltip{position:absolute;z-index:2000;background:#fff;border:1px solid #e0e0e0;border-radius:6px;padding:10px 14px;box-shadow:0 4px 14px rgba(0,0,0,.15);min-width:200px;max-width:320px;font-size:13px;line-height:1.5;}
    .rdt-row{margin-bottom:3px;display:flex;gap:6px;}
    .rdt-label{font-weight:600;color:#666;white-space:nowrap;flex-shrink:0;}
    .rdt-val{color:#333;word-break:break-word;}
  `;
  document.head.appendChild(returnStyle);

  // ── State ────────────────────────────────────────────────────────────
  const selectedRowNums = new Set();
  const expanded = new Set();
  let searchQuery = "";

  const contentEl = document.getElementById("content");
  const listEl = document.getElementById("sales-baskets");

  function updateReturnBtn() {
    const btn = document.querySelector(".btn-return-open");
    const cnt = document.querySelector(".return-sel-count");
    if (btn) btn.disabled = selectedRowNums.size === 0;
    if (cnt) cnt.textContent = selectedRowNums.size > 0 ? `Выбрано: ${selectedRowNums.size}` : "";
  }

  // ── Return details tooltip ───────────────────────────────────────────
  function showReturnDetails(row, triggerEl) {
    const existing = document.getElementById("return-detail-tooltip");
    if (existing) {
      const isSame = existing.dataset.rownum === String(cell(row, idxRowNumber) || "");
      existing.remove();
      if (isSame) return;
    }
    const statusLabel = { pending: "⏳ Ожидает апрува", approved: "✅ Возвращён", rejected: "❌ Отклонён" };
    const retSt = String(cell(row, idxRetStatus) || "");
    const dateStr = [cell(row, idxRetDate), cell(row, idxRetTime)].filter(Boolean).join(" ");
    const fields = [
      ["Статус", isReturnRow(row) ? statusLabel.approved : (statusLabel[retSt] || retSt)],
      ["Дата", dateStr],
      ["Причина", String(cell(row, idxRetReason) || "")],
      ["Комментарий", String(cell(row, idxRetComment) || "")],
      ["Апрувил", String(cell(row, idxRetApprBy) || "")],
    ].filter(([, v]) => v);
    if (!fields.length) return;

    const tip = document.createElement("div");
    tip.id = "return-detail-tooltip";
    tip.dataset.rownum = String(cell(row, idxRowNumber) || "");
    tip.innerHTML = fields.map(([l, v]) =>
      `<div class="rdt-row"><span class="rdt-label">${l}:</span><span class="rdt-val">${esc(v)}</span></div>`
    ).join("");
    document.body.appendChild(tip);

    const rect = triggerEl.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    tip.style.top = (rect.bottom + scrollY + 4) + "px";
    tip.style.left = Math.max(8, rect.right - tip.offsetWidth - 8) + "px";

    setTimeout(() => {
      const close = (e) => {
        if (!tip.contains(e.target) && e.target !== triggerEl) {
          tip.remove();
          document.removeEventListener("click", close, true);
        }
      };
      document.addEventListener("click", close, true);
    }, 0);
  }

  // ── Rendering ────────────────────────────────────────────────────────
  function buildDetailRow(row) {
    const tr = document.createElement("tr");
    const isReturn = isReturnRow(row);
    const retStatus = String(cell(row, idxRetStatus) || "");
    const rowNum = String(cell(row, idxRowNumber) || "");

    if (isReturn) tr.classList.add("row-is-returned");
    else if (retStatus === "pending") tr.classList.add("row-return-pending");

    visibleCols.forEach((i) => {
      const td = document.createElement("td");
      const colName = String(header[i] || "").toLowerCase();
      if (i === idxUser) {
        td.innerHTML = employeeBadge(row[i]);
      } else {
        td.textContent = i === idxPrice ? String(formatPriceValueRu(row[i]) ?? "") : String(row[i] ?? "");
      }
      if (["price", "finalpricevnd", "finalprice"].includes(colName)) td.className = "num";
      tr.appendChild(td);
    });

    const td = document.createElement("td");
    td.style.cssText = "text-align:center;width:60px;white-space:nowrap;";
    if (isReturn || retStatus) {
      const infoBtn = document.createElement("button");
      infoBtn.className = "btn-return-info";
      infoBtn.textContent = "ℹ";
      infoBtn.title = "Детали возврата";
      infoBtn.addEventListener("click", (e) => { e.stopPropagation(); showReturnDetails(row, infoBtn); });
      td.appendChild(infoBtn);
    }
    if (!isReturn && rowNum) {
      const isPending = retStatus === "pending";
      const btn = document.createElement("button");
      btn.className = "btn-row-select" + (isPending ? " is-pending" : "");
      btn.title = isPending ? "Ожидает апрува — выбрать для апрува" : "Выбрать для возврата";
      const isSelected = selectedRowNums.has(rowNum);
      btn.textContent = isSelected ? "✓" : "Return";
      btn.classList.toggle("selected", isSelected);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selectedRowNums.has(rowNum)) selectedRowNums.delete(rowNum);
        else selectedRowNums.add(rowNum);
        const nowSelected = selectedRowNums.has(rowNum);
        btn.classList.toggle("selected", nowSelected);
        btn.textContent = nowSelected ? "✓" : "Return";
        updateReturnBtn();
      });
      td.appendChild(btn);
    }
    tr.appendChild(td);
    return tr;
  }

  function buildBasketRows(basket, showDate) {
    const rows = basket.rows;
    const first = rows[0];
    const open = expanded.has(basket.key);

    const active = rows.filter((r) => !isReturnRow(r));
    const total = rows.reduce((s, r) => s + parseMoney(cell(r, idxFinalPrice)), 0);
    const allReturned = active.length === 0;
    const users = Array.from(new Set(rows.map((r) => normName(cell(r, idxUser))).filter(Boolean)));
    const dateStr = (showDate ? [cell(first, idxDate), cell(first, idxTime)] : [cell(first, idxTime)]).filter(Boolean).join(" ");
    const payments = Array.from(new Set(rows.map((r) => String(cell(r, idxPayment) || "").trim()).filter(Boolean)));
    const itemsHtml = rows.map((r) => {
      const label = String(cell(r, idxName) || "");
      return `<div${isReturnRow(r) ? ' style="text-decoration:line-through;color:#b0b0b0"' : ""}>${esc(label)}</div>`;
    }).join("");

    const tr = document.createElement("tr");
    tr.className = "sb-basket" + (open ? " is-open" : "");
    tr.innerHTML = `
      <td><span class="sb-toggle">▶</span>${esc(dateStr)}</td>
      <td>${cell(first, idxStore) ? `<span class="store-chip">${esc(cell(first, idxStore))}</span>` : ""}</td>
      <td>${users.map(employeeBadge).join(" ")}</td>
      <td>${esc(payments.join(", "))}</td>
      <td class="num"${allReturned ? ' style="text-decoration:line-through;color:#b0b0b0"' : ""}>${esc(total.toLocaleString("ru-RU"))}</td>
      <td class="sb-items">${itemsHtml}</td>`;
    tr.addEventListener("click", () => {
      if (expanded.has(basket.key)) expanded.delete(basket.key);
      else expanded.add(basket.key);
      render();
    });

    const out = [tr];
    if (open) {
      const detail = document.createElement("tr");
      detail.className = "sb-detail";
      const td = document.createElement("td");
      td.colSpan = 6;
      const wrap = document.createElement("div");
      wrap.className = "sb-detail-wrap";
      const table = document.createElement("table");
      table.className = "sb-detail-table";
      table.innerHTML = `<thead><tr>${visibleCols.map((i) => `<th${["price", "finalpricevnd", "finalprice"].includes(String(header[i] || "").toLowerCase()) ? ' class="num"' : ""}>${esc(header[i])}</th>`).join("")}<th></th></tr></thead><tbody></tbody>`;
      const tbody = table.querySelector("tbody");
      rows.forEach((r) => tbody.appendChild(buildDetailRow(r)));
      wrap.appendChild(table);
      td.appendChild(wrap);
      detail.appendChild(td);
      out.push(detail);
    }
    return out;
  }

  function render() {
    const q = searchQuery.trim().toLowerCase();
    const rows = q
      ? values.filter((r) => r.some((v) => String(v ?? "").toLowerCase().includes(q)))
      : values;
    const baskets = sortBaskets(groupBaskets(rows)).filter((b) =>
      b.rows.some((r) => filterDefs.every((f) => !f.value || normName(cell(r, f.idx)).toLowerCase() === f.value.toLowerCase()))
    );

    listEl.innerHTML = "";
    if (!baskets.length) {
      listEl.innerHTML = '<div class="sb-empty">Нет данных</div>';
      return;
    }
    const table = document.createElement("table");
    table.className = "sb-table";
    table.innerHTML = `<thead><tr><th>Время</th><th>Магазин</th><th>Продавец</th><th>Оплата</th><th class="num">Amount</th><th>Товары</th></tr></thead><tbody></tbody>`;
    const tbody = table.querySelector("tbody");
    let lastBucket = "today";
    const labels = { yesterday: "Вчера", earlier: "Раньше" };
    baskets.forEach((b) => {
      const bucket = dayBucket(b.rows[0]);
      if (bucket !== lastBucket) {
        lastBucket = bucket;
        const sep = document.createElement("tr");
        sep.className = "sb-day";
        sep.innerHTML = `<td colspan="6">${labels[bucket] || ""}</td>`;
        tbody.appendChild(sep);
      }
      buildBasketRows(b, bucket === "earlier").forEach((tr) => tbody.appendChild(tr));
    });
    listEl.appendChild(table);
  }

  // ── Search ───────────────────────────────────────────────────────────
  const wrap = document.createElement("div");
  wrap.className = "table-toolbar";
  const placeholder = typeof window.localizeUiText === "function"
    ? window.localizeUiText("Поиск по продажам...", "Поиск по продажам...")
    : "Поиск по продажам...";
  wrap.innerHTML = `<input id="salesFullTextSearch" type="text" placeholder="${esc(placeholder)}" />`;
  const toolbarRow = document.createElement("div");
  toolbarRow.className = "sb-toolbar-row";
  contentEl.insertBefore(toolbarRow, listEl);
  toolbarRow.appendChild(wrap);
  const deb = debounce((val) => { searchQuery = val; render(); }, 200);
  document.getElementById("salesFullTextSearch").addEventListener("input", (e) => deb(e.target.value));

  // ── Filters (seller / store / payment) ───────────────────────────────
  const serverFilters = Array.isArray(payload?.filterOptions) ? payload.filterOptions : [];
  const filterDefs = [
    { col: "username", label: "Продавец", idx: idxUser, value: "" },
    { col: "store", label: "Магазин", idx: idxStore, value: "" },
    { col: "paymentmethod", label: "Оплата", idx: idxPayment, value: "" },
  ].filter((f) => f.idx >= 0);

  function filterValues(f) {
    const opt = serverFilters.find((o) => String(o?.header || "").toLowerCase() === f.col);
    const fromServer = [opt?.values, opt?.options, opt?.items].find(Array.isArray);
    const raw = fromServer || values.map((r) => cell(r, f.idx));
    const list = Array.from(new Set(raw.map(normName).filter(Boolean)));
    return list.sort((a, b) => a.localeCompare(b, "ru"));
  }

  const filtersEl = document.createElement("div");
  filtersEl.className = "sb-filters";
  filterDefs.forEach((f) => {
    const sel = document.createElement("select");
    sel.className = "sb-filter";
    sel.title = f.label;
    sel.innerHTML = `<option value="">${esc(f.label)}: все</option>` +
      filterValues(f).map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
    sel.addEventListener("change", () => { f.value = sel.value; render(); });
    filtersEl.appendChild(sel);
  });
  toolbarRow.appendChild(filtersEl);

  // ── Return toolbar ───────────────────────────────────────────────────
  const returnToolbar = document.createElement("div");
  returnToolbar.className = "return-toolbar";
  returnToolbar.innerHTML = `
    <button class="btn-return-open" disabled>Return</button>
    <span class="return-sel-count"></span>`;
  toolbarRow.appendChild(returnToolbar);

  // ── Modal ────────────────────────────────────────────────────────────
  const returnOverlay = document.createElement("div");
  returnOverlay.id = "return-modal-overlay";
  returnOverlay.innerHTML = `
    <div id="return-modal">
      <h2>Return</h2>
      <div id="return-items-list" class="return-items"></div>
      <div id="return-reason-wrap" style="display:none">
        <textarea class="return-reason-txt" id="return-reason-txt" placeholder="Причина возврата..."></textarea>
      </div>
      <div id="return-approve-wrap" class="return-approve-section" style="display:none">
        <h4>⚠ Запросы на возврат ожидают апрува</h4>
        <div id="return-approve-reasons" style="font-size:13px;color:#555;margin-bottom:8px;"></div>
        <textarea class="return-reason-txt" id="approve-comment-txt" placeholder="Комментарий (необязательно)..."></textarea>
        <div class="approve-actions">
          <button class="btn-reject" id="btn-do-reject">Отклонить</button>
          <button class="btn-approve" id="btn-do-approve">Апрувить</button>
        </div>
      </div>
      <div class="return-actions">
        <button class="btn-cancel-return" id="btn-cancel-return">Отмена</button>
        <button class="btn-submit-return" id="btn-submit-return">Запросить возврат</button>
      </div>
    </div>`;
  document.body.appendChild(returnOverlay);

  function openReturnModal() {
    if (selectedRowNums.size === 0) return;
    const selectedRows = values.filter((row) => {
      const rn = String(cell(row, idxRowNumber) || "");
      return rn && selectedRowNums.has(rn);
    });
    const pendingRows = selectedRows.filter((r) => String(cell(r, idxRetStatus) || "") === "pending");
    const requestRows = selectedRows.filter((r) => String(cell(r, idxRetStatus) || "") !== "pending");

    const itemsList = document.getElementById("return-items-list");
    itemsList.innerHTML = "";
    selectedRows.forEach((row) => {
      const article = String(cell(row, idxArticle) || "");
      const name = String(cell(row, idxName) || "");
      const price = cell(row, idxFinalPrice);
      const status = String(cell(row, idxRetStatus) || "");
      const priceStr = price ? Number(price).toLocaleString("ru-RU") + " ₫" : "";
      let badge = "";
      if (status === "pending") badge = `<span class="return-badge badge-pending">Ожидает апрува</span>`;
      else if (status === "rejected") badge = `<span class="return-badge badge-rejected">Отклонён</span>`;
      const div = document.createElement("div");
      div.className = "return-item-row";
      div.innerHTML = `<span class="ri-name">${esc(article)}${name ? " — " + esc(name) : ""}${priceStr ? " · " + esc(priceStr) : ""}</span>${badge}`;
      itemsList.appendChild(div);
    });

    const reasonWrap = document.getElementById("return-reason-wrap");
    const approveWrap = document.getElementById("return-approve-wrap");
    const submitBtn = document.getElementById("btn-submit-return");
    document.getElementById("return-reason-txt").value = "";
    document.getElementById("approve-comment-txt").value = "";

    if (pendingRows.length) {
      document.getElementById("return-approve-reasons").innerHTML = pendingRows.map((r) => {
        const reason = String(cell(r, idxRetReason) || "");
        const article = String(cell(r, idxArticle) || "");
        return `<div>${esc(article)}${reason ? ": " + esc(reason) : ""}</div>`;
      }).join("");
      approveWrap.style.display = "block";
    } else {
      approveWrap.style.display = "none";
    }

    reasonWrap.style.display = requestRows.length ? "block" : "none";
    submitBtn.style.display = requestRows.length ? "" : "none";
    returnOverlay.classList.add("active");
  }

  returnToolbar.querySelector(".btn-return-open").addEventListener("click", openReturnModal);
  document.getElementById("btn-cancel-return").addEventListener("click", () => returnOverlay.classList.remove("active"));
  returnOverlay.addEventListener("click", (e) => { if (e.target === returnOverlay) returnOverlay.classList.remove("active"); });

  document.getElementById("btn-submit-return").addEventListener("click", async () => {
    const requestRows = values.filter((row) => {
      const rn = String(cell(row, idxRowNumber) || "");
      return rn && selectedRowNums.has(rn) && String(cell(row, idxRetStatus) || "") !== "pending";
    });
    const rowNums = requestRows.map((r) => Number(r[idxRowNumber])).filter(Boolean);
    const basketid = requestRows.length && idxBasketid >= 0 ? String(requestRows[0][idxBasketid] || "") : "";
    const reason = (document.getElementById("return-reason-txt")?.value || "").trim();
    if (!rowNums.length) return;
    const btn = document.getElementById("btn-submit-return");
    btn.disabled = true; btn.textContent = "Отправка...";
    try {
      const result = await window.API.requestReturn({
        action: "requestReturn",
        basketid,
        row_numbers: rowNums,
        reason,
        token: window.token,
      });
      if (result?.success) {
        returnOverlay.classList.remove("active");
        selectedRowNums.clear();
        updateReturnBtn();
        render();
        alert("Запрос на возврат отправлен.");
      } else {
        alert("Ошибка: " + JSON.stringify(result));
      }
    } catch (e) { alert("Ошибка: " + e.message); }
    finally { btn.disabled = false; btn.textContent = "Запросить возврат"; }
  });

  async function doDecision(decision) {
    const pendingRows = values.filter((row) => {
      const rn = String(cell(row, idxRowNumber) || "");
      return rn && selectedRowNums.has(rn) && String(cell(row, idxRetStatus) || "") === "pending";
    });
    const rowNums = pendingRows.map((r) => Number(r[idxRowNumber])).filter(Boolean);
    const basketid = pendingRows.length && idxBasketid >= 0 ? String(pendingRows[0][idxBasketid] || "") : "";
    const comment = (document.getElementById("approve-comment-txt")?.value || "").trim();
    const username = window.currentLoginName || window.username || "";
    const ab = document.getElementById("btn-do-approve");
    const rb = document.getElementById("btn-do-reject");
    ab.disabled = rb.disabled = true;
    try {
      const result = await window.API.approveReturn({
        action: "approveReturn",
        basketid,
        row_numbers: rowNums,
        decision,
        comment,
        username,
        token: window.token,
      });
      if (result?.success) {
        returnOverlay.classList.remove("active");
        selectedRowNums.clear();
        updateReturnBtn();
        render();
        alert(decision === "approved" ? "Возврат выполнен." : "Возврат отклонён.");
      } else {
        alert("Ошибка: " + JSON.stringify(result));
      }
    } catch (e) { alert("Ошибка: " + e.message); }
    finally { ab.disabled = rb.disabled = false; }
  }

  document.getElementById("btn-do-approve").addEventListener("click", () => doDecision("approved"));
  document.getElementById("btn-do-reject").addEventListener("click", () => doDecision("rejected"));

  render();
}
