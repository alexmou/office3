const PAGE_ID = 'admin_sklad';
const MAIN_FIELDS   = ['article','Brand','Name','price'];
const EXTRA_FIELDS  = ['description','color','size'];
const HIDDEN_FIELDS = ['row_number']; 

let ALL_FIELDS = [];
let availableStores = [];
let selectedSourceStore = null;
let selectedTargetStore = null;
let pageListenersBound = false;

function parseMaybeJson(value) {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch (_) { return value; }
}

function unwrapArrayPayload(raw) {
  const parsed = parseMaybeJson(raw);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.data?.data)) return parsed.data.data;
  if (Array.isArray(parsed?.data)) return parsed.data;
  if (Array.isArray(parsed?.items)) return parsed.items;
  return [];
}

function toNumericId(value) {
  if (value === null || value === undefined || String(value).trim() === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
}

function normalizeStoreItem(store, index) {
  if (store == null) return null;

  let storeIdRaw = '';
  let storeNameRaw = '';
  let sheetNameSkladRaw = '';
  let sheetNameAccountingRaw = '';

  if (Array.isArray(store)) {
    storeIdRaw = store?.[0];
    storeNameRaw = store?.[1];
    sheetNameSkladRaw = store?.[2];
    sheetNameAccountingRaw = store?.[3];
  } else if (typeof store === 'object') {
    storeIdRaw = store?.storeId ?? store?.id ?? store?.store ?? '';
    storeNameRaw = store?.storeName ?? store?.name ?? '';
    sheetNameSkladRaw = store?.sheetName_sklad ?? store?.sklad ?? '';
    sheetNameAccountingRaw = store?.sheetName_accounting ?? store?.accounting ?? '';
  } else {
    storeNameRaw = store;
  }

  const storeId = toNumericId(storeIdRaw);
  const storeName = String(storeNameRaw || '').trim();
  const sheetNameSklad = String(sheetNameSkladRaw || '').trim();
  const sheetNameAccounting = String(sheetNameAccountingRaw || '').trim();
  const baseName = storeName || sheetNameSklad;

  if (!baseName) return null;

  return {
    key: storeId !== '' ? `id:${storeId}` : `name:${String(baseName).toLowerCase()}#${index}`,
    storeId,
    storeName: storeName || baseName,
    sheetName_sklad: sheetNameSklad,
    sheetName_accounting: sheetNameAccounting,
    label: storeName || baseName,
  };
}

function dedupeStores(stores) {
  const deduped = [];
  const seen = new Set();

  stores.forEach((entry, index) => {
    const normalized = normalizeStoreItem(entry, index);
    if (!normalized) return;
    const dedupeKey = normalized.storeId !== ''
      ? `id:${normalized.storeId}`
      : `name:${String(normalized.storeName).trim().toLowerCase()}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    normalized.key = dedupeKey;
    deduped.push(normalized);
  });

  return deduped;
}

function getCurrentUserStore() {
  const current = window.USER_STORE || {};
  const headerStoreName = String(document.getElementById('store')?.textContent || '').trim();
  const storeId = toNumericId(current.storeId ?? current.store ?? current.id);
  const storeName = String(current.storeName || current.name || current.store || headerStoreName || '').trim();
  const sheetNameSklad = String(current.sheetName_sklad || current.sklad || '').trim();
  const sheetNameAccounting = String(current.sheetName_accounting || current.accounting || '').trim();
  const baseName = storeName || sheetNameSklad;
  if (storeId === '' && !baseName) return null;

  return {
    key: storeId !== '' ? `id:${storeId}` : `name:${String(baseName).toLowerCase()}`,
    storeId,
    storeName: storeName || baseName,
    sheetName_sklad: sheetNameSklad,
    sheetName_accounting: sheetNameAccounting,
    label: storeName || baseName || `Store ${storeId}`,
  };
}

function findDefaultStore(stores, currentStore) {
  if (!Array.isArray(stores) || stores.length === 0) return currentStore || null;

  if (currentStore) {
    if (currentStore.storeId !== '') {
      const byId = stores.find((store) => store.storeId !== '' && Number(store.storeId) === Number(currentStore.storeId));
      if (byId) return byId;
    }

    const names = [
      currentStore.storeName,
      currentStore.sheetName_sklad,
      currentStore.label,
    ]
      .map((value) => String(value || '').trim().toLowerCase())
      .filter(Boolean);

    if (names.length > 0) {
      const byName = stores.find((store) => {
        const fields = [
          store.storeName,
          store.sheetName_sklad,
          store.label,
        ].map((value) => String(value || '').trim().toLowerCase());
        return fields.some((field) => names.includes(field));
      });
      if (byName) return byName;
    }
  }

  return stores[0];
}

function findAlternativeStore(stores, excludedKey) {
  return (stores || []).find((store) => store.key !== excludedKey) || null;
}

function buildSelectedStoreQuery(baseQuery = {}) {
  const query = { ...baseQuery };
  const source = selectedSourceStore || getCurrentUserStore();
  const target = selectedTargetStore || findAlternativeStore(availableStores, source?.key) || source;
  if (!source && !target) return query;

  if (source?.storeId !== '') {
    query.store = source.storeId;
    query.storeId = query.storeId || source.storeId;
  }
  if (source?.storeName) {
    query.storeName = source.storeName;
  }
  if (source?.sheetName_sklad) {
    query.sheetName_sklad = source.sheetName_sklad;
    query.sklad = source.sheetName_sklad;
    query.skladName1 = source.sheetName_sklad;
  }
  if (source?.sheetName_accounting) {
    query.sheetName_accounting = source.sheetName_accounting;
  }

  if (target?.storeId !== '') {
    query.store2 = target.storeId;
    query.storeId2 = target.storeId;
  }
  if (target?.storeName) {
    query.storeName2 = target.storeName;
  }
  if (target?.sheetName_sklad) {
    query.sheetName_sklad_2 = target.sheetName_sklad;
    query.sklad2 = target.sheetName_sklad;
    query.skladName2 = target.sheetName_sklad;
  }
  if (target?.sheetName_accounting) {
    query.sheetName_accounting_2 = target.sheetName_accounting;
  }

  return query;
}

async function fetchStoresForAdminSklad() {
  let stores = [];

  if (window.API && typeof window.API.getStores === 'function') {
    try {
      const raw = await window.API.getStores({ token: window.token }, { overlayId: PAGE_ID });
      stores = unwrapArrayPayload(raw);
    } catch (error) {
      console.error('admin_sklad: failed to load stores via API.getStores', error);
    }
  }

  if ((!Array.isArray(stores) || stores.length === 0) && Array.isArray(window.STORES_CACHE)) {
    stores = window.STORES_CACHE;
  }

  if (!Array.isArray(stores) || stores.length === 0) {
    try {
      const cachedRaw = window.localStorage?.getItem('stores_cache');
      const cachedParsed = cachedRaw ? JSON.parse(cachedRaw) : [];
      if (Array.isArray(cachedParsed)) stores = cachedParsed;
    } catch (error) {
      console.warn('admin_sklad: failed to read stores_cache', error);
    }
  }

  return dedupeStores(Array.isArray(stores) ? stores : []);
}

function renderStoreOptions(selectEl, stores, currentStore) {
  if (!selectEl) return;
  selectEl.innerHTML = '';
  (stores || []).forEach((store) => {
    const option = document.createElement('option');
    option.value = store.key;
    option.textContent = store.storeName || store.label || 'Store';
    selectEl.appendChild(option);
  });

  if (currentStore && Array.from(selectEl.options).some((option) => option.value === currentStore.key)) {
    selectEl.value = currentStore.key;
  } else if (selectEl.options.length > 0) {
    selectEl.value = selectEl.options[0].value;
  }

  selectEl.disabled = selectEl.options.length <= 1;
}

function getWarehouseDisplayName(wid) {
  const store = wid === 1 ? selectedSourceStore : selectedTargetStore;
  return store?.storeName || store?.label || (wid === 1 ? 'Склад 1' : 'Склад 2');
}

async function ensureStoreSwitcher() {
  const fromSelectEl = document.getElementById('adminSkladFromSelect');
  const toSelectEl = document.getElementById('adminSkladToSelect');
  if (!fromSelectEl || !toSelectEl) return;

  const storesFromService = await fetchStoresForAdminSklad();
  const currentStore = getCurrentUserStore();
  availableStores = Array.isArray(storesFromService) ? storesFromService.slice() : [];

  if (currentStore) {
    const alreadyIncluded = availableStores.some((store) => {
      if (currentStore.storeId !== '' && store.storeId !== '') {
        return Number(currentStore.storeId) === Number(store.storeId);
      }
      return String(store.storeName || '').trim().toLowerCase() === String(currentStore.storeName || '').trim().toLowerCase();
    });
    if (!alreadyIncluded) {
      availableStores.unshift(currentStore);
    }
  }

  if (!selectedSourceStore) {
    selectedSourceStore = findDefaultStore(availableStores, currentStore);
  } else {
    selectedSourceStore = availableStores.find((store) => store.key === selectedSourceStore.key) || selectedSourceStore;
  }

  if (!selectedTargetStore) {
    selectedTargetStore = findAlternativeStore(availableStores, selectedSourceStore?.key) || selectedSourceStore;
  } else {
    selectedTargetStore = availableStores.find((store) => store.key === selectedTargetStore.key) || selectedTargetStore;
  }

  if (selectedSourceStore?.key === selectedTargetStore?.key) {
    const fallbackStore = findAlternativeStore(availableStores, selectedSourceStore?.key);
    if (fallbackStore) selectedTargetStore = fallbackStore;
  }

  renderStoreOptions(fromSelectEl, availableStores, selectedSourceStore);
  renderStoreOptions(toSelectEl, availableStores, selectedTargetStore);

  const bindSelector = (selectEl, side) => {
    if (selectEl.dataset.bound) return;
    selectEl.addEventListener('change', async (event) => {
      const nextKey = String(event.target.value || '');
      const nextStore = availableStores.find((store) => store.key === nextKey);
      const currentStoreForSide = side === 'source' ? selectedSourceStore : selectedTargetStore;
      if (!nextStore || nextStore.key === currentStoreForSide?.key) return;

      if (changes.length > 0) {
        const shouldReset = window.confirm('Есть несохраненные изменения. Переключить склад и сбросить их?');
        if (!shouldReset) {
          event.target.value = currentStoreForSide?.key || '';
          return;
        }
        changes.length = 0;
      }

      if (side === 'source') selectedSourceStore = nextStore;
      else selectedTargetStore = nextStore;

      if (selectedSourceStore?.key === selectedTargetStore?.key) {
        const fallbackStore = findAlternativeStore(availableStores, nextStore.key);
        if (fallbackStore) {
          if (side === 'source') selectedTargetStore = fallbackStore;
          else selectedSourceStore = fallbackStore;
        }
      }

      renderStoreOptions(fromSelectEl, availableStores, selectedSourceStore);
      renderStoreOptions(toSelectEl, availableStores, selectedTargetStore);
      vocabularyCache = null;
      await bodyOnload();
    });
    selectEl.dataset.bound = '1';
  };

  bindSelector(fromSelectEl, 'source');
  bindSelector(toSelectEl, 'target');
}

async function loadHeader() {
ALL_FIELDS=['article','Brand','num','price','Brand','type','subtype','description','Name','fabric','color','size','manufacturer','price', 'quantity', 'netprice', 'netpriceFull', 'scladprice', 'salePrice']
 
  const data = await window.API.getSkladHeader(
    buildSelectedStoreQuery({ visible: true, TESTING: CONFIG.GLOBAL_EXECUTION_TESTING }),
    { overlayId: "admin_sklad" }
  );
  console.log('data:', data);
  ALL_FIELDS = data?.[0]?.sklad_header || ALL_FIELDS; // присваиваем после получения


}

const SUGGEST_FIELDS = ['Brand','type','subtype','fabric','color','size','manufacturer'];
const FIELDS_WITH_LOCALIZED_NUMBERS = ['price', 'quantity', 'netprice', 'netpriceFull', 'scladprice', 'salePrice']; // добавьте нужные поля
const VOCABULARY_FIELDS = SUGGEST_FIELDS

// Кэш для словаря
let vocabularyCache = null;

const warehouses = {1: [], 2: []};
const changes    = [];
const filters    = {1:{text:'',hideZero:true},2:{text:'',hideZero:true}};
let currentTransfer = {};
let warehousesInitialized = false;




async function bodyOnload() {
      await ensureStoreSwitcher();
      warehousesInitialized = false;
      vocabularyCache = null;
      const query = buildSelectedStoreQuery({ action: "getSkladData", visible: true , TESTING:CONFIG.GLOBAL_EXECUTION_TESTING});
          try {
              const data = await window.API.getSkladData(query, { overlayId: "admin_sklad" });
              document.getElementById("warehouseData1").setAttribute("data-warehouse1",JSON.stringify(data?.[0]?.data1 || []))
              document.getElementById("warehouseData2").setAttribute("data-warehouse2",JSON.stringify(data?.[1]?.data2 || []))
              init()
          } catch (error) {
              console.error('admin_sklad: failed to load warehouse data', error);
              if (typeof showErrorPopup === 'function') {
                showErrorPopup('Не удалось загрузить данные складов');
              }
          }
}






// Проверка и подготовка товара с article
function ensureArticle(product) {
  const clone = {...product};
 // if (!clone.article) throw new Error('У товара должно быть поле article');
  const qty = Number(clone.quantity) ||  0;
  clone.quantity = qty;



  
   return clone;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(()=>fn(...args), ms);
  };
}



const getQty = (p, wid) =>
  wid===1
    ? Number(p.quantity ?? 0)
    : Number(p.quantity ?? 0);



const formatPrice = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString('ru-RU') : v;
};


  
  
  
  
  
  
  async function init(){  
 
  if (!warehousesInitialized) {
    try {
      warehouses[1] = JSON.parse(document.getElementById('warehouseData1').dataset.warehouse1)
        .map(ensureArticle);
    } catch {}
    try {
      warehouses[2] = JSON.parse(document.getElementById('warehouseData2').dataset.warehouse2)
        .map(ensureArticle);
    } catch {}
    warehousesInitialized = true;
  }
  await loadHeader();
  renderWarehouses();
  if (!pageListenersBound) {
    setupDragAndDrop();
    setupFilters();
    setupSaveButton();
    setupAddButtons();
    pageListenersBound = true;
  }


}









function filterProducts(arr, wid) {
  const {text, hideZero} = filters[wid];
  const needle = text.trim().toLowerCase();
  return arr.filter(p => {
    if (hideZero && getQty(p,wid)<=0) return false;
    if (!needle) return true;
    return [...MAIN_FIELDS, ...EXTRA_FIELDS]
      .some(f=>String(p[f]??'').toLowerCase().includes(needle));
  });
}

function renderWarehouses() {
  [1,2].forEach(wid=>{
    const cont = document.getElementById(`products${wid}`);
    cont.innerHTML = '';
    const list = filterProducts(warehouses[wid], wid);
    if (!list.length) {
      const emptyText =
        typeof window.localizeUiText === "function"
          ? window.localizeUiText("Нет товаров для отображения", "Нет товаров для отображения")
          : "Нет товаров для отображения";
      cont.innerHTML = `<div class="zone-empty">${emptyText}</div>`;
      return;
    }
    list.forEach(p => buildCard(p, wid, cont));
  });
}

// Проверяем, изменён ли товар по article
function isProductChanged(article) {
  return changes.some(c => String(c.productArticle) === String(article));
}

// Обновляем товар на складе по article или добавляем новый
function updateProductInWarehouse(wid, prod) {
console.log('Обновляем товар:', prod);

  const list = warehouses[wid];
  const idx = list.findIndex(p => String(p.article) === String(prod.article));
  if (idx > -1) {
    list[idx] = {...prod}; // обновляем объект!
  } else {
    list.push({...prod});
  }
}

// Строим карточку товара, помечая изменённые товары
function buildCard(prod, wid, container) {
  const qty = getQty(prod, wid);
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.productArticle = prod.article;
  card.dataset.warehouseId = wid;
  if (qty <= 0) card.classList.add('disabled');
  if (isProductChanged(prod.article)) card.classList.add('moved');

  const dragCol = document.createElement('div');
  dragCol.className = 'dragcol';
  if (qty > 0) {
    const btn = document.createElement('button');
    btn.className = 'btn-drag';
    btn.innerHTML = '<i class="move"></i>';
    btn.draggable = true;
    btn.title = 'Перетащить';
    btn.addEventListener('dragstart', e=>{
      e.dataTransfer.setData('product-article', prod.article);
      e.dataTransfer.setData('warehouse-id', wid);
      card.classList.add('dragging');
    });
    btn.addEventListener('dragend', ()=>card.classList.remove('dragging'));
    dragCol.appendChild(btn);
  }
  card.appendChild(dragCol);

  const badge = document.createElement('div');
  badge.className = 'qty-badge';
  badge.textContent = `${qty} шт.`;
  card.appendChild(badge);

  card.insertAdjacentHTML('beforeend', `
    <div class="main-row">
      <span class="main-article" title="${prod.article||''}">
        ${prod.article||''}
      </span>
      <span class="main-name" title="${prod.Name||''}">
        ${prod.Name||''}
      </span>
      <span class="main-brand" title="${prod.Brand||''}">
        ${prod.Brand||''}
      </span>
      <span class="main-price" title="${prod.price||''}">
        ${formatPrice(prod.price)}
      </span>
    </div>`);

  const bottomRow = document.createElement('div');
  bottomRow.className = 'bottom-row';
  bottomRow.innerHTML = `
    <span class="bottom-desc"  title="${prod.description||''}">
      ${prod.description||''}
    </span>
    <span class="bottom-color" title="${prod.color||''}">
      ${prod.color||''}
    </span>
    <span class="bottom-size"  title="${prod.size||''}">
      ${prod.size||''}
    </span>`;

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'icon-btn btn-edit-bottom';
  editBtn.id = 'edit-bottom';
  editBtn.innerHTML = '✎';
  editBtn.title = 'Редактировать';
  editBtn.addEventListener('click', ()=>showDetailsModal(prod, wid, false));
  bottomRow.appendChild(editBtn);



  card.appendChild(bottomRow);
  container.appendChild(card);
}

function setupDragAndDrop() {
  [1,2].forEach(wid=>{
    const zone = document.getElementById(`products${wid}-zone`);
    zone.addEventListener('dragover', e=>{ e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', ()=> zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e=>{
      e.preventDefault(); zone.classList.remove('drag-over');
      const article  = e.dataTransfer.getData('product-article');
      const from = +e.dataTransfer.getData('warehouse-id');
      const to   = wid;
      if (!article || from===to) return;
      const prod = warehouses[from].find(p=>String(p.article)===article);
      if (!prod) return;
      const max = getQty(prod,from);
      if (max<=0) return;
      currentTransfer = {productArticle:article,from,to,max};
      document.getElementById('maxQuantity').textContent = max;
      const inp = document.getElementById('transferQuantity');
      inp.max = max; inp.value = 1;
      openModal('quantityModal', false);
    });
  });
  document.getElementById('confirmTransfer').addEventListener('click', ()=>{
    const qty = Number(document.getElementById('transferQuantity').value)||0;
    moveProduct(currentTransfer.productArticle, currentTransfer.from, currentTransfer.to, qty);
     renderWarehouses();
    closeModal('quantityModal');
  });
}

function moveProduct(article, from, to, qty) {
  if (qty <= 0) return;

  const fList = warehouses[from];
  const idx = fList.findIndex(p => String(p.article) === String(article));
  if (idx < 0) return;

  const prod = fList[idx];

  // Уменьшаем quantity на складе-источнике
  const newQtyFrom = (Number(prod.quantity) || 0) - qty;
  if (newQtyFrom <= 0) {
    // Удаляем товар с исходного склада
    fList.splice(idx, 1);
  } else {
    prod.quantity = newQtyFrom;
  }

  // Добавляем или обновляем товар на складе-получателе
  const tList = warehouses[to];
  const existing = tList.find(p => String(p.article) === String(article));
  if (existing) {
    existing.quantity = (Number(existing.quantity) || 0) + qty;
  } else {
    // Копируем товар, устанавливаем quantity = qty
    const newProd = { ...prod, quantity: qty };
    tList.push(newProd);
  }

  // Отмечаем изменение
  if (!isProductChanged(article)) {
    changes.push({ productArticle: article, from, to, qty, timestamp: new Date().toISOString() });
  }

  renderWarehouses();
}


function setupFilters() {
  [
    {txt:'filter1',hide:'hideZero1',wid:1},
    {txt:'filter2',hide:'hideZero2',wid:2}
  ].forEach(({txt,hide,wid})=>{
    const deb = debounce(val=>{ filters[wid].text=val; renderWarehouses(); }, 200);
    document.getElementById(txt).addEventListener('input', e=>deb(e.target.value));
    document.getElementById(hide).addEventListener('change', e=>{
      filters[wid].hideZero=e.target.checked;
      renderWarehouses();
    });
  });
}

function setupSaveButton() {
  document.getElementById('btnSaveAll').addEventListener('click', async ()=>{
    if (!changes.length) {
      showToast('Нет изменений для сохранения','info');
      return;
    }
    try {
      const payload = {
        query: buildSelectedStoreQuery({
          action: 'saveSkladChanges',
          visible: true,
          TESTING: CONFIG.GLOBAL_EXECUTION_TESTING,
        }),
        data: changes,
      };
      const resp = await window.API.saveSkladChanges(payload, { timeout: 8000, overlayId: "admin_sklad" });
      if (resp == null) throw new Error("Не удалось сохранить изменения");
      showToast('Изменения успешно сохранены!','success');
      changes.length=0;
      renderWarehouses();
    } catch(err) {
      showToast(`Ошибка: ${err.message}`,'error');
    }
  });
}

function setupAddButtons() {
  document.querySelectorAll('.add-product').forEach(btn=>{
    btn.addEventListener('click', ()=> showDetailsModal({}, +btn.dataset.wid, true));
  });
}




// Функция загрузки словаря с сервера
async function loadVocabulary() {
  if (vocabularyCache) {
    // Уже загружено
    return vocabularyCache;
  }

  try {
    const data = await window.API.getSkladVocabulary(
      buildSelectedStoreQuery({ action: "getVocabulary", visible: true, TESTING: CONFIG.GLOBAL_EXECUTION_TESTING }),
      { overlayId: "admin_sklad" }
    );
    //console.log(data[0])
    // data — объект с массивами в формате, который вы показали

    // Преобразуем массивы вида [["val1", "val2", ...]] в просто массивы
    const cleanedData = {};
    for (const field of VOCABULARY_FIELDS) {
      if (data[0][field] && Array.isArray(data[0][field])) {
        cleanedData[field] = data[0][field].slice().sort(); // копия и сортировка
      } else {
        cleanedData[field] = [];
      }
    }

    vocabularyCache = cleanedData;
    return vocabularyCache;
  } catch (error) {
    console.error('Ошибка при загрузке словаря:', error);
    vocabularyCache = {};
    return vocabularyCache;
  }
}

// Функция получения уникальных опций для поля
async function getUniqueOptions(field) {
  if (!vocabularyCache) {
    await loadVocabulary();
  }
  console.log("vocabularyCache",vocabularyCache)
  return vocabularyCache[field] || [];
}


document.getElementById('btnDeleteProduct').addEventListener('click', async () => {
  const detailsBody = document.getElementById('detailsBody');
  const article = detailsBody.dataset.article;
   const row = detailsBody.dataset.row;
  const wid = +detailsBody.dataset.wid;

  if (!article) {
    alert('Артикул товара не найден, удаление невозможно.');
    return;
  }

  if (!confirm(`Вы уверены, что хотите удалить товар с артикулом ${article}?`)) {
    return;
  }

try {
    const query = buildSelectedStoreQuery({ action: 'deleteItem', visible: true, wid: wid, TESTING: CONFIG.GLOBAL_EXECUTION_TESTING });
    const data = { article: article };

    const params = { query: query, data: data };

    const resp = await window.API.deleteSkladItem(params, { timeout: 8000, overlayId: "admin_sklad" });
    if (resp == null) throw new Error("Не удалось удалить товар");

    // Удаляем товар из локального массива
    const list = warehouses[wid];
    const idx = list.findIndex(p => String(p.article) === String(article));
    if (idx !== -1) list.splice(idx, 1);

    warehousesInitialized = false;
    await bodyOnload();

    showToast('Товар удалён!', 'success');
    closeModal('detailsModal', true);

  } catch (error) {
    showToast(`Ошибка при удалении: ${error.message}`, 'error');
  }
});





function showSelectionModal(field, currentValue, callback) {
  const modal = document.getElementById('selectionModal');
  const body = document.getElementById('selectionBody');
  const title = document.getElementById('selectionModalLabel');
  
  body.innerHTML = '';
  title.textContent = `Выберите ${field}`;
  
  // Добавляем кнопку для создания нового значения
  const newBtn = document.createElement('button');
  newBtn.textContent = 'Новое значение';
  newBtn.className = 'btn btn-primary mb-2';
  newBtn.onclick = () => {
    const newValue = prompt(`Введите новое значение для ${field}:`, '');
    if (newValue) {
      callback(newValue);
      closeModal('selectionModal');
    }
  };
  body.appendChild(newBtn);
  
  // Добавляем список существующих значений
  const values = getUniqueOptions(field);
  if (values.length > 0) {
    const list = document.createElement('div');
    list.className = 'list-group';
    
    values.forEach(value => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `list-group-item list-group-item-action ${value === currentValue ? 'active' : ''}`;
      item.textContent = value;
      item.onclick = () => {
        callback(value);
        closeModal('selectionModal');
      };
      list.appendChild(item);
    });
    
    body.appendChild(list);
  } else {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'text-muted';
    emptyMsg.textContent = 'Нет доступных вариантов';
    body.appendChild(emptyMsg);
  }
  
  openModal('selectionModal', true);
}



async function showDetailsModal(prod = {}, wid, isNew) {
  const body  = document.getElementById('detailsBody');
  const label = document.getElementById('detailsModalLabel');
  body.innerHTML = '';
  body.dataset.wid   = wid;
  body.dataset.isNew = isNew ? '1' : '0';
  body.dataset.article = prod.article || '';
  body.dataset.row = prod.num || '';
  label.textContent  = isNew ? `Новый товар (${getWarehouseDisplayName(wid)})` : `Редактирование товара (${getWarehouseDisplayName(wid)})`;

for (const f of ALL_FIELDS) {
  const lbl = document.createElement('label');
  lbl.htmlFor = `fld_${f}`;
  lbl.textContent = f;

  let inp;

  if (HIDDEN_FIELDS.includes(f)) {
    // создаём скрытое поле
    inp = document.createElement('input');
    inp.type = 'hidden';
  } else {
    inp = f === 'Comments'
      ? document.createElement('textarea')
      : document.createElement('input');
  }

  inp.autocomplete = "off";
  inp.id = inp.name = `fld_${f}`;

  // Значение с форматированием для числовых полей
  if (FIELDS_WITH_LOCALIZED_NUMBERS.includes(f) && prod[f] != null && prod[f] !== '') {
    const numVal = Number(prod[f]);
    inp.value = Number.isFinite(numVal) ? numVal.toLocaleString('ru-RU') : prod[f];
  } else {
    inp.value = prod[f] || '';
  }

  if (['quantity', 'price'].includes(f)) inp.type = 'number';
  if (f === 'article' || f === 'num') {
    inp.disabled = true;
    inp.readOnly = true;
  }

  if (!HIDDEN_FIELDS.includes(f)) {
    body.appendChild(lbl);
  }
  body.appendChild(inp);





    if (SUGGEST_FIELDS.includes(f)) {
      // Отключаем ручной ввод
      inp.readOnly = true;

      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'custom-options';
      optionsContainer.style.display = 'none';
      optionsContainer.style.position = 'absolute';
      optionsContainer.style.border = '1px solid #ccc';
      optionsContainer.style.background = '#fff';
      optionsContainer.style.maxHeight = '150px';
      optionsContainer.style.overflowY = 'auto';
      optionsContainer.style.zIndex = 1000;

      // Получаем опции
      const values = await getUniqueOptions(f);
      values.forEach(value => {
        const option = document.createElement('div');
        option.className = 'custom-option';
        option.textContent = value;
        option.style.padding = '5px 10px';
        option.style.cursor = 'pointer';

        option.addEventListener('mousedown', (e) => {
          e.preventDefault();
          inp.value = value;
          optionsContainer.style.display = 'none';
          inp.dispatchEvent(new Event('input')); // если нужно
        });

        option.addEventListener('mouseenter', () => {
          option.style.backgroundColor = '#bde4ff';
        });
        option.addEventListener('mouseleave', () => {
          option.style.backgroundColor = '';
        });

        optionsContainer.appendChild(option);
      });

      document.body.appendChild(optionsContainer);

      function positionOptions() {
        const rect = inp.getBoundingClientRect();
        optionsContainer.style.top = rect.bottom + window.scrollY + 'px';
        optionsContainer.style.left = rect.left + window.scrollX + 'px';
        optionsContainer.style.width = rect.width + 'px';
      }

      // Показываем/скрываем список по клику на поле
      inp.addEventListener('click', (e) => {
        e.stopPropagation(); // чтобы не закрыть сразу
        positionOptions();
        optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
      });

      // Закрываем список при клике вне поля и списка
      document.addEventListener('click', () => {
        optionsContainer.style.display = 'none';
      });

      // Обновляем позицию при скролле и ресайзе
      window.addEventListener('scroll', () => {
        if (optionsContainer.style.display === 'block') positionOptions();
      });
      window.addEventListener('resize', () => {
        if (optionsContainer.style.display === 'block') positionOptions();
      });

      // Скрываем список при потере фокуса (с небольшой задержкой)
      inp.addEventListener('blur', () => {
        setTimeout(() => {
          optionsContainer.style.display = 'none';
        }, 150);
      });

      // Фильтрация опций по вводу (если хотите разрешить ввод, можно убрать readOnly)
      // В вашем случае ввод отключен, можно не использовать фильтрацию
    }
  }

  openModal('detailsModal', true);
}



// === ОБРАБОТКА СОХРАНЕНИЯ формы редактирования/добавления ===
document.addEventListener('submit', async e => {
  if (e.target.id !== 'detailsForm') return;
  e.preventDefault();
  const body = document.getElementById('detailsBody');
  const wid = +body.dataset.wid;
  const isNew = body.dataset.isNew === '1';
  const data = {};
  [...e.target.elements].forEach(el => {
    if (el.name ) {
      data[el.name.replace('fld_', '')] = el.value;
    }
  });


  try {
    const action = isNew ? 'addItem' : 'editItem';

      const query = buildSelectedStoreQuery({ action: action, visible: true, wid:wid, TESTING:CONFIG.GLOBAL_EXECUTION_TESTING });
      const params = { query:query, data:  data  };
    
    const resp = isNew
      ? await window.API.addSkladItem(params, { timeout: 8000, overlayId: "admin_sklad" })
      : await window.API.editSkladItem(params, { timeout: 8000, overlayId: "admin_sklad" });
    if (resp == null) throw new Error("Не удалось сохранить изменения");

    const prepared = ensureArticle(data);
    updateProductInWarehouse(wid, prepared);

    if (!changes.some(c => String(c.productArticle) === String(prepared.article))) {
      changes.push({ productArticle: prepared.article, timestamp: new Date().toISOString() });
    }

   // renderWarehouses();
warehousesInitialized=false
await bodyOnload()

    showToast(isNew ? 'Товар добавлен!' : 'Изменения сохранены!', 'success');
    closeModal('detailsModal', true);

  } catch(err) {
    showToast(`Ошибка: ${err.message}`, 'error');
  }
});

// --- Модальные окна ---
function openModal(id, persistent) {
  const m = document.getElementById(id);
  m.dataset.persistent = persistent?'true':'false';
  m.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(()=>{
    const first = m.querySelector('input,button');
    if (first) first.focus();
  },50);
}
function closeModal(id, force=false) {
  const m = document.getElementById(id);
  if (!force && m.dataset.persistent==='true') return;
  m.classList.remove('active');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal').forEach(modal=>{
  modal.addEventListener('click', e=>{
    if (e.target.hasAttribute('data-close')) {
      closeModal(modal.id, true);
    } else if (e.target===modal && modal.dataset.persistent!=='true') {
      closeModal(modal.id);
    }
  });
});
document.addEventListener('keydown', e=>{
  if (e.key!=='Escape') return;
  document.querySelectorAll('.modal.active').forEach(modal=>{
    if (modal.dataset.persistent!=='true') closeModal(modal.id);
  });
});

if (typeof registerPageInit === "function") {
  registerPageInit("admin_sklad", bodyOnload);
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bodyOnload);
} else {
  bodyOnload();
}
