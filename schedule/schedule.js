
// Calendar month view: 7x6 grid, with per-day assignments and modal editing.
// Data I/O strictly via getDataFromN8n / postDataToN8n.
// FIX: use local-date ISO (YYYY-MM-DD) without UTC conversion to avoid off-by-one.
(function(){
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));

  let META = { stores: [], employees: [] };
  let MODE = 'plan'; // 'plan' | 'actual'
  let CURRENT_STORE = ''; // empty means ALL stores by default
  let CACHED_ROWS = []; // last loaded schedule for month (array of rows)

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
  function m2h(s){ if(!s) return 0; const [h,m]=s.split(':').map(Number); return h + (m||0)/60; }
  function hoursOf(row){
    const ps = row.PlanStart, pe=row.PlanEnd, as=row.ActualStart, ae=row.ActualEnd;
    return MODE==='plan' ? Math.max(0, m2h(pe)-m2h(ps)) : Math.max(0, m2h(ae)-m2h(as));
  }

  // ---- Data IO ----
  async function loadMeta(){
    const query = { action: 'getMeta', visible: true, mode: "no test" };
    const res = await getDataFromN8n('schedule', { data: { query } },);
    console.log("res",res)
    META = res || META;
    // keep CURRENT_STORE empty to show ALL stores by default
    console.log("META",META)
  }
  async function loadMonthData(ym){
    const {startISO,endISO}=monthRange(ym);
    const query = { action: 'getSchedule', visible: true, mode: "no test",Ym:ym };
    if (CURRENT_STORE) query.store = CURRENT_STORE;
    const rows = await getDataFromN8n('schedule', { data: { query } }) || [];
    CACHED_ROWS = rows;
  }
  async function saveRows(rows){
    const query = { action: 'upsertShifts', visible: true};

       const resp = await postDataToN8n('schedule?action=upsertShifts',
        
        {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(rows)
          
        },
        8000,
        "no test"
      );
      if (!resp.ok) throw new Error(await resp.text());






   // await postDataToN8n('schedule', { data: { query, rows } }, "", "test");
  }

  // ---- Render ----
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
          const line = document.createElement('div'); line.className="assignment color" + META[0].employees.findIndex(e => e.employee === r.Employee);
          const hrs = hoursOf(r).toFixed(0);
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
      cell.addEventListener('click', ()=> openDayModal(d.iso));
      cal.appendChild(cell);
    });
  }

  function populateStoreSelect(){
    const sel = $('#schedule_store');
    sel.innerHTML = `<option value="">Все магазины</option>` +
      (META[1].stores||[]).map(s=>{
        const v = s.store||s.name||s;
        return `<option value="${v}">${v}</option>`;
      }).join('');
    sel.value = CURRENT_STORE;
  }

  // ---- Modal ----
  let MODAL_DATE_ISO = '';
  function openDayModal(dateISO){
    MODAL_DATE_ISO = dateISO;
    const modal = $('#day-modal');
    const d = parseISO(dateISO); // parse locally to avoid UTC shift
    $('#modal_date_str').textContent = d.toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric', weekday:'long' });
    $('#modal_store_str').textContent = CURRENT_STORE ? `Магазин: ${CURRENT_STORE}` : '';
    const tbody = $('#day_rows'); tbody.innerHTML='';

    const rows = (CACHED_ROWS||[]).filter(r=> String(r.DateISO)===dateISO && (!CURRENT_STORE || String(r.Store)===String(CURRENT_STORE)));
    rows.forEach(r=> appendDayRow(r));

    if(rows.length===0){ appendDayRow({ DateISO: dateISO, Store: CURRENT_STORE }); }

    modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
  }

  function closeDayModal(){ const m=$('#day-modal'); m.classList.add('hidden'); m.setAttribute('aria-hidden','true'); }

  function appendDayRow(rec){
    const tr = $('#day-row-tmpl').content.firstElementChild.cloneNode(true);
   // tr.querySelector('.cell-store').value = rec.Store || CURRENT_STORE || '';


    const stores = tr.querySelector('.cell-store');
    stores.innerHTML = (META[1].stores||[])
           .map(e=>`<option value="${e.store}">${e.store}</option>`).join('');
    if(rec.Store) stores.value = rec.Store;



    const sel = tr.querySelector('.cell-employee');
    sel.innerHTML = (META[0].employees||[])
      .filter(e=> !CURRENT_STORE || String(e.store)===String(CURRENT_STORE))
      .map(e=>`<option value="${e.employee}">${e.employee}</option>`).join('');
    if(rec.Employee) sel.value = rec.Employee;





    //tr.querySelector('.cell-plan-start').value = rec.PlanStart||'';
    //tr.querySelector('.cell-plan-end').value = rec.PlanEnd||'';
    tr.querySelector('.cell-actual-start').value = rec.ActualStart||'11:00';
    tr.querySelector('.cell-actual-end').value = rec.ActualEnd||'21:00';
  //  tr.querySelector('.cell-sales').value = Number(rec.SalesAmount||0);
    tr.querySelector('.cell-note').value = rec.Note||'';

    tr.querySelector('.cell-Id').value = rec.Id||'';

    tr.querySelector('.row-del').addEventListener('click', ()=> { tr.style.display="none"; tr.setAttribute("action",1)});
    $('#day_rows').appendChild(tr);
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

  // ---- Boot ----
  (async function init(){
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
      const res = await getDataFromN8n('schedule', { data: { query } }) || [];
      const total = (Array.isArray(res)?res:[]).reduce((a,r)=>a+(Number(r.PayTotal)||0),0);
      alert('Расчёт выполнен. Сотрудников: '+ (res.length||0) + '\nИтого к выплате: ' + (total||0).toLocaleString());
    });
   */


    // modal controls
    $('#modal_save').addEventListener('click', modalSave);
    $('#modal_cancel').addEventListener('click', closeDayModal);
    $('#modal_close').addEventListener('click', closeDayModal);
    $('#add-article-btn').addEventListener('click', ()=> appendDayRow({ DateISO: MODAL_DATE_ISO, Store: CURRENT_STORE }));

    // load meta and month
    await loadMeta(); populateStoreSelect(); await reloadAll();
  })();

  /* ==== N8N CONTRACT EXAMPLES ====
     (unchanged; see previous version)
  */
})();

