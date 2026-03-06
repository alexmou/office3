(function() {
const PAGE_ID = "catalog";
const INITIAL_QUERY = "All";
const DATA_FUNCTION_NAME = "getAllItemsFromCatalogByQuery";
const TABLEID = "catalog-list";
const COLUMNS_TO_KEEP = [
  "article",
  "Brand",
  "Name",
  "price",
  "quantity",
  "type",
  "subtype",
  "color",
  "size",
  "производитель",
  "description",
];

registerPageInit(PAGE_ID, initCatalogPage);

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
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
  if (value === null || value === undefined || String(value).trim() === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? n : "";
}

function normalizeStoreItem(store, index) {
  if (store == null) return null;

  let storeIdRaw = "";
  let storeNameRaw = "";
  let sheetNameSkladRaw = "";
  let sheetNameAccountingRaw = "";

  if (Array.isArray(store)) {
    storeIdRaw = store?.[0];
    storeNameRaw = store?.[1];
    sheetNameSkladRaw = store?.[2];
    sheetNameAccountingRaw = store?.[3];
  } else if (typeof store === "object") {
    storeIdRaw = store?.storeId ?? store?.id ?? store?.store ?? "";
    storeNameRaw = store?.storeName ?? store?.name ?? "";
    sheetNameSkladRaw = store?.sheetName_sklad ?? store?.sklad ?? "";
    sheetNameAccountingRaw = store?.sheetName_accounting ?? store?.accounting ?? "";
  } else {
    storeNameRaw = store;
  }

  const storeId = toNumericId(storeIdRaw);
  const storeName = String(storeNameRaw || "").trim();
  const sheetNameSklad = String(sheetNameSkladRaw || "").trim();
  const sheetNameAccounting = String(sheetNameAccountingRaw || "").trim();
  const baseName = storeName || sheetNameSklad;

  if (!baseName) return null;

  const label = storeName || baseName;
  const key = storeId !== "" ? `id:${storeId}` : `name:${baseName.toLowerCase()}#${index}`;

  return {
    key,
    storeId,
    storeName: storeName || baseName,
    sheetName_sklad: sheetNameSklad,
    sheetName_accounting: sheetNameAccounting,
    label,
  };
}

function dedupeStores(stores) {
  const deduped = [];
  const seen = new Set();

  stores.forEach((entry, index) => {
    const normalized = normalizeStoreItem(entry, index);
    if (!normalized) return;
    const dedupeKey = normalized.storeId !== ""
      ? `id:${normalized.storeId}`
      : `name:${String(normalized.storeName).trim().toLowerCase()}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    normalized.key = dedupeKey;
    deduped.push(normalized);
  });

  return deduped;
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

function applyPriceFormatting(rows, header) {
  const priceIndex = header.findIndex((h) => String(h || "").trim().toLowerCase() === "price");
  if (priceIndex === -1) return rows;

  return rows.map((row) => {
    if (!Array.isArray(row)) return row;
    const next = row.slice();
    next[priceIndex] = formatPriceValueRu(next[priceIndex]);
    return next;
  });
}

function normalizeCatalogRows(rawRows, columnsToKeep) {
  const raw = Array.isArray(rawRows) ? rawRows : [];
  if (raw.length === 0) {
    return { header: columnsToKeep.slice(), rows: [] };
  }

  // Новый формат: массив объектов [{...}, {...}]
  if (raw[0] && typeof raw[0] === "object" && !Array.isArray(raw[0])) {
    const present = new Set();
    raw.forEach((row) => {
      Object.keys(row || {}).forEach((k) => present.add(k));
    });
    const header = columnsToKeep.filter((h) => present.has(h));
    const rows = raw.map((row) => header.map((h) => (row?.[h] ?? "")));
    return { header, rows: applyPriceFormatting(rows, header) };
  }

  // Старый формат: матрица [headers, visibleContext, editableContext, ...data]
  if (!Array.isArray(raw[0])) {
    throw new Error("Неизвестный формат данных каталога.");
  }

  const headersRow = raw[0];
  const indices = columnsToKeep
    .map((col) => headersRow.indexOf(col))
    .filter((idx) => idx !== -1);

  const header = indices.map((i) => headersRow[i]);
  const dataStartIndex = raw.length >= 3 ? 3 : 1;
  const rows = raw
    .slice(dataStartIndex)
    .map((row) => indices.map((i) => (row && row[i] !== undefined ? row[i] : "")));

  return { header, rows: applyPriceFormatting(rows, header) };
}

function reInitFilterOptions(catalogData) {
  catalogData.filterOptions = catalogData.header.map((h, i) => ({ header: h, index: i }));
  catalogData.currentQuery = {};
  catalogData.filterOptions.forEach((opt) => {
    catalogData.currentQuery[opt.header] = "All";
  });
}

function getCurrentUserStore() {
  const current = window.USER_STORE || {};
  const headerStoreName = String(document.getElementById("store")?.textContent || "").trim();
  const storeId = toNumericId(current.storeId ?? current.store ?? current.id);
  const storeName = String(current.storeName || current.name || current.store || headerStoreName || "").trim();
  const sheetNameSklad = String(current.sheetName_sklad || current.sklad || "").trim();
  const sheetNameAccounting = String(current.sheetName_accounting || current.accounting || "").trim();
  const baseName = storeName || sheetNameSklad;
  if (storeId === "" && !baseName) return null;

  const label = storeName || baseName || `Store ${storeId}`;

  return {
    key: storeId !== "" ? `id:${storeId}` : `name:${String(baseName).toLowerCase()}`,
    storeId,
    storeName: storeName || baseName,
    sheetName_sklad: sheetNameSklad,
    sheetName_accounting: sheetNameAccounting,
    label,
  };
}

function findDefaultStore(stores, currentStore) {
  if (!Array.isArray(stores) || stores.length === 0) return currentStore || null;

  if (currentStore) {
    if (currentStore.storeId !== "") {
      const byId = stores.find((s) => s.storeId !== "" && Number(s.storeId) === Number(currentStore.storeId));
      if (byId) return byId;
    }

    const names = [
      currentStore.storeName,
      currentStore.sheetName_sklad,
      currentStore.label,
    ]
      .map((v) => String(v || "").trim().toLowerCase())
      .filter(Boolean);

    if (names.length > 0) {
      const byName = stores.find((s) => {
        const fields = [
          s.storeName,
          s.sheetName_sklad,
          s.label,
        ].map((v) => String(v || "").trim().toLowerCase());
        return fields.some((f) => names.includes(f));
      });
      if (byName) return byName;
    }
  }

  return stores[0];
}

function buildCatalogQueryForStore(store) {
  const query = { value: INITIAL_QUERY };
  if (!store) return query;

  if (store.storeId !== "") {
    query.store = store.storeId;
    query.storeId = store.storeId;
  }
  if (store.storeName) {
    query.storeName = store.storeName;
  }
  if (store.sheetName_sklad) {
    query.sheetName_sklad = store.sheetName_sklad;
    query.sklad = store.sheetName_sklad;
  }
  if (store.sheetName_accounting) {
    query.sheetName_accounting = store.sheetName_accounting;
  }
  return query;
}

async function fetchCatalogRowsForStore(store) {
  const query = buildCatalogQueryForStore(store);
  if (window.API && typeof window.API.getAllItemsFromCatalogByQuery === "function") {
    const raw = await window.API.getAllItemsFromCatalogByQuery(query, { overlayId: PAGE_ID });
    return unwrapArrayPayload(raw);
  }

  const request = {
    googleFuncName: DATA_FUNCTION_NAME,
    callbackJSfunctionName: "loadItemListUI",
    params: query,
  };
  const raw = await runGSfunctionPromise(request);
  return unwrapArrayPayload(raw);
}

async function fetchStoresForCatalog() {
  let stores = [];

  if (window.API && typeof window.API.getStores === "function") {
    try {
      const raw = await window.API.getStores({ token: window.token }, { overlayId: PAGE_ID });
      stores = unwrapArrayPayload(raw);
    } catch (e) {
      console.error("Catalog: failed to load stores via API.getStores", e);
    }
  }

  if ((!Array.isArray(stores) || stores.length === 0) && Array.isArray(window.STORES_CACHE)) {
    stores = window.STORES_CACHE;
  }

  if (!Array.isArray(stores) || stores.length === 0) {
    try {
      const cachedRaw = window.localStorage?.getItem("stores_cache");
      const cachedParsed = cachedRaw ? JSON.parse(cachedRaw) : [];
      if (Array.isArray(cachedParsed)) stores = cachedParsed;
    } catch (e) {
      console.warn("Catalog: failed to read stores_cache", e);
    }
  }

  return dedupeStores(Array.isArray(stores) ? stores : []);
}

function ensureCatalogControls(contentEl, listEl) {
  let toolbar = document.getElementById("catalogToolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.id = "catalogToolbar";
    toolbar.className = "catalog-search catalog-search--toolbar";
    toolbar.innerHTML = `
      <div class="catalog-store-wrap">
        <label class="catalog-store-label" for="catalogStoreSelect">Store</label>
        <select id="catalogStoreSelect" class="catalog-store-select"></select>
      </div>
      <input id="catalogFullTextSearch" type="text" placeholder="Поиск по каталогу..." />
      <label class="catalog-stock-label">
        <input id="catalogInStockOnly" type="checkbox" checked />
        показывать товар в наличии
      </label>
    `;
    contentEl.insertBefore(toolbar, listEl);
  }

  return {
    toolbar,
    storeSelect: document.getElementById("catalogStoreSelect"),
    searchInput: document.getElementById("catalogFullTextSearch"),
    inStockCheckbox: document.getElementById("catalogInStockOnly"),
  };
}

function renderStoreOptions(selectEl, stores, selectedStore) {
  if (!selectEl) return;
  const options = (stores || []).map((store) => {
    const option = document.createElement("option");
    option.value = store.key;
    option.textContent = store.storeName || store.label || "Store";
    return option;
  });

  selectEl.innerHTML = "";
  options.forEach((option) => selectEl.appendChild(option));

  if (selectedStore && options.some((option) => option.value === selectedStore.key)) {
    selectEl.value = selectedStore.key;
  } else if (options.length > 0) {
    selectEl.value = options[0].value;
  }

  selectEl.disabled = options.length <= 1;
}

function createCatalogColorizeOptions() {
  return {
    columnName: "quantity",
    value: "0",
    style: "background-color: #97888c66;",
  };
}

async function initCatalogPage() {
  const contentEl = document.getElementById("content");
  const listEl = document.getElementById(TABLEID);
  if (!contentEl || !listEl) return;

  const controls = ensureCatalogControls(contentEl, listEl);
  if (!controls.storeSelect || !controls.searchInput || !controls.inStockCheckbox) return;

  const storesFromService = await fetchStoresForCatalog();
  const currentStore = getCurrentUserStore();
  let stores = Array.isArray(storesFromService) ? storesFromService.slice() : [];

  if (currentStore) {
    const alreadyIncluded = stores.some((store) => {
      if (currentStore.storeId !== "" && store.storeId !== "") {
        return Number(currentStore.storeId) === Number(store.storeId);
      }
      return String(store.storeName || "").trim().toLowerCase() === String(currentStore.storeName || "").trim().toLowerCase();
    });
    if (!alreadyIncluded) {
      stores.unshift(currentStore);
    }
  }

  let selectedStore = findDefaultStore(stores, currentStore);
  renderStoreOptions(controls.storeSelect, stores, selectedStore);

  let catalogData = null;
  let catalogUI = null;

  const drawCatalog = async () => {
    const rows = await fetchCatalogRowsForStore(selectedStore);
    const normalized = normalizeCatalogRows(rows, COLUMNS_TO_KEEP);
    catalogData = new TableData();
    catalogData.initWithPreloadedData(normalized.rows, normalized.header);
    reInitFilterOptions(catalogData);
    catalogData.fullTextQuery = String(controls.searchInput.value || "").trim();
    catalogData.inStockOnly = !!controls.inStockCheckbox.checked;
    catalogData.inStockField = "quantity";

    catalogUI = new TableUI(TABLEID, catalogData);
    catalogUI.colorizeRowsOptions = createCatalogColorizeOptions();
    catalogUI.drawAll();
    catalogUI.updateTable();
  };

  const safeDrawCatalog = async () => {
    controls.storeSelect.disabled = true;
    try {
      await drawCatalog();
    } catch (error) {
      console.error("Catalog: failed to load data", error);
      if (typeof showErrorPopup === "function") {
        showErrorPopup("Не удалось загрузить данные каталога");
      }
    } finally {
      controls.storeSelect.disabled = (stores.length <= 1);
    }
  };

  controls.inStockCheckbox.checked = true;

  const applySearch = debounce(() => {
    if (!catalogData || !catalogUI) return;
    catalogData.fullTextQuery = String(controls.searchInput.value || "").trim();
    catalogUI.updateTable();
  }, 200);

  controls.searchInput.addEventListener("input", () => {
    applySearch();
  });

  controls.inStockCheckbox.addEventListener("change", () => {
    if (!catalogData || !catalogUI) return;
    catalogData.inStockOnly = !!controls.inStockCheckbox.checked;
    catalogUI.updateTable();
  });

  controls.storeSelect.addEventListener("change", async (event) => {
    const selectedKey = String(event.target.value || "");
    const nextStore = stores.find((store) => store.key === selectedKey);
    if (!nextStore) return;
    selectedStore = nextStore;
    await safeDrawCatalog();
  });

  await safeDrawCatalog();
}

})();
