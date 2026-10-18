(function(){
  const PAGE_ID = "salaryperiod";
  const $ = (selector, root = document) => root.querySelector(selector);
  const pad = (value) => String(value).padStart(2, "0");

  let employees = [];
  let responseRows = [];
  let fixByEmployee = new Map();
  let percentByEmployee = new Map();
  let activeRequest = 0;

  function dateToInput(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function dateToServer(date, endOfDay = false) {
    const time = endOfDay ? "23:59:59" : "00:00:00";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time}`;
  }

  function parseServerDate(value) {
    const raw = String(value || "").trim();
    let match = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return new Date(NaN);
  }

  function unwrapPayload(value, depth = 0) {
    if (depth > 8 || value == null) return value;
    if (typeof value === "string") {
      try { return unwrapPayload(JSON.parse(value), depth + 1); } catch (_) { return value; }
    }
    if (Array.isArray(value)) return value;
    if (typeof value === "object") {
      for (const key of ["data", "result", "payload", "items"]) {
        if (value[key] !== undefined) return unwrapPayload(value[key], depth + 1);
      }
    }
    return value;
  }

  function normalizeEmployeeList(raw, depth = 0) {
    if (depth > 8) return [];
    const value = unwrapPayload(raw);
    if (Array.isArray(value)) {
      if (value.length && Array.isArray(value[0])) {
        const header = value[0].map((cell) => String(cell || "").trim().toLowerCase());
        const index = header.findIndex((name) => ["employee", "employees", "сотрудник", "сотрудники", "name"].includes(name));
        if (index >= 0) return value.slice(1).map((row) => row?.[index]).filter(Boolean);
      }
      return value.map((item) => {
        if (typeof item === "string") return item;
        return item?.employee ?? item?.Employee ?? item?.name ?? item?.Name ?? "";
      }).filter(Boolean).concat(value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        return normalizeEmployeeList(item.employees ?? item.Employees, depth + 1);
      }));
    }
    if (value && typeof value === "object") {
      if (Array.isArray(value.employees)) return normalizeEmployeeList(value.employees, depth + 1);
      if (Array.isArray(value.Employees)) return normalizeEmployeeList(value.Employees, depth + 1);
      const name = value.employee ?? value.Employee ?? value.name ?? value.Name;
      return name ? [name] : [];
    }
    return [];
  }

  // Backend now sends salaryFix and salaryPercent as separate lists (each keyed by Employee);
  // this walks the payload and sums both sides per employee.
  function parseSalaryPeriodResponse(raw) {
    const fix = new Map();
    const percent = new Map();
    const shiftRows = [];
    let recordCount = 0;

    function addFix(entry) {
      const name = employeeName(entry);
      if (!name) return;
      recordCount += 1;
      const amount = parseNumber(entry?.salaryFix ?? entry?.SalaryFix ?? entry?.fix ?? entry?.Fix);
      const rawHours = entry?.hours ?? entry?.Hours;
      const hours = rawHours === undefined || rawHours === null || rawHours === "" ? null : parseNumber(rawHours);
      const prev = fix.get(name) || { fix: 0, hours: null };
      fix.set(name, {
        fix: prev.fix + amount,
        hours: hours != null ? (prev.hours || 0) + hours : prev.hours,
      });
    }

    function addPercent(entry) {
      const name = employeeName(entry);
      if (!name) return;
      recordCount += 1;
      const amount = parseNumber(entry?.sum_salary ?? entry?.SumSalary ?? entry?.sumSalary ?? entry?.salaryPercent ?? entry?.SalaryPercent ?? entry?.percent ?? entry?.Percent);
      percent.set(name, (percent.get(name) || 0) + amount);
    }

    function visit(node) {
      if (Array.isArray(node)) { node.forEach(visit); return; }
      if (!node || typeof node !== "object") return;

      let matchedSection = false;
      Object.entries(node).forEach(([key, val]) => {
        const k = key.trim().toLowerCase();
        if (k === "salaryfix" && Array.isArray(val)) { val.forEach(addFix); matchedSection = true; }
        else if (k === "salarypercent" && Array.isArray(val)) { val.forEach(addPercent); matchedSection = true; }
      });
      if (matchedSection) return;

      // Legacy flat row shape: a single object carrying Employee + SalaryFix/SalaryPercent together.
      if (isShift(node)) { shiftRows.push(node); return; }
      if (employeeName(node)) {
        if (node.SalaryFix != null || node.salaryFix != null) addFix(node);
        if (node.SalaryPercent != null || node.salaryPercent != null || node.SumSalary != null || node.sumSalary != null) addPercent(node);
      }
    }

    visit(unwrapPayload(raw));
    return { fix, percent, shiftRows, recordCount };
  }

  function parseNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const normalized = String(value ?? "").replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatMoney(value) {
    const currency = String(window.CONFIG?.currency || "VND").trim();
    return `${parseNumber(value).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${currency}`;
  }

  function parseTime(value) {
    const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  function shiftHours(row) {
    const start = parseTime(row.ActualStart);
    let end = parseTime(row.ActualEnd);
    if (start == null || end == null) return 0;
    if (end === 0 && start >= 8 * 60) end = 24 * 60;
    if (end < start) end += 24 * 60;
    return Math.max(0, (end - start) / 60);
  }

  function employeeName(row) {
    return String(row?.Employee ?? row?.employee ?? "").trim();
  }

  function isShift(row) {
    return !!(row?.Date || row?.DateISO || row?.date) && (row?.ActualStart != null || row?.ActualEnd != null);
  }

  function getPeriod(kind = "fix") {
    const fromValue = $(`#salary-period-${kind}-from`).value;
    const toValue = $(`#salary-period-${kind}-to`).value;
    return {
      from: fromValue ? new Date(`${fromValue}T00:00:00`) : null,
      to: toValue ? new Date(`${toValue}T00:00:00`) : null,
    };
  }

  function shiftRowsForPeriod() {
    const { from, to } = getPeriod("fix");
    return responseRows.filter((row) => {
      if (!isShift(row)) return false;
      const date = parseServerDate(row.Date ?? row.DateISO ?? row.date);
      if (Number.isNaN(date.getTime())) return false;
      return (!from || date >= from) && (!to || date <= to);
    });
  }

  function buildEmployeeSummary() {
    const names = employees.slice();
    fixByEmployee.forEach((_, name) => { if (!names.includes(name)) names.push(name); });
    percentByEmployee.forEach((_, name) => { if (!names.includes(name)) names.push(name); });

    const hoursByEmployee = new Map();
    shiftRowsForPeriod().forEach((row) => {
      const name = employeeName(row);
      hoursByEmployee.set(name, (hoursByEmployee.get(name) || 0) + shiftHours(row));
      if (!names.includes(name)) names.push(name);
    });

    return names.sort((a, b) => a.localeCompare(b, "ru")).map((name) => {
      const fixEntry = fixByEmployee.get(name) || { fix: 0, hours: null };
      const percent = percentByEmployee.get(name) || 0;
      return {
        name,
        hours: fixEntry.hours ?? (hoursByEmployee.get(name) || 0),
        fix: fixEntry.fix,
        percent,
        total: fixEntry.fix + percent,
      };
    });
  }

  function makeCell(value, className = "") {
    const cell = document.createElement("td");
    cell.textContent = value;
    if (className) cell.className = className;
    return cell;
  }

  function renderSummary() {
    const tbody = $("#salary-period-summary");
    const tfoot = $("#salary-period-totals");
    const rows = buildEmployeeSummary();
    tbody.replaceChildren();
    tfoot.replaceChildren();

    if (!rows.length) {
      const tr = document.createElement("tr");
      const cell = makeCell("Нет данных за выбранный период");
      cell.colSpan = 5;
      cell.className = "salary-period__empty";
      tr.appendChild(cell);
      tbody.appendChild(tr);
      return;
    }

    const totals = rows.reduce((sum, row) => ({
      hours: sum.hours + row.hours,
      fix: sum.fix + row.fix,
      percent: sum.percent + row.percent,
      total: sum.total + row.total,
    }), { hours: 0, fix: 0, percent: 0, total: 0 });

    rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.append(
        makeCell(row.name),
        makeCell(row.hours.toLocaleString("ru-RU", { maximumFractionDigits: 2 })),
        makeCell(formatMoney(row.fix)),
        makeCell(formatMoney(row.percent)),
        makeCell(formatMoney(row.total))
      );
      tbody.appendChild(tr);
    });

    const totalRow = document.createElement("tr");
    totalRow.append(
      makeCell("Итого"),
      makeCell(totals.hours.toLocaleString("ru-RU", { maximumFractionDigits: 2 })),
      makeCell(formatMoney(totals.fix)),
      makeCell(formatMoney(totals.percent)),
      makeCell(formatMoney(totals.total))
    );
    tfoot.appendChild(totalRow);
  }

  function render() {
    renderSummary();
  }

  const RANGE_KINDS = ["fix", "percent"];

  function currentMonthBounds() {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }

  function resetRangeToMonth() {
    const bounds = currentMonthBounds();
    RANGE_KINDS.forEach((kind) => {
      $(`#salary-period-${kind}-from`).value = dateToInput(bounds.start);
      $(`#salary-period-${kind}-to`).value = dateToInput(bounds.end);
    });
  }

  function normalizeRange(kind) {
    const bounds = currentMonthBounds();
    const from = $(`#salary-period-${kind}-from`);
    const to = $(`#salary-period-${kind}-to`);
    const start = from.value ? new Date(`${from.value}T00:00:00`) : bounds.start;
    let end = to.value ? new Date(`${to.value}T00:00:00`) : bounds.end;
    if (start > end) end = start;
    from.value = dateToInput(start);
    to.value = dateToInput(end);
    return true;
  }

  function fetchPeriod(kind) {
    const { from, to } = getPeriod(kind);
    return window.API.getSalaryPeriod({
      action: "getSalaryPeriod",
      visible: true,
      dateFrom: dateToServer(from),
      dateTo: dateToServer(to, true),
      Year: from.getFullYear(),
      Month: from.getMonth() + 1,
    }, { overlayId: PAGE_ID });
  }

  function setStatus(message, state = "") {
    const status = $("#salary-period-status");
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function isContextActive(context) {
    return !context?.isActive || context.isActive();
  }

  async function loadEmployees(context) {
    const raw = await window.API.getScheduleMeta({ action: "getScheduleMeta", visible: true }, { overlayId: PAGE_ID });
    if (!isContextActive(context)) return false;
    employees = Array.from(new Set(normalizeEmployeeList(raw).map((name) => String(name).trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "ru"));
    return true;
  }

  async function loadSalaryPeriod(context) {
    if (!isContextActive(context)) return;
    const requestId = ++activeRequest;
    const button = $("#salary-period-reload");
    if (!RANGE_KINDS.every(normalizeRange)) return;
    button.disabled = true;
    setStatus("Загружаем данные…");
    try {
      const [rawFix, rawPercent] = await Promise.all(RANGE_KINDS.map(fetchPeriod));
      if (requestId !== activeRequest || !isContextActive(context)) return;
      const parsedFix = parseSalaryPeriodResponse(rawFix);
      const parsedPercent = parseSalaryPeriodResponse(rawPercent);
      fixByEmployee = parsedFix.fix;
      percentByEmployee = parsedPercent.percent;
      responseRows = parsedFix.shiftRows;
      render();
      const recordCount = parsedFix.recordCount + parsedPercent.recordCount;
      setStatus(recordCount ? `Загружено записей: ${recordCount}` : "Нет данных за выбранный период");
    } catch (error) {
      if (requestId !== activeRequest || !isContextActive(context) || error?.name === "AbortError") return;
      fixByEmployee = new Map();
      percentByEmployee = new Map();
      responseRows = [];
      render();
      if (error?.code === "EMPTY_SERVICE_RESPONSE") {
        setStatus("Нет данных за выбранный период");
      } else {
        console.error("Failed to load salary period", error);
        setStatus("Не удалось загрузить расчёт зарплаты", "error");
      }
    } finally {
      if (requestId === activeRequest && isContextActive(context)) button.disabled = false;
    }
  }

  function initSalaryPeriod(context) {
    context?.onCleanup?.(() => { activeRequest += 1; });
    const reload = () => loadSalaryPeriod(context);
    resetRangeToMonth();
    RANGE_KINDS.forEach((kind) => {
      $(`#salary-period-${kind}-from`).addEventListener("change", reload);
      $(`#salary-period-${kind}-to`).addEventListener("change", reload);
    });
    $("#salary-period-reload").addEventListener("click", reload);

    loadEmployees(context)
      .then((loaded) => loaded && reload())
      .catch((error) => {
        if (!isContextActive(context)) return;
        console.error("Failed to load schedule employees", error);
        setStatus("Не удалось загрузить список сотрудников из расписания", "error");
      });
  }

  if (typeof registerPageInit === "function") {
    registerPageInit(PAGE_ID, initSalaryPeriod);
  }
})();
