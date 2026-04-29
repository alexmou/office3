



//var productTable 

registerPageInit("sales", initSalesPage);

async function initSalesPage() {

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function parseNumberMaybe(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;

    let normalized = String(value).trim().replace(/\s+/g, "");
    if (!normalized) return null;

    if (normalized.includes(",") && normalized.includes(".")) {
      const lastComma = normalized.lastIndexOf(",");
      const lastDot = normalized.lastIndexOf(".");
      const decimalPos = Math.max(lastComma, lastDot);
      const integerPart = normalized.slice(0, decimalPos).replace(/[.,]/g, "");
      const fractionalPart = normalized.slice(decimalPos + 1).replace(/[.,]/g, "");
      normalized = `${integerPart}.${fractionalPart}`;
    } else {
      normalized = normalized.replace(",", ".");
    }

    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }

  function formatPriceValueRu(value) {
    const n = parseNumberMaybe(value);
    if (n === null) return value;
    return n.toLocaleString("ru-RU");
  }

  function formatSalesPriceColumn(values, header) {
    const rows = Array.isArray(values) ? values : [];
    const headers = Array.isArray(header) ? header : [];
    const priceIndex = headers.findIndex((h) => String(h || "").trim().toLowerCase() === "price");
    if (priceIndex === -1) return rows;

    return rows.map((row) => {
      if (!Array.isArray(row)) return row;
      const next = row.slice();
      next[priceIndex] = formatPriceValueRu(next[priceIndex]);
      return next;
    });
  }

	var inputName = "articleName";
	var caption_h1 = "";
	var initValue = "BUTTON ROUGE" //07-010101-030904-0202;
	var action = "process_button";

//var keyEl=createNewChoice(keyList, "keyChoice", "Key", action, parentID)



        const INITIAL_QUERY = "All"; //{type:"someFilter"}
        const DATA_FUNCTION_NAME="getAllItemsFromSalesByQuery"
        const FILTER_FUNCTION_NAME="getSalesFilterOptions"
        const TABLEID="product-list"
    



        const catalogData = new TableData();
      // await catalogData.initWithServerQuery(INITIAL_QUERY, DATA_FUNCTION_NAME, FILTER_FUNCTION_NAME);
 //console.log(catalogData)

        const data = await window.API.getSalesData({ visible: true }, { overlayId: "sales" });
        const payload = Array.isArray(data) ? data[0] : data;
        const header = Array.isArray(payload?.header) ? payload.header : [];
        const values = formatSalesPriceColumn(payload?.values, header);
        const filterOptions = Array.isArray(payload?.filterOptions) ? payload.filterOptions : [];
    //   console.log('Ответ GET:', data[0]);

  //  catalogData.values =  data[0].values
   //     catalogData.header =  data[0].header

   catalogData.initWithPreloadedData(values, header, filterOptions) 
 

     /*
        catalogData.values =  data[0].values
        catalogData.header =  data[0].header
        catalogData.filterOptions = data[0].filterOptions
        catalogData.currentQuery = data[0].currentQuery
        catalogData.query = null;
        catalogData.dataFunctionName = null;
        catalogData.filterFunctionName = null;

    const colorizeRowsOptions={
            columnName: "Brand",  // Название столбца
            value: "BUTTON ROUGE", // Значение для фильтрации
            style: "background-color: #97888c66;"   // Цвет фона строки
    }
     */        



	        const catalogUI = new TableUI(TABLEID, catalogData, {
	          virtualize: true,
	          chunkSize: 200,
	          thresholdPx: 320,
	        });

	        // Полнотекстовый поиск по таблице продаж (как в Catalog)
	        const contentEl = document.getElementById("content");
	        const listEl = document.getElementById(TABLEID);
		        if (contentEl && listEl && !document.getElementById("salesFullTextSearch")) {
		          const salesSearchPlaceholder =
                    typeof window.localizeUiText === "function"
                      ? window.localizeUiText("Поиск по продажам...", "Поиск по продажам...")
                      : "Поиск по продажам...";
		          const wrap = document.createElement("div");
		          wrap.className = "table-toolbar";
		          wrap.innerHTML = `
		            <input
		              id="salesFullTextSearch"
		              type="text"
		              placeholder="${salesSearchPlaceholder}"
		            />
		          `;
	          contentEl.insertBefore(wrap, listEl);

	          const input = document.getElementById("salesFullTextSearch");
	          const deb = debounce((val) => {
	            catalogData.fullTextQuery = val;
	            catalogUI.updateTable();
	          }, 200);
	          input.addEventListener("input", (e) => deb(e.target.value));
	        }

	        catalogUI.drawAll();

        // ── Return feature ─────────────────────────────────────────────────

        function getColIdx(hdr, name) {
          return hdr.findIndex(h => String(h || '').toLowerCase() === name.toLowerCase());
        }

        const returnStyle = document.createElement('style');
        returnStyle.textContent = `
          .return-toolbar{margin:8px 0;}
          .btn-return-open{background:#8b5e83;color:#fff;border:none;padding:7px 16px;border-radius:4px;cursor:pointer;font-size:14px;}
          .btn-return-open:hover{background:#7a4f72;}
          #return-modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;overflow-y:auto;}
          #return-modal-overlay.active{display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;}
          #return-modal{background:#fff;border-radius:8px;max-width:700px;width:100%;padding:24px;}
          #return-modal h2{margin:0 0 16px;font-size:18px;}
          .return-basket-select select{width:100%;padding:7px;border:1px solid #ccc;border-radius:4px;font-size:14px;margin-top:4px;}
          .return-items{margin:12px 0;}
          .return-item-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #eee;font-size:14px;}
          .return-item-row label{flex:1;cursor:pointer;}
          .return-item-row.is-returned{opacity:.5;}
          .return-item-row.is-pending{background:#fffde7;}
          .return-badge{font-size:11px;padding:2px 7px;border-radius:10px;white-space:nowrap;}
          .badge-pending{background:#fff3cd;color:#856404;}
          .badge-approved{background:#d4edda;color:#155724;}
          .badge-rejected{background:#f8d7da;color:#721c24;}
          .return-reason-txt{width:100%;margin-top:10px;padding:7px;border:1px solid #ccc;border-radius:4px;font-size:14px;min-height:56px;resize:vertical;box-sizing:border-box;}
          .return-actions{display:flex;gap:8px;margin-top:16px;justify-content:flex-end;}
          .btn-cancel-return{background:#eee;border:none;padding:7px 14px;border-radius:4px;cursor:pointer;}
          .btn-submit-return{background:#8b5e83;color:#fff;border:none;padding:7px 16px;border-radius:4px;cursor:pointer;}
          .btn-submit-return:disabled{opacity:.5;cursor:not-allowed;}
          .return-approve-section{margin-top:14px;padding:12px;background:#fffde7;border:1px solid #ffe08a;border-radius:6px;}
          .return-approve-section h4{margin:0 0 8px;font-size:14px;}
          .approve-actions{display:flex;gap:8px;margin-top:10px;}
          .btn-approve{background:#28a745;color:#fff;border:none;padding:7px 16px;border-radius:4px;cursor:pointer;}
          .btn-reject{background:#dc3545;color:#fff;border:none;padding:7px 16px;border-radius:4px;cursor:pointer;}
        `;
        document.head.appendChild(returnStyle);

        const idxBasketid   = getColIdx(header, 'basketid');
        const idxRowNumber  = getColIdx(header, 'row_number');
        const idxIsReturn   = getColIdx(header, 'is_return');
        const idxRetStatus  = getColIdx(header, 'return_status');
        const idxRetReason  = getColIdx(header, 'return_reason');
        const idxDate       = getColIdx(header, 'date');
        const idxName       = getColIdx(header, 'name') !== -1 ? getColIdx(header, 'name') : getColIdx(header, 'Name');
        const idxArticle    = getColIdx(header, 'article');
        const idxFinalPrice = getColIdx(header, 'finalpricevnd') !== -1 ? getColIdx(header, 'finalpricevnd') : getColIdx(header, 'finalPriceVND');
        const idxUsername   = getColIdx(header, 'username');

        // "Возврат" toolbar button
        const returnToolbar = document.createElement('div');
        returnToolbar.className = 'return-toolbar';
        returnToolbar.innerHTML = `<button class="btn-return-open">↩ Оформить возврат</button>`;
        const tableEl = document.getElementById(TABLEID);
        tableEl && tableEl.parentNode && tableEl.parentNode.insertBefore(returnToolbar, tableEl);

        // Modal markup
        const returnOverlay = document.createElement('div');
        returnOverlay.id = 'return-modal-overlay';
        returnOverlay.innerHTML = `
          <div id="return-modal">
            <h2>↩ Возврат товара</h2>
            <div class="return-basket-select">
              <label style="font-size:13px;color:#666;">Корзина (дата · продавец · кол-во):</label>
              <select id="return-basket-sel"></select>
            </div>
            <div id="return-items-list" class="return-items"></div>
            <div id="return-reason-wrap" style="display:none">
              <textarea class="return-reason-txt" id="return-reason-txt" placeholder="Причина возврата..."></textarea>
            </div>
            <div id="return-approve-wrap" class="return-approve-section" style="display:none">
              <h4>⚠ Запрос на возврат ожидает апрува</h4>
              <div id="return-approve-reason" style="font-size:13px;color:#555;margin-bottom:8px;"></div>
              <textarea class="return-reason-txt" id="approve-comment-txt" placeholder="Комментарий (необязательно)..."></textarea>
              <div class="approve-actions">
                <button class="btn-reject" id="btn-do-reject">Отклонить</button>
                <button class="btn-approve" id="btn-do-approve">Апрувить</button>
              </div>
            </div>
            <div class="return-actions">
              <button class="btn-cancel-return" id="btn-cancel-return">Отмена</button>
              <button class="btn-submit-return" id="btn-submit-return" disabled>Запросить возврат</button>
            </div>
          </div>`;
        document.body.appendChild(returnOverlay);

        let currentBasketMap = {};
        let currentBasketId = '';

        function buildBasketMap(vals) {
          const map = {};
          for (const row of (vals || [])) {
            const bid = idxBasketid >= 0 ? String(row[idxBasketid] || '') : '';
            if (!bid) continue;
            (map[bid] = map[bid] || []).push(row);
          }
          return map;
        }

        function updateSubmitBtn() {
          const checked = document.querySelectorAll('#return-items-list input[type=checkbox]:checked');
          const btn = document.getElementById('btn-submit-return');
          if (btn) btn.disabled = checked.length === 0;
        }

        function renderBasketItems(basketid) {
          currentBasketId = basketid;
          const rows = currentBasketMap[basketid] || [];
          const itemsList = document.getElementById('return-items-list');
          const reasonWrap = document.getElementById('return-reason-wrap');
          const approveWrap = document.getElementById('return-approve-wrap');
          const submitBtn = document.getElementById('btn-submit-return');

          const hasPending = rows.some(r => String(r[idxRetStatus] || '') === 'pending');
          const allReturned = rows.every(r => String(r[idxIsReturn] || '') === 'TRUE');

          itemsList.innerHTML = '';
          rows.forEach((row, i) => {
            const isReturn = String(row[idxIsReturn] || '') === 'TRUE';
            const status = String(row[idxRetStatus] || '');
            const name = idxName >= 0 ? row[idxName] : '';
            const article = idxArticle >= 0 ? row[idxArticle] : '';
            const price = idxFinalPrice >= 0 ? row[idxFinalPrice] : '';
            const rowNum = idxRowNumber >= 0 ? row[idxRowNumber] : '';

            let badge = '';
            if (isReturn) badge = `<span class="return-badge badge-approved">Возвращён</span>`;
            else if (status === 'pending') badge = `<span class="return-badge badge-pending">Ожидает апрува</span>`;
            else if (status === 'rejected') badge = `<span class="return-badge badge-rejected">Отклонён</span>`;

            const canReturn = !isReturn && status !== 'pending';
            const priceStr = price ? Number(price).toLocaleString('ru-RU') + ' ₫' : '';
            const rowClass = isReturn ? 'is-returned' : status === 'pending' ? 'is-pending' : '';

            itemsList.innerHTML += `
              <div class="return-item-row ${rowClass}">
                <input type="checkbox" id="retitem-${i}" data-rownum="${rowNum}" ${canReturn ? '' : 'disabled'} />
                <label for="retitem-${i}">${article} — ${name} ${priceStr}</label>
                ${badge}
              </div>`;
          });

          itemsList.querySelectorAll('input[type=checkbox]').forEach(cb =>
            cb.addEventListener('change', updateSubmitBtn)
          );

          if (hasPending) {
            const pr = rows.find(r => String(r[idxRetStatus] || '') === 'pending');
            document.getElementById('return-approve-reason').textContent =
              'Причина: ' + (pr && idxRetReason >= 0 ? pr[idxRetReason] : '—');
            approveWrap.style.display = 'block';
            reasonWrap.style.display = 'none';
            submitBtn.style.display = 'none';
          } else {
            approveWrap.style.display = 'none';
            reasonWrap.style.display = allReturned ? 'none' : 'block';
            submitBtn.style.display = allReturned ? 'none' : '';
            updateSubmitBtn();
          }
        }

        function openReturnModal() {
          currentBasketMap = buildBasketMap(catalogData.values);
          const sel = document.getElementById('return-basket-sel');
          sel.innerHTML = '';
          const baskets = Object.keys(currentBasketMap);
          if (!baskets.length) {
            sel.innerHTML = '<option>Нет данных</option>';
          } else {
            baskets.forEach(bid => {
              const rows = currentBasketMap[bid];
              const date = idxDate >= 0 ? rows[0][idxDate] : '';
              const user = idxUsername >= 0 ? rows[0][idxUsername] : '';
              const cnt = rows.length;
              const hasPending = rows.some(r => String(r[idxRetStatus] || '') === 'pending');
              const hasReturn = rows.some(r => String(r[idxIsReturn] || '') === 'TRUE');
              let label = `${date} · ${user} · ${cnt} шт.`;
              if (hasPending) label += ' ⏳';
              else if (hasReturn) label += ' ↩';
              const opt = document.createElement('option');
              opt.value = bid;
              opt.textContent = label;
              sel.appendChild(opt);
            });
            renderBasketItems(baskets[0]);
          }
          returnOverlay.classList.add('active');
        }

        returnToolbar.querySelector('.btn-return-open').addEventListener('click', openReturnModal);
        document.getElementById('btn-cancel-return').addEventListener('click', () => returnOverlay.classList.remove('active'));
        returnOverlay.addEventListener('click', e => { if (e.target === returnOverlay) returnOverlay.classList.remove('active'); });
        document.getElementById('return-basket-sel').addEventListener('change', e => renderBasketItems(e.target.value));

        document.getElementById('btn-submit-return').addEventListener('click', async () => {
          const checked = [...document.querySelectorAll('#return-items-list input[type=checkbox]:checked')];
          const rowNums = checked.map(cb => Number(cb.dataset.rownum)).filter(Boolean);
          const reason = document.getElementById('return-reason-txt').value.trim();
          if (!rowNums.length) return;
          const btn = document.getElementById('btn-submit-return');
          btn.disabled = true; btn.textContent = 'Отправка...';
          try {
            const result = await window.API.requestReturn({
              action: 'requestReturn',
              basketid: currentBasketId,
              row_numbers: rowNums,
              reason,
              token: window.token,
            });
            if (result?.success) {
              returnOverlay.classList.remove('active');
              alert('Запрос на возврат отправлен.');
            } else {
              alert('Ошибка: ' + JSON.stringify(result));
            }
          } catch(e) { alert('Ошибка: ' + e.message); }
          finally { btn.disabled = false; btn.textContent = 'Запросить возврат'; }
        });

        async function doDecision(decision) {
          const rows = currentBasketMap[currentBasketId] || [];
          const rowNums = rows
            .filter(r => String(r[idxRetStatus] || '') === 'pending')
            .map(r => idxRowNumber >= 0 ? Number(r[idxRowNumber]) : null)
            .filter(Boolean);
          const comment = document.getElementById('approve-comment-txt').value.trim();
          const username = window.currentLoginName || window.username || '';
          const ab = document.getElementById('btn-do-approve');
          const rb = document.getElementById('btn-do-reject');
          ab.disabled = rb.disabled = true;
          try {
            const result = await window.API.approveReturn({
              action: 'approveReturn',
              basketid: currentBasketId,
              row_numbers: rowNums,
              decision,
              comment,
              username,
              token: window.token,
            });
            if (result?.success) {
              returnOverlay.classList.remove('active');
              alert(decision === 'approved' ? 'Возврат выполнен.' : 'Возврат отклонён.');
            } else {
              alert('Ошибка: ' + JSON.stringify(result));
            }
          } catch(e) { alert('Ошибка: ' + e.message); }
          finally { ab.disabled = rb.disabled = false; }
        }

        document.getElementById('btn-do-approve').addEventListener('click', () => doDecision('approved'));
        document.getElementById('btn-do-reject').addEventListener('click', () => doDecision('rejected'));

}



