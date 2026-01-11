

<script>

const OPERATION_TYPE_FIELD_ID="OperationType"
const OPERATION_VID_FIELD_ID="Vid_Prognoz-Fact"
const ACTIVITY_FIELD_ID="activity"
const SUMM_FIELD_ID="CashSum"
const COMMENT_FIELD_ID="Comment"
  const BUDGET_NAME="BUTTON ROUGE"
    var BUDGET_TYPE
  var ID_COLUMN_INDEX
var VID_COLUMN_INDEX 
var DATE_COLUMN_INDEX
var TIP_COLUMN_INDEX

var VOCABULARY
    const fmt = (n, c) => new Intl.NumberFormat('ru-RU', { style:'currency', currency:c }).format(n ?? 0);
    const ymKey = s => s?.slice(0,7);
    const groupBy = (arr, keyFn) => arr.reduce((a,x)=>{(a[keyFn(x)] ||= []).push(x);return a;},{});

    // ---------- Stub data (no server yet) ----------
    const demo = {
      currency:'VND',
      items:[
        { id:'i0501', date:'2025-05-05', kind:'income',  category:'Продажи',   title:'Розница', amount:157000000, editable:true },
        { id:'e0502', date:'2025-05-03', kind:'expense', category:'ФОТ',       title:'Оклады',  amount:32000000,  editable:true },
        { id:'i0601', date:'2025-06-04', kind:'income',  category:'Продажи',   title:'Розница', amount:141960990, editable:true },
        { id:'e0602', date:'2025-06-03', kind:'expense', category:'ФОТ',       title:'Оклады',  amount:31000000,  editable:true },
        { id:'i0701', date:'2025-07-05', kind:'income',  category:'Продажи',   title:'Розница', amount:187943000, editable:true },
        { id:'e0702', date:'2025-07-04', kind:'expense', category:'ФОТ',       title:'Оклады',  amount:33500000,  editable:true },
        { id:'e0703', date:'2025-07-07', kind:'expense', category:'Коммунальные', title:'Электроэнергия', amount:3400000, editable:true },
        { id:'e0704', date:'2025-07-10', kind:'expense', category:'Аренда',    title:'ТЦ Новый', amount:45000000, editable:false }
      ]
    };

    // ---------- State ----------
    let currency = demo.currency;
    let items = demo.items;
    let drafts = {}; // {id: newAmount}
    let selectedYM = null;

    const effectiveItems = () => items.map(it => it.id in drafts ? { ...it, amount: drafts[it.id] } : it);
    const computeMonths = () => {
      const groups = groupBy(effectiveItems(), x=>ymKey(x.date));
      return Object.keys(groups).sort().map(ym=>{
        const arr = groups[ym];
        const income = arr.filter(x=>x.kind==='income').reduce((s,x)=>s+x.amount,0);
        const expense= arr.filter(x=>x.kind==='expense').reduce((s,x)=>s+x.amount,0);
        return { ym, items:arr, income, expense, profit:income-expense };
      });
    };

    // ---------- Render ----------
    function render(){
      const months = computeMonths();
      if(!selectedYM && months.length) selectedYM = months[months.length-1].ym;
      const cur = months.find(m=>m.ym===selectedYM) || months.at(-1);
      renderMonthsList(months);
      renderStrip(months);
      renderSummary(cur);
      renderPanels(cur);
      updateSaveBtn();
    }

    function ymLabel(ym){
      const [y,m]=ym.split('-');
      const dt=new Date(+y,+m-1,1);
      return dt.toLocaleDateString('ru-RU',{month:'long',year:'numeric'}).replace(' г.','');
    }

    function renderMonthsList(months){
      const box=document.getElementById('monthsList');
      box.innerHTML='';
      months.forEach(m=>{
        const el=document.createElement('button');
        el.className='monthBtn'+(m.ym===selectedYM?' active':'');
        el.innerHTML=`
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="font-weight:600">${ymLabel(m.ym)}</div>
            <div style="font-weight:700; ${m.profit>=0?'color:var(--ok)':'color:var(--bad)'}">${fmt(m.profit,currency)}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
            <div>Доходы<div style="font-weight:600">${fmt(m.income,currency)}</div></div>
            <div>Расходы<div style="font-weight:600">${fmt(m.expense,currency)}</div></div>
          </div>`;
        el.onclick=()=>{selectedYM=m.ym;render()};
        box.appendChild(el);
      });
    }

    function renderStrip(months){
      const strip=document.getElementById('monthsStrip');
      strip.innerHTML='';
      months.forEach(m=>{
        const b=document.createElement('button');
        b.className='pill'+(m.ym===selectedYM?' active':'');
        b.innerHTML=`<span class="muted" style="font-size:12px">${ymLabel(m.ym)}</span><span style="font-weight:700">${fmt(m.profit,currency)}</span>`;
        b.onclick=()=>{selectedYM=m.ym;render()};
        strip.appendChild(b);
      });
    }

    function renderSummary(cur){
      const box=document.getElementById('monthSummary');
      if(!cur){box.style.display='none';return}
      box.style.display='flex';
      const badge = cur.profit>=0? '<span class="chip ok">Плюс</span>' : '<span class="chip warn">Минус</span>';
      box.innerHTML=`
        <div style="font-size:18px;font-weight:700;display:flex;align-items:center;gap:10px">${ymLabel(cur.ym)} ${badge}</div>
        <div class="stats">
          <div class="stat"><div class="label">Доходы</div><div class="value ok">${fmt(cur.income,currency)}</div></div>
          <div class="stat"><div class="label">Расходы</div><div class="value bad">${fmt(cur.expense,currency)}</div></div>
          <div class="stat"><div class="label">Выручка</div><div class="value ${cur.profit>=0?'ok':'bad'}">${fmt(cur.profit,currency)}</div></div>
        </div>`;
    }

    function renderPanels(cur){
      const root=document.getElementById('panels');
      root.innerHTML='';
      if(!cur) return;
      const cats = monthCats(cur);
      root.appendChild(categoryPanel('Доходы','income',cats.income));
      root.appendChild(categoryPanel('Расходы','expense',cats.expense));
    }

    function monthCats(month){
      const gi=groupBy(month.items.filter(x=>x.kind==='income'), x=>x.category);
      const ge=groupBy(month.items.filter(x=>x.kind==='expense'),x=>x.category);
      const sum=arr=>arr.reduce((s,x)=>s+x.amount,0);
      return {
        income:Object.fromEntries(Object.entries(gi).map(([k,a])=>[k,{total:sum(a),rows:a}])),
        expense:Object.fromEntries(Object.entries(ge).map(([k,a])=>[k,{total:sum(a),rows:a}]))
      };
    }

    function categoryPanel(title,kind,data){
      const card=document.createElement('div');
      card.className='card card-pad';
      const entries=Object.entries(data).sort((a,b)=>b[1].total-a[1].total);
      card.innerHTML=`<div class="panel-title">${title}</div>`;
      entries.forEach(([cat,{total,rows}],i)=>{
        const sec=document.createElement('div');
        sec.className='section';
        const head=document.createElement('div');
        head.className='section-head';
        head.innerHTML=`${chev()}<div style="font-weight:600">${cat}</div><div class="section-total ${kind==='income'?'income':'expense'}">${fmt(total,currency)}</div>`;
        const tableWrap=document.createElement('div');
        tableWrap.style.display='none';
        tableWrap.innerHTML=tableHTML(rows);
        head.onclick=()=>{
          const open = tableWrap.style.display==='none';
          tableWrap.style.display = open?'block':'none';
          head.querySelector('.chev').classList.toggle('rotate90', open);
        };
        sec.appendChild(head); sec.appendChild(tableWrap); card.appendChild(sec);
      });
      return card;
    }

    function chev(){
      return `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`
    }

    function lockIcon(){
      return `<svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
    }

    function resetIcon(){
      return `<svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>`
    }

    function tableHTML(rows){
      return `<table><thead><tr><th>Статья</th><th>Сумма</th><th style="width:120px">Статус</th></tr></thead><tbody>${rows.map(r=>rowHTML(r)).join('')}</tbody></table>`;
    }

    function rowHTML(row){
      const isDirty = row.id in drafts;
      if(row.editable){
        return `<tr data-id="${row.id}"><td><div style="font-weight:600">${row.title}</div></td><td>
          <div style="display:flex;align-items:center;gap:8px">
            <input class="input ${isDirty?'dirty':''}" value="${row.amount}" inputmode="numeric" />
            ${isDirty?`<button class="btn btn-ghost" data-reset="1" title="Сбросить">${resetIcon()}</button>`:''}
            <span class="muted">${fmt(Number(row.amount)||0,currency)}</span>
          </div>
        </td><td>${isDirty?'<span class="chip warn">Изменено</span>':'<span class="chip ok">Можно ред.</span>'}</td></tr>`
      } else {
        return `<tr><td><div style="font-weight:600">${row.title}</div></td><td><div style="display:flex;align-items:center;gap:8px" class="muted">${lockIcon()} ${fmt(row.amount,currency)}</div></td><td><span class="chip lock">Закрыто</span></td></tr>`
      }
    }

    // ---------- Events ----------
    document.getElementById('panels').addEventListener('input', (e)=>{
      const inp = e.target.closest('input');
      if(!inp) return;
      const tr = inp.closest('tr[data-id]');
      if(!tr) return;
      const id = tr.getAttribute('data-id');
      const n = Number(String(inp.value).replace(/\s+/g,'').replace(',','.'));
      if(!Number.isFinite(n)) return;
      drafts[id]=n;
      const preview = tr.querySelector('span.muted');
      if(preview) preview.textContent = fmt(n, currency);
      inp.classList.add('dirty');
      const status = tr.querySelector('td:last-child');
      status.innerHTML = '<span class="chip warn">Изменено</span>';
      if(!tr.querySelector('[data-reset]')){
        const btn=document.createElement('button');
        btn.className='btn btn-ghost'; btn.setAttribute('data-reset','1'); btn.innerHTML=resetIcon(); btn.title='Сбросить';
        btn.onclick=()=>{ delete drafts[id]; render(); };
        inp.parentElement.insertBefore(btn, inp.nextSibling);
      }
      render();
    });

    document.getElementById('saveBtn').addEventListener('click', ()=>{
      // Stub save – just flush drafts into base
      items = items.map(it=> it.id in drafts ? { ...it, amount: drafts[it.id] } : it);
      drafts = {};
      document.getElementById('header-note').textContent = 'Изменения сохранены (заглушка)';
      render();
    });

    function updateSaveBtn(){
      const btn=document.getElementById('saveBtn');
      const dirty=Object.keys(drafts).length;
      btn.disabled = !dirty;
      btn.textContent = dirty?`Сохранить (${dirty})`:'Сохранить';
    }

    // Boot
    render();

</script>