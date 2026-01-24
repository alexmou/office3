
// Calendar month view: 7x6 grid, with per-day assignments and modal editing.
// Data I/O via window.API (system/api.js); with fallback to getDataFromN8n/postDataToN8n.
// FIX: use local-date ISO (YYYY-MM-DD) without UTC conversion to avoid off-by-one.
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

  let META = { stores: [], employees: [] };
  let MODE = 'plan'; // 'plan' | 'actual'
  let CURRENT_STORE = ''; // empty means ALL stores by default
  let CACHED_ROWS = []; // last loaded schedule for month (array of rows)

  function resetState(){
    META = { stores: [], employees: [] };
    MODE = 'plan';
    CURRENT_STORE = '';
    CACHED_ROWS = [];
    MODAL_DATE_ISO = '';
  }

  // ---- Helpers (LOCAL date only) ----
  const pad = n => String(n).padStart(2,'0');
  function ymNow(){ const n=new Date(); return `${n.getFullYear()}-${pad(n.getMonth()+1)}`; }
  function toLocalISO(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  function parseISO(iso){ const [y,m,dd]=iso.split('-').map(Number); return new Date(y, m-1, dd); }
  function addMonths(ym, delta){
    const [y,m]=ym.split('-').map(Number);
    const dt=new Date(y, m-1+delta, 1);
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}`;
  }
  function monthRange(ym){
    const [y,m]=ym.split('-').map(Number);
    return {Year: y, Month: m };
  }
  function mondayOfWeek(d){
    // Map Sun..Sat -> 6,0,1,2,3,4,5 so that Monday=0
    const day = (d.getDay()+6)%7;
    const res = new Date(d); res.setDate(d.getDate()-day); return res;
  }
  function minutesToTime(totalMinutes){
    const mins = Math.max(0, Math.round(totalMinutes));
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  }
  function buildTimeOptions(minMinutes, maxMinutes, stepMinutes){
    const res = [];
    const step = Math.max(1, Number(stepMinutes) || 1);
    for (let m = minMinutes; m <= maxMinutes; m += step) {
      res.push(minutesToTime(m));
    }
    return res;
  }
  const TIME_STEP_MINUTES = 30;
  const TIME_START_OPTIONS = buildTimeOptions(8 * 60, 23 * 60 + 30, TIME_STEP_MINUTES);
  const TIME_END_OPTIONS = buildTimeOptions(8 * 60, 24 * 60, TIME_STEP_MINUTES);

  function populateTimeSelect(selectEl, options){
    if (!selectEl) return;
    if (selectEl.__timeOptionsReady) return;
    selectEl.innerHTML = (options || []).map((t) => `<option value="${t}">${t}</option>`).join('');
    selectEl.__timeOptionsReady = true;
  }
  function buildCalendarDays(ym){
    const [y,m]=ym.split('-').map(Number);
    const first = new Date(y,m-1,1);
    const start = mondayOfWeek(first);
    const days = [];
    for(let i=0;i<42;i++){
      const d = new Date(start); d.setDate(start.getDate()+i);
      days.push({
        iso: toLocalISO(d),
        inMonth: d.getMonth()===(m-1),
        wd: (d.getDay()+6)%7 // Mon=0..Sun=6
      });
    }
    return days; // 6 weeks * 7 days
  }
  function parseTimeToMinutes(value){
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const normalized = raw.replace(',', ':').replace('.', ':');
    const parts = normalized.split(':').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    const hh = Number(parts[0]);
    const mm = parts.length > 1 ? Number(parts[1]) : 0;
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    const total = hh * 60 + mm;
    return total >= 0 ? total : null;
  }
  function durationHours(startValue, endValue){
    const startMin = parseTimeToMinutes(startValue);
    let endMin = parseTimeToMinutes(endValue);
    if (startMin == null || endMin == null) return 0;

    // Treat 00:00 as end-of-day when start is in the working range.
    // This covers backends that store 24:00 as 00:00.
    if (endMin === 0 && startMin >= 8 * 60) {
      endMin = 24 * 60;
    }

    // Cross-midnight safety: if end is earlier, assume next day.
    if (endMin < startMin) {
      endMin += 24 * 60;
    }

    return Math.max(0, (endMin - startMin) / 60);
  }
  function hoursOf(row){
    const ps = row.PlanStart, pe=row.PlanEnd, as=row.ActualStart, ae=row.ActualEnd;
    if (MODE === 'plan') {
      const planned = durationHours(ps, pe);
      if (planned > 0) return planned;
      return durationHours(as, ae);
    }
    return durationHours(as, ae);
  }

  // ---- Data IO ----
  function getMetaEmployees(){
    if (Array.isArray(META)) return (META[0] && Array.isArray(META[0].employees)) ? META[0].employees : [];
    return META && Array.isArray(META.employees) ? META.employees : [];
  }

  function getMetaStores(){
    if (Array.isArray(META)) return (META[1] && Array.isArray(META[1].stores)) ? META[1].stores : [];
    return META && Array.isArray(META.stores) ? META.stores : [];
  }

  function normalizeStoreName(value){
    return String(value || '').trim();
  }

  function deriveStoresFromRows(rows){
    const set = new Set();
    (rows || []).forEach((r) => {
      const v = normalizeStoreName(r?.Store ?? r?.store ?? '');
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }

  function deriveEmployeesFromRows(rows){
    const set = new Set();
    (rows || []).forEach((r) => {
      const v = normalizeEmployeeName(r?.Employee ?? r?.employee ?? '');
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
  }

  function unwrapMaybe(value, depth = 0){
    if (depth > 8) return value;
    if (value == null) return null;
    if (typeof value === 'string') {
      try { return unwrapMaybe(JSON.parse(value), depth + 1); } catch (_) { return value; }
    }
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') {
      // Preserve schedule meta object shape
      if (Array.isArray(value.employees) || Array.isArray(value.stores)) return value;
      // Common wrappers
      if (value.data !== undefined) return unwrapMaybe(value.data, depth + 1);
      if (value.result !== undefined) return unwrapMaybe(value.result, depth + 1);
      if (value.payload !== undefined) return unwrapMaybe(value.payload, depth + 1);
      // If it's a single-key wrapper around an array/object
      const keys = Object.keys(value);
      if (keys.length === 1) {
        const only = value[keys[0]];
        return unwrapMaybe(only, depth + 1);
      }
      return value;
    }
    return value;
  }

  function normalizeScheduleMeta(raw){
    const result = { employees: [], stores: [] };

    const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
    const looksLikeEmployeeList = (arr) =>
      Array.isArray(arr) &&
      arr.length > 0 &&
      arr.every((v) => {
        if (typeof v === 'string') return true;
        return isObj(v) && ('employee' in v || 'Employee' in v || 'name' in v);
      });
    const looksLikeStoreList = (arr) =>
      Array.isArray(arr) &&
      arr.length > 0 &&
      arr.every((v) => {
        if (typeof v === 'string') return true;
        return isObj(v) && ('store' in v || 'Store' in v || 'name' in v);
      });

    const consume = (val) => {
      if (result.employees.length && result.stores.length) return;
      const v = unwrapMaybe(val);
      if (v == null) return;

      if (Array.isArray(v)) {
        if (result.employees.length === 0 && looksLikeEmployeeList(v)) result.employees = v;
        if (result.stores.length === 0 && looksLikeStoreList(v)) result.stores = v;
        v.forEach((item) => consume(item));
        return;
      }

      if (isObj(v)) {
        if (result.employees.length === 0 && Array.isArray(v.employees)) result.employees = v.employees;
        if (result.stores.length === 0 && Array.isArray(v.stores)) result.stores = v.stores;
      }
    };

    consume(raw);
    return result;
  }

  function normalizeEmployeeName(value){
    return String(value || '').trim();
  }

  function mergeEmployeesFromRowsIntoMeta(rows){
    const derived = deriveEmployeesFromRows(rows);
    if (!derived.length) return;

    const existing = getMetaEmployees().map((e) => normalizeEmployeeName(e?.employee || e?.Employee || e?.name || e)).filter(Boolean);
    const merged = Array.from(new Set(existing.concat(derived)));
    merged.sort((a, b) => a.localeCompare(b, 'ru'));
    META.employees = merged.map((name) => ({ employee: name }));
  }

  async function ensureEmployeesFromHistory(startYm){
    const existing = getMetaEmployees()
      .map((e) => normalizeEmployeeName(e?.employee || e?.Employee || e?.name || e))
      .filter(Boolean);
    const collected = new Set(existing);
    for (let i = 0; i < 12; i++) {
      const ym = addMonths(startYm, -i);
      const query = { action: 'getSchedule', visible: true, mode: "no test", Ym: ym };
      const raw = i === 0 ? CACHED_ROWS : (await window.API.getSchedule(query, { mode: query.mode, overlayId: "schedule" })) || [];
      const rows = Array.isArray(raw) ? raw : (raw?.data?.data || raw?.data || []);
      deriveEmployeesFromRows(Array.isArray(rows) ? rows : []).forEach((name) => collected.add(name));
    }

    const names = Array.from(collected);
    names.sort((a, b) => a.localeCompare(b, 'ru'));
    if (names.length) {
      META.employees = names.map((name) => ({ employee: name }));
    }
  }

  function employeeColorIndex(employeeName){
    const name = normalizeEmployeeName(employeeName);
    if (!name) return null;

    // Deterministic hash -> color bucket (stable even when the employee list changes).
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % 12;
  }

  async function loadMeta(){
    const params = { visible: true, mode: "no test" };
    if (!window.API || typeof window.API.getScheduleMeta !== "function") {
      throw new Error("API.getScheduleMeta is not available");
    }
    const res = await window.API.getScheduleMeta(params, { mode: params.mode, overlayId: "schedule" });
    const normalized = normalizeScheduleMeta(res);
    META = normalized;

    // Fallback: getStores() is stable and returns storeName values needed by schedule UI.
    if (!getMetaStores().length && window.API && typeof window.API.getStores === "function") {
      try {
        const stores = await window.API.getStores({}, { overlayId: "schedule" });
        const storeNames = (Array.isArray(stores) ? stores : [])
          .map((s) => normalizeStoreName(s?.store || s?.storeName || s?.name || s?.Store || s?.[1] || s))
          .filter(Boolean);
        META.stores = storeNames.map((store) => ({ store }));
      } catch (e) {
        console.warn("Failed to load stores for schedule", e);
      }
    }
    // keep CURRENT_STORE empty to show ALL stores by default
  }
  async function loadMonthData(ym){
    const query = { action: 'getSchedule', visible: true, mode: "no test",Ym:ym };
    if (!window.API || typeof window.API.getSchedule !== "function") {
      throw new Error("API.getSchedule is not available");
    }
    const rows = await window.API.getSchedule(query, { mode: query.mode, overlayId: "schedule" });
    CACHED_ROWS = Array.isArray(rows) ? rows : [];
    mergeEmployeesFromRowsIntoMeta(CACHED_ROWS);
  }
  async function saveRows(rows){
    if (!window.API || typeof window.API.upsertShifts !== "function") {
      throw new Error("API.upsertShifts is not available");
    }
    await window.API.upsertShifts(rows, { timeout: 8000, mode: "no test", overlayId: "schedule" });






  }

  // ---- Render ----
  function computeEmployeeHours(rows){
    const totalsByEmployee = new Map();
    const filtered = (rows || []).filter((r) => !CURRENT_STORE || String(r.Store)===String(CURRENT_STORE));

    filtered.forEach((r) => {
      const employee = normalizeEmployeeName(r.Employee);
      if (!employee) return;
      const hrs = Number(hoursOf(r)) || 0;
      if (hrs <= 0) return;
      totalsByEmployee.set(employee, (totalsByEmployee.get(employee) || 0) + hrs);
    });

    const items = Array.from(totalsByEmployee.entries()).map(([employee, hours]) => ({
      employee,
      hours,
      colorIndex: employeeColorIndex(employee),
    }));

    items.sort((a, b) => {
      const ai = a.colorIndex == null ? Number.MAX_SAFE_INTEGER : a.colorIndex;
      const bi = b.colorIndex == null ? Number.MAX_SAFE_INTEGER : b.colorIndex;
      if (ai !== bi) return ai - bi;
      return a.employee.localeCompare(b.employee, 'ru');
    });

    return items;
  }

  function renderLegendFromRows(rows){
    const legend = document.getElementById('schedule-legend');
    if (!legend) return;
    legend.innerHTML = '';

    const items = computeEmployeeHours(rows);
    if (items.length === 0) return;

    items.forEach((it) => {
      const badge = document.createElement('span');
      badge.className = 'badge employee';
      const colorIndex = it.colorIndex;
      badge.style.setProperty('--badge-bg', colorIndex != null && colorIndex >= 0 ? `var(--color${colorIndex})` : '#64748b');
      badge.textContent = `${it.employee}: ${formatHours(it.hours)}ч`;
      legend.appendChild(badge);
    });
  }

  function renderLegend(){
    renderLegendFromRows(CACHED_ROWS);
  }

  function formatHours(value){
    const hours = Number(value);
    if (!Number.isFinite(hours)) return '0';
    // UI works in 30-minute steps, so show hours rounded to nearest 0.5
    const rounded = Math.round(hours * 2) / 2;
    const isInt = Math.abs(rounded - Math.round(rounded)) < 1e-9;
    const text = isInt ? String(Math.round(rounded)) : rounded.toFixed(1);
    return text.replace('.', ',');
  }

  function renderCalendar(ym){
    const cal = $('#calendar');
    cal.innerHTML = '';
    const weekDays = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];
    // header row
    weekDays.forEach(w=>{
      const h = document.createElement('div');
      h.className='weekday';
      h.textContent=w;
      cal.appendChild(h);
    });
    const days = buildCalendarDays(ym);
    const todayISO = toLocalISO(new Date());

    // group rows by date
    const byDate = new Map();
    for(const r of CACHED_ROWS){
      const key = String(r.DateISO);
      if(!byDate.has(key)) byDate.set(key, []);
      byDate.get(key).push(r);
    }

    days.forEach(d=>{
      if(!d.inMonth){
        const placeholder = document.createElement('div'); placeholder.className = 'day other';
        // empty cell (keeps grid but hides other-month dates)
        cal.appendChild(placeholder); return;
      }
      const cell = document.createElement('div');
      cell.className='day' + (d.iso===todayISO?' today':'') + ((d.wd>=5)?' weekend':'');

      // header
      const head = document.createElement('div'); head.className='day-head';
      const left = document.createElement('div');
      left.innerHTML = `<span class="day-num">${Number(d.iso.slice(8))}</span>`;
      const right = document.createElement('div'); right.className='day-dow'; 
      //right.textContent = weekDays[d.wd];
      head.appendChild(left); head.appendChild(right);
      cell.appendChild(head);

      // body assignments
      const body = document.createElement('div'); body.className='day-body';
      const rows = byDate.get(d.iso)||[];
      rows
        .filter(r => !CURRENT_STORE || String(r.Store)===String(CURRENT_STORE))
        .forEach(r=>{
          const colorIdx = employeeColorIndex(r.Employee);
          const line = document.createElement('div');
          line.className = colorIdx == null ? "assignment" : ("assignment color" + colorIdx);
          const hrs = formatHours(hoursOf(r));
          line.innerHTML = `<span class="store">${r.Store||''}</span> — <span class="emp">${r.Employee||''}</span> <span class="hrs">${hrs}ч</span>`;
          body.appendChild(line);
        });
      if(rows.length===0){
        const empty = document.createElement('div'); empty.className='assignment'; empty.style.opacity=.6;
        //empty.innerHTML = '<span class="emp">Нет записей</span>';
        
        body.appendChild(empty);
      }
      cell.appendChild(body);

      // open modal on click
      cell.addEventListener('click', async ()=> { await openDayModal(d.iso); });
      cal.appendChild(cell);
    });

    renderLegend();
  }

  function populateStoreSelect(){
    const sel = $('#schedule_store');
    sel.innerHTML = `<option value="">Все магазины</option>` +
      (getMetaStores()||[]).map(s=>{
        const v = s.store||s.name||s;
        return `<option value="${v}">${v}</option>`;
      }).join('');
    sel.value = CURRENT_STORE;
  }

  // ---- Modal ----
  let MODAL_DATE_ISO = '';
  async function openDayModal(dateISO){
    MODAL_DATE_ISO = dateISO;
    const modal = $('#day-modal');
    const d = parseISO(dateISO); // parse locally to avoid UTC shift
    $('#modal_date_str').textContent = d.toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric', weekday:'long' });
    $('#modal_store_str').textContent = CURRENT_STORE ? `Магазин: ${CURRENT_STORE}` : '';
    const tbody = $('#day_rows'); tbody.innerHTML='';

    const rows = (CACHED_ROWS||[]).filter(r=> String(r.DateISO)===dateISO && (!CURRENT_STORE || String(r.Store)===String(CURRENT_STORE)));
    rows.forEach(r=> appendDayRow(r));

    if(rows.length===0){ appendDayRow({ DateISO: dateISO, Store: CURRENT_STORE }); }

    renderLegendFromRows(getEffectiveRowsWithModalDraft());
    modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
  }

  function closeDayModal(){ const m=$('#day-modal'); m.classList.add('hidden'); m.setAttribute('aria-hidden','true'); }

  function appendDayRow(rec){
    const tr = $('#day-row-tmpl').content.firstElementChild.cloneNode(true);
   // tr.querySelector('.cell-store').value = rec.Store || CURRENT_STORE || '';


    const stores = tr.querySelector('.cell-store');
    const storeList = (getMetaStores()||[]);
    const fallbackStores = storeList.length ? storeList : deriveStoresFromRows(CACHED_ROWS);
    const storeOptions = fallbackStores.length ? fallbackStores : ([rec.Store || CURRENT_STORE].filter(Boolean));
    if (!storeOptions.length) storeOptions.push('');
    stores.innerHTML = storeOptions
      .map((s)=>{
        const v = s?.store || s?.name || s;
        const text = normalizeStoreName(v);
        const label = text || '—';
        return `<option value="${text}">${label}</option>`;
      }).join('');
    if (rec.Store) {
      stores.value = normalizeStoreName(rec.Store);
    } else if (CURRENT_STORE) {
      stores.value = normalizeStoreName(CURRENT_STORE);
    }



    const sel = tr.querySelector('.cell-employee');
    const empList = (getMetaEmployees()||[]);
    const fallbackEmployees = empList.length ? empList : deriveEmployeesFromRows(CACHED_ROWS);
    const filteredEmps = empList
      .filter((e)=> {
        const store = e?.store || e?.Store;
        return !CURRENT_STORE || !store || String(store)===String(CURRENT_STORE);
      });
    const filteredFallbackEmps = fallbackEmployees
      .filter((e)=> {
        const store = e?.store || e?.Store;
        return !CURRENT_STORE || !store || String(store)===String(CURRENT_STORE);
      });
    const empOptions = filteredEmps.length ? filteredEmps : (filteredFallbackEmps.length ? filteredFallbackEmps : ([rec.Employee].filter(Boolean)));
    if (!empOptions.length) empOptions.push('');
    sel.innerHTML = empOptions
      .map((e)=>{
        const v = e?.employee || e?.Employee || e?.name || e;
        const text = normalizeEmployeeName(v);
        const label = text || '—';
        return `<option value="${text}">${label}</option>`;
      }).join('');
    if (rec.Employee) sel.value = normalizeEmployeeName(rec.Employee);





    //tr.querySelector('.cell-plan-start').value = rec.PlanStart||'';
    //tr.querySelector('.cell-plan-end').value = rec.PlanEnd||'';
    const startEl = tr.querySelector('.cell-actual-start');
    const endEl = tr.querySelector('.cell-actual-end');
    populateTimeSelect(startEl, TIME_START_OPTIONS);
    populateTimeSelect(endEl, TIME_END_OPTIONS);

    const startValue = rec.ActualStart || '08:00';
    let endValue = rec.ActualEnd || '24:00';
    if (endValue === '00:00') endValue = '24:00';
    startEl.value = TIME_START_OPTIONS.includes(startValue) ? startValue : TIME_START_OPTIONS[0];
    endEl.value = TIME_END_OPTIONS.includes(endValue) ? endValue : TIME_END_OPTIONS[TIME_END_OPTIONS.length - 1];
  //  tr.querySelector('.cell-sales').value = Number(rec.SalesAmount||0);
    tr.querySelector('.cell-note').value = rec.Note||'';

    tr.querySelector('.cell-Id').value = rec.Id||'';

    const updateLegendDraft = () => renderLegendFromRows(getEffectiveRowsWithModalDraft());

    tr.querySelector('.row-del').addEventListener('click', ()=> {
      tr.style.display="none";
      tr.setAttribute("action",1);
      updateLegendDraft();
    });
    tr.querySelectorAll('input,select').forEach((el) => {
      el.addEventListener('change', updateLegendDraft);
      el.addEventListener('input', updateLegendDraft);
    });
    $('#day_rows').appendChild(tr);
  }

  function getEffectiveRowsWithModalDraft(){
    if (!MODAL_DATE_ISO) return CACHED_ROWS;
    const base = (CACHED_ROWS||[]).filter(r=> String(r.DateISO)!==String(MODAL_DATE_ISO));
    const draft = [];
    $$('#day_rows tr').forEach(tr=>{
      if (tr.style.display === 'none') return;
      if (String(tr.getAttribute('action')||'0') === '1') return;
      draft.push({
        DateISO: MODAL_DATE_ISO,
        Store: tr.querySelector('.cell-store')?.value,
        Employee: tr.querySelector('.cell-employee')?.value,
        PlanStart: tr.querySelector('.cell-plan-start')?.value,
        PlanEnd: tr.querySelector('.cell-plan-end')?.value,
        ActualStart: tr.querySelector('.cell-actual-start')?.value,
        ActualEnd: tr.querySelector('.cell-actual-end')?.value,
      });
    });
    return base.concat(draft);
  }

  async function modalSave(){
    const rows=[];
    const date = new Date(MODAL_DATE_ISO);
    const Year = date.getFullYear();        // 2025
    const Month = date.getMonth() + 1;      // 9 (нумерация месяцев с 0, поэтому +1)

    $$('#day_rows tr').forEach(tr=>{

    

      rows.push({
        ToDelete: tr.getAttribute("action","toDelete")||0,
        DateISO: MODAL_DATE_ISO,
        Year:Year,
        Month:Month,
        Id: tr.querySelector('.cell-Id').value || guidGenerator(),
        Store: tr.querySelector('.cell-store').value,
        Employee: tr.querySelector('.cell-employee').value,
       // PlanStart: tr.querySelector('.cell-plan-start').value,
       // PlanEnd: tr.querySelector('.cell-plan-end').value,
        ActualStart: tr.querySelector('.cell-actual-start').value,
        ActualEnd: tr.querySelector('.cell-actual-end').value,
       // SalesAmount: Number(tr.querySelector('.cell-sales').value||0),
        Note: tr.querySelector('.cell-note').value||''
      });
    });
    await saveRows(rows);
    closeDayModal();
    await reloadAll(); // refresh month view
  }

  // ---- Load/Reload ----
  async function reloadAll(){
    const ym = $('#schedule_month').value;
    await loadMonthData(ym);
    renderCalendar(ym);
  }

  async function initSchedulePage(){
    resetState();
    // default to current month
    $('#schedule_month').value = ymNow();

    // listeners
    $('#month_prev').addEventListener('click', async ()=>{ const ym = addMonths($('#schedule_month').value, -1); $('#schedule_month').value = ym; await reloadAll(); });
    $('#month_next').addEventListener('click', async ()=>{ const ym = addMonths($('#schedule_month').value, +1); $('#schedule_month').value = ym; await reloadAll(); });
    document.querySelectorAll('input[name="schedule_mode"]').forEach(r=> r.addEventListener('change', ()=>{ MODE=r.value; renderCalendar($('#schedule_month').value); }));
    $('#schedule_store').addEventListener('change', async (e)=>{ CURRENT_STORE = e.target.value; await reloadAll(); });
   
   /*
    $('#schedule_payroll').addEventListener('click', async ()=>{
      const ym = $('#schedule_month').value + '-01';
      const query = { action: 'computePayroll', visible: true, TESTING: CONFIG.GLOBAL_EXECUTION_TESTING, monthISO: ym };
      if (CURRENT_STORE) query.store = CURRENT_STORE;
      const res = await window.API.computePayroll(query, { overlayId: "schedule" }) || [];
      const total = (Array.isArray(res)?res:[]).reduce((a,r)=>a+(Number(r.PayTotal)||0),0);
      alert('Расчёт выполнен. Сотрудников: '+ (res.length||0) + '\nИтого к выплате: ' + (total||0).toLocaleString());
    });
   */


    // modal controls
    $('#modal_save').addEventListener('click', modalSave);
    $('#modal_cancel').addEventListener('click', () => { closeDayModal(); renderLegend(); });
    $('#modal_close').addEventListener('click', () => { closeDayModal(); renderLegend(); });
    $('#add-article-btn').addEventListener('click', ()=> {
      appendDayRow({ DateISO: MODAL_DATE_ISO, Store: CURRENT_STORE });
      renderLegendFromRows(getEffectiveRowsWithModalDraft());
    });

    // load meta and month
    await loadMeta();
    populateStoreSelect();
    await reloadAll();
    await ensureEmployeesFromHistory($('#schedule_month').value);
  }

  /* ==== N8N CONTRACT EXAMPLES ====
     (unchanged; see previous version)
  */

  if (typeof registerPageInit === "function") {
    registerPageInit("schedule", initSchedulePage);
  } else {
    // Fallback (legacy shell): init if schedule page is already in DOM
    window.addEventListener("DOMContentLoaded", () => {
      if (document.getElementById("schedule-root")) {
        initSchedulePage();
      }
    });
  }
})();
