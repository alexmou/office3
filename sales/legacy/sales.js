



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
        const hasServerFilterOptions = Array.isArray(payload?.filterOptions) && payload.filterOptions.length > 0;
        const filterOptions = hasServerFilterOptions ? payload.filterOptions : null;
    //   console.log('Ответ GET:', data[0]);

  //  catalogData.values =  data[0].values
   //     catalogData.header =  data[0].header

   catalogData.initWithPreloadedData(values, header, filterOptions);

   // row_number sits at values[i][0] but filterOptions indices start from 0 for the next column.
   // Shift every filterOptions index by the number of leading hidden columns.
    if (hasServerFilterOptions && header[0] && String(header[0]).toLowerCase() === 'row_number') {
     catalogData.filterOptions = catalogData.filterOptions.map(opt => ({ ...opt, index: opt.index + 1 }));
   }
 

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

        const idxRowNumber  = getColIdx(header, 'row_number');
        const idxIsReturn   = getColIdx(header, 'is_return');
        const idxRetStatus  = getColIdx(header, 'return_status');
        const idxRetReason  = getColIdx(header, 'return_reason');
        const idxRetDate    = getColIdx(header, 'return_date');
        const idxRetTime    = getColIdx(header, 'return_time');
        const idxRetComment = getColIdx(header, 'return_comment');
        const idxRetApprBy  = getColIdx(header, 'return_approved_by');
        const idxDate       = getColIdx(header, 'date');
        const idxName       = getColIdx(header, 'name') !== -1 ? getColIdx(header, 'name') : getColIdx(header, 'Name');
        const idxArticle    = getColIdx(header, 'article');
        const idxFinalPrice = getColIdx(header, 'finalpricevnd') !== -1 ? getColIdx(header, 'finalpricevnd') : getColIdx(header, 'finalPriceVND');
        const idxBasketid   = getColIdx(header, 'basketid');

        // Hide all technical/return-detail columns — shown only via the ℹ tooltip
        {
          const hiddenNames = ['row_number', 'is_return', 'return_status', 'return_date',
            'return_time', 'return_reason', 'return_comment', 'return_approved_by', 'basketid'];
          const nth = hiddenNames.map(n => getColIdx(header, n)).filter(i => i >= 0).map(i => i + 1);
          if (nth.length) {
            const sel = nth.flatMap(n => [`#flowTable th:nth-child(${n})`, `#flowTable td:nth-child(${n})`]).join(',');
            const hideStyle = document.createElement('style');
            hideStyle.textContent = sel + '{display:none;}';
            document.head.appendChild(hideStyle);
          }
        }

        const returnStyle = document.createElement('style');
        returnStyle.textContent = `
          .btn-row-select{border:1.5px solid #8b5e83;color:#8b5e83;background:transparent;cursor:pointer;font-size:11px;border-radius:4px;padding:2px 6px;line-height:1.4;transition:background .15s,color .15s;}
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

        // ── Row selection state ────────────────────────────────────────
        const selectedRowNums = new Set();

        function updateReturnBtn() {
          const btn = document.querySelector('.btn-return-open');
          const cnt = document.querySelector('.return-sel-count');
          if (btn) btn.disabled = selectedRowNums.size === 0;
          if (cnt) cnt.textContent = selectedRowNums.size > 0 ? `Выбрано: ${selectedRowNums.size}` : '';
        }

        // ── Return details tooltip ─────────────────────────────────────
        function showReturnDetails(row, triggerEl) {
          const existing = document.getElementById('return-detail-tooltip');
          if (existing) {
            const isSame = existing.dataset.rownum === String(row[idxRowNumber] || '');
            existing.remove();
            if (isSame) return;
          }
          const statusLabel = { pending: '⏳ Ожидает апрува', approved: '✅ Возвращён', rejected: '❌ Отклонён' };
          const isRet = idxIsReturn >= 0 && String(row[idxIsReturn] || '').toUpperCase() === 'TRUE';
          const retSt = idxRetStatus >= 0 ? String(row[idxRetStatus] || '') : '';
          const dateStr = [idxRetDate >= 0 ? row[idxRetDate] : '', idxRetTime >= 0 ? row[idxRetTime] : ''].filter(Boolean).join(' ');
          const fields = [
            ['Статус',       isRet ? statusLabel.approved : (statusLabel[retSt] || retSt)],
            ['Дата',         dateStr],
            ['Причина',      idxRetReason >= 0 ? String(row[idxRetReason] || '') : ''],
            ['Комментарий',  idxRetComment >= 0 ? String(row[idxRetComment] || '') : ''],
            ['Апрувил',      idxRetApprBy >= 0 ? String(row[idxRetApprBy] || '') : ''],
          ].filter(([, v]) => v);
          if (!fields.length) return;

          const tip = document.createElement('div');
          tip.id = 'return-detail-tooltip';
          tip.dataset.rownum = String(row[idxRowNumber] || '');
          tip.innerHTML = fields.map(([l, v]) =>
            `<div class="rdt-row"><span class="rdt-label">${l}:</span><span class="rdt-val">${v}</span></div>`
          ).join('');
          document.body.appendChild(tip);

          const rect = triggerEl.getBoundingClientRect();
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          tip.style.top = (rect.bottom + scrollY + 4) + 'px';
          tip.style.left = Math.max(8, rect.right - tip.offsetWidth - 8) + 'px';

          setTimeout(() => {
            const close = (e) => {
              if (!tip.contains(e.target) && e.target !== triggerEl) {
                tip.remove();
                document.removeEventListener('click', close, true);
              }
            };
            document.addEventListener('click', close, true);
          }, 0);
        }

        // ── Monkey-patch buildRow to append action column ──────────────
        const origBuildRow = catalogUI.buildRow.bind(catalogUI);
        catalogUI.buildRow = function(row) {
          const tr = origBuildRow(row);
          const td = document.createElement('td');
          td.style.cssText = 'text-align:center;width:44px;padding:4px;white-space:nowrap;';

          const isReturn = idxIsReturn >= 0 && String(row[idxIsReturn] || '').toUpperCase() === 'TRUE';
          const retStatus = idxRetStatus >= 0 ? String(row[idxRetStatus] || '') : '';
          const rowNum = idxRowNumber >= 0 ? String(row[idxRowNumber] || '') : '';
          const hasReturnData = isReturn || !!retStatus;

          if (isReturn) tr.classList.add('row-is-returned');
          else if (retStatus === 'pending') tr.classList.add('row-return-pending');

          if (hasReturnData) {
            const infoBtn = document.createElement('button');
            infoBtn.className = 'btn-return-info';
            infoBtn.textContent = 'ℹ';
            infoBtn.title = 'Детали возврата';
            infoBtn.addEventListener('click', (e) => { e.stopPropagation(); showReturnDetails(row, infoBtn); });
            td.appendChild(infoBtn);
          }

          if (!isReturn && rowNum) {
            const isPending = retStatus === 'pending';
            const btn = document.createElement('button');
            btn.className = 'btn-row-select' + (isPending ? ' is-pending' : '');
            btn.dataset.rownum = rowNum;
            btn.title = isPending ? 'Ожидает апрува — выбрать для апрува' : 'Выбрать для возврата';
            const isSelected = selectedRowNums.has(rowNum);
            btn.textContent = isSelected ? '✓' : 'Return';
            if (isSelected) btn.classList.add('selected');
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              if (selectedRowNums.has(rowNum)) {
                selectedRowNums.delete(rowNum);
              } else {
                selectedRowNums.add(rowNum);
              }
              const nowSelected = selectedRowNums.has(rowNum);
              btn.classList.toggle('selected', nowSelected);
              btn.textContent = nowSelected ? '✓' : '○';
              updateReturnBtn();
            });
            td.appendChild(btn);
          }

          tr.appendChild(td);
          return tr;
        };

        // Add extra <th> to header row (filter row already has actionTh from drawFilters)
        function addReturnHeaderTh() {
          const headerRow = document.querySelector('tr.table-header-row');
          if (headerRow && !headerRow.querySelector('.return-header-th')) {
            const th = document.createElement('th');
            th.className = 'return-header-th';
            th.scope = 'col';
            headerRow.appendChild(th);
          }
        }

        // Columns that must not generate heavy filter selects (row_number = 1 option per row)
        const FILTER_SKIP = new Set([
          'row_number','is_return','return_status','return_date',
          'return_time','return_reason','return_comment','return_approved_by','basketid',
        ]);

        function maskHiddenCols(headers, data) {
          const hiddenIdx = new Set(
            headers.map((h, i) => FILTER_SKIP.has(h) ? i : -1).filter(i => i >= 0)
          );
          if (!hiddenIdx.size) return data;
          return data.map(row => row.map((v, i) => hiddenIdx.has(i) ? '' : v));
        }

        const origDrawFilters = catalogUI.drawFilters.bind(catalogUI);
        catalogUI.drawFilters = function(headers, data) {
          origDrawFilters(headers, maskHiddenCols(headers, data));
        };

        const origUpdateFilterOpts = catalogUI.updateFilterOptions.bind(catalogUI);
        catalogUI.updateFilterOptions = function(filteredData) {
          origUpdateFilterOpts(maskHiddenCols(this.catalogData.header, filteredData));
        };

        const origUpdateTable = catalogUI.updateTable.bind(catalogUI);
        catalogUI.updateTable = function() {
          origUpdateTable();
          addReturnHeaderTh();
        };

        // Re-render so the patched buildRow applies to rows already drawn by drawAll()
        catalogUI.updateTable();

        // ── Toolbar ────────────────────────────────────────────────────
        const returnToolbar = document.createElement('div');
        returnToolbar.className = 'return-toolbar';
        returnToolbar.innerHTML = `
          <button class="btn-return-open" disabled>Return</button>
          <span class="return-sel-count"></span>
        `;
        const tableEl = document.getElementById(TABLEID);
        tableEl && tableEl.parentNode && tableEl.parentNode.insertBefore(returnToolbar, tableEl);

        // ── Modal markup ───────────────────────────────────────────────
        const returnOverlay = document.createElement('div');
        returnOverlay.id = 'return-modal-overlay';
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

        // ── Open modal ─────────────────────────────────────────────────
        function openReturnModal() {
          if (selectedRowNums.size === 0) return;

          const selectedRows = (catalogData.values || []).filter(row => {
            const rn = idxRowNumber >= 0 ? String(row[idxRowNumber] || '') : '';
            return rn && selectedRowNums.has(rn);
          });

          const pendingRows = selectedRows.filter(r => String(r[idxRetStatus] || '') === 'pending');
          const requestRows = selectedRows.filter(r => String(r[idxRetStatus] || '') !== 'pending');
          const hasPending = pendingRows.length > 0;

          const itemsList = document.getElementById('return-items-list');
          itemsList.innerHTML = '';
          selectedRows.forEach(row => {
            const article = idxArticle >= 0 ? String(row[idxArticle] || '') : '';
            const name = idxName >= 0 ? String(row[idxName] || '') : '';
            const price = idxFinalPrice >= 0 ? row[idxFinalPrice] : '';
            const status = String(row[idxRetStatus] || '');
            const priceStr = price ? Number(price).toLocaleString('ru-RU') + ' ₫' : '';
            let badge = '';
            if (status === 'pending') badge = `<span class="return-badge badge-pending">Ожидает апрува</span>`;
            else if (status === 'rejected') badge = `<span class="return-badge badge-rejected">Отклонён</span>`;
            const div = document.createElement('div');
            div.className = 'return-item-row';
            div.innerHTML = `<span class="ri-name">${article}${name ? ' — ' + name : ''}${priceStr ? ' · ' + priceStr : ''}</span>${badge}`;
            itemsList.appendChild(div);
          });

          const reasonWrap = document.getElementById('return-reason-wrap');
          const approveWrap = document.getElementById('return-approve-wrap');
          const submitBtn = document.getElementById('btn-submit-return');
          const reasonTxt = document.getElementById('return-reason-txt');
          const commentTxt = document.getElementById('approve-comment-txt');
          if (reasonTxt) reasonTxt.value = '';
          if (commentTxt) commentTxt.value = '';

          if (hasPending) {
            const reasonsEl = document.getElementById('return-approve-reasons');
            reasonsEl.innerHTML = pendingRows
              .map(r => {
                const reason = idxRetReason >= 0 ? String(r[idxRetReason] || '') : '';
                const article = idxArticle >= 0 ? String(r[idxArticle] || '') : '';
                return `<div>${article}${reason ? ': ' + reason : ''}</div>`;
              })
              .join('');
            approveWrap.style.display = 'block';
          } else {
            approveWrap.style.display = 'none';
          }

          if (requestRows.length > 0) {
            reasonWrap.style.display = 'block';
            submitBtn.style.display = '';
          } else {
            reasonWrap.style.display = 'none';
            submitBtn.style.display = 'none';
          }

          returnOverlay.classList.add('active');
        }

        returnToolbar.querySelector('.btn-return-open').addEventListener('click', openReturnModal);
        document.getElementById('btn-cancel-return').addEventListener('click', () => returnOverlay.classList.remove('active'));
        returnOverlay.addEventListener('click', e => { if (e.target === returnOverlay) returnOverlay.classList.remove('active'); });

        // ── Submit requestReturn ───────────────────────────────────────
        document.getElementById('btn-submit-return').addEventListener('click', async () => {
          const requestRows = (catalogData.values || []).filter(row => {
            const rn = idxRowNumber >= 0 ? String(row[idxRowNumber] || '') : '';
            const status = String(row[idxRetStatus] || '');
            return rn && selectedRowNums.has(rn) && status !== 'pending';
          });
          const rowNums = requestRows.map(r => Number(r[idxRowNumber])).filter(Boolean);
          const basketid = requestRows.length > 0 && idxBasketid >= 0
            ? String(requestRows[0][idxBasketid] || '') : '';
          const reason = (document.getElementById('return-reason-txt')?.value || '').trim();
          if (!rowNums.length) return;
          const btn = document.getElementById('btn-submit-return');
          btn.disabled = true; btn.textContent = 'Отправка...';
          try {
            const result = await window.API.requestReturn({
              action: 'requestReturn',
              basketid,
              row_numbers: rowNums,
              reason,
              token: window.token,
            });
            if (result?.success) {
              returnOverlay.classList.remove('active');
              selectedRowNums.clear();
              updateReturnBtn();
              alert('Запрос на возврат отправлен.');
            } else {
              alert('Ошибка: ' + JSON.stringify(result));
            }
          } catch(e) { alert('Ошибка: ' + e.message); }
          finally { btn.disabled = false; btn.textContent = 'Запросить возврат'; }
        });

        // ── Approve / Reject ───────────────────────────────────────────
        async function doDecision(decision) {
          const pendingRows = (catalogData.values || []).filter(row => {
            const rn = idxRowNumber >= 0 ? String(row[idxRowNumber] || '') : '';
            return rn && selectedRowNums.has(rn) && String(row[idxRetStatus] || '') === 'pending';
          });
          const rowNums = pendingRows.map(r => Number(r[idxRowNumber])).filter(Boolean);
          const basketid = pendingRows.length > 0 && idxBasketid >= 0
            ? String(pendingRows[0][idxBasketid] || '') : '';
          const comment = (document.getElementById('approve-comment-txt')?.value || '').trim();
          const username = window.currentLoginName || window.username || '';
          const ab = document.getElementById('btn-do-approve');
          const rb = document.getElementById('btn-do-reject');
          ab.disabled = rb.disabled = true;
          try {
            const result = await window.API.approveReturn({
              action: 'approveReturn',
              basketid,
              row_numbers: rowNums,
              decision,
              comment,
              username,
              token: window.token,
            });
            if (result?.success) {
              returnOverlay.classList.remove('active');
              selectedRowNums.clear();
              updateReturnBtn();
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



