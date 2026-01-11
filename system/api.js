(function() {
  const DEFAULT_TIMEOUT = 80000;
  const API_ROUTES = {
    addBudgetRecord: { source: "auto", webhook: "prod" },
    addCacheRegisterRecord: { source: "auto", webhook: "prod" },
    getAllItemsFromCatalogByQuery: { source: "auto", webhook: "prod" },
    getAllItemsFromSalesByQuery: { source: "auto", webhook: "prod" },
    getAllSalesStatistic: { source: "auto", webhook: "prod" },
    getBudget: { source: "auto", webhook: "prod" },
    getBudgetRecords: { source: "auto", webhook: "prod" },
    getCash: { source: "auto", webhook: "prod" },
    getCashRegisterRecords: { source: "auto", webhook: "prod" },
    getCatalogFilterOptions: { source: "auto", webhook: "prod" },
    getConfig: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "config" },
    getDistinctBrandNames: { source: "auto", webhook: "prod" },
    getHeader:  { source: "n8n", method: "GET", webhook: "test", webhookAction: "getCatalogData" },
    getItemByArticleName: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "getCatalogData" },
    sendSalesToSheet:{ source: "n8n", method: "POST", webhook: "test", webhookAction: "newSale" },

    getMenu: { source: "auto", webhook: "prod" },
    getMySalary: { source: "auto", webhook: "prod" },
    getPivot: { source: "auto", webhook: "prod" },
    getPnl: { source: "auto", webhook: "prod" },
    getSalesFilterOptions: { source: "auto", webhook: "prod" },
    getUserStoreByToken: { source: "auto", webhook: "prod" },
    getVocabulary: { source: "auto", webhook: "prod" }, 
    setStatisticBrandName: { source: "auto", webhook: "prod" },
    setToken: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "Auth" },
    getToken: { source: "n8n", method: "GET", webhook: "prod" },
    updateBudgetData: { source: "auto", webhook: "prod" },
    getStores: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "stores" },
    getAuthData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "Auth" },


  };

  function shouldUseMock(routeSource, overrideSource) {
    const src = overrideSource || routeSource || "auto";
    if (src === "mock") return true;
    if (src === "n8n") return false;
    return !!window.USE_MOCK_DATA;
  }

  async function callN8n(action, paramsWithToken, timeout = DEFAULT_TIMEOUT, mode) {
    const resp = await postDataToN8n(
      `${action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paramsWithToken),
      },
      timeout,
      mode
    );
    if (!resp.ok) throw new Error(await resp.text());

    // Если тело пустое, залогируем статус/заголовки для диагностики
    const cloned = resp.clone ? resp.clone() : resp;
    const text = await cloned.text();
    if (!text) {
      return null;
    }
    return JSON.parse(text);
  }

  async function callN8nGet(action, paramsWithToken, timeout = DEFAULT_TIMEOUT, mode) {
    const webhook = getWebHook(mode);
    const qs = new URLSearchParams();
    const payload = paramsWithToken || {};
    Object.entries(payload).forEach(([key, value]) => {
      qs.append(key, typeof value === "string" ? value : JSON.stringify(value));
    });
    // n8n часто ожидает параметры внутри data.query.*
    if (!qs.has("data")) {
      try {
        qs.append("data", JSON.stringify({ query: payload }));
      } catch (_) {
        // ignore serialization errors
      }
    }
    const url = `${webhook}${action}${qs.toString() ? `?${qs.toString()}` : ""}`;

    const resp = await Promise.race([
      fetch(url),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error("Превышено время ожидания")), timeout)
      )
    ]);
    if (!resp.ok) throw new Error(await resp.text());
    return await safeJson(resp);
  }

  async function safeJson(resp) {
    const target = resp?.clone ? resp.clone() : resp;
    let text;
    try {
      text = await target.text();
      if (!text) return null;
      return JSON.parse(text);
    } catch (e) {
      // Log raw payload to help debug unexpected n8n responses.
      try {
        const raw = text !== undefined ? text : await target.text?.() || "";
        console.error("Не удалось распарсить ответ n8n", raw, e);
      } catch (_) {
        console.error("Не удалось распарсить ответ n8n и прочитать тело", e);
      }
      return null;
    }
  }

  async function loadMock(action) {
    try {
      const res = await fetch(`../mock/${action}.json`);
      if (!res.ok) throw new Error(`Mock ${action} not found`);
      const data = await res.json();
      return JSON.stringify(data);
    } catch (e) {
      console.error("Mock load failed", action, e);
      return null;
    }
  }

  function normalizeWebhookMode(mode) {
    if (mode === undefined || mode === null) return "prod";
    return String(mode).trim().toLowerCase();
  }

  async function requestViaN8nOrMock(action, paramsWithToken = {}, opts = {}) {
    const route = API_ROUTES[action] || {};
    const forceN8n = opts.source === "n8n" || route.source === "n8n";
    const useMock = !forceN8n && shouldUseMock(route.source, opts.source);
    const method = (opts.method || route.method || "POST").toUpperCase();
    const mode = normalizeWebhookMode(
      opts.webhook || opts.webhookMode || opts.mode || route.webhook || "prod"
    );
    const targetAction = opts.webhookAction || route.webhookAction || action;
    // Автодобавление контекста склада/магазина для каталогов/поиска товара
    if (action === "getItemByArticleName" || action === "getHeader") {
      const storeIdFromParams = paramsWithToken.store || paramsWithToken.storeId || window?.USER_STORE?.storeId;
      const storeNameFromParams = paramsWithToken.storeName || window?.USER_STORE?.storeName;
      const storeContext = resolveStoreContext(storeIdFromParams, storeNameFromParams);
      if (storeIdFromParams) paramsWithToken.store = storeIdFromParams;
      if (storeNameFromParams) paramsWithToken.storeName = storeNameFromParams;
      if (storeContext) {
        paramsWithToken.storeName = paramsWithToken.storeName || storeContext.storeName;
        paramsWithToken.sheetName_sklad = storeContext.sheetName_sklad;
        paramsWithToken.sheetName_accounting = storeContext.sheetName_accounting;
        paramsWithToken.sklad = storeContext.sheetName_sklad;
      }
      if (action === "getItemByArticleName") {
        console.log("getItemByArticleName payload ->", paramsWithToken);
      } else if (action === "getHeader") {
        console.log("getHeader payload ->", paramsWithToken);
      }
    }

    const payload = {
      ...paramsWithToken,
      action: paramsWithToken?.action || action,
    };

    const overlayId = `n8n-${action}-${Date.now()}`;
    hidePage(overlayId);

    if (useMock) {
      const mock = await loadMock(action);
      if (mock) {
        showPage(overlayId);
        return mock;
      }
      if (route.source === "mock" || opts.source === "mock") return null;
    }

    try {
      if (method === "GET") {
        const res = await callN8nGet(targetAction, payload, opts.timeout || DEFAULT_TIMEOUT, mode);
        showPage(overlayId);
        return res;
      }
      const res = await callN8n(targetAction, payload, opts.timeout || DEFAULT_TIMEOUT, mode);
      showPage(overlayId);
      return res;
    } catch (error) {
      console.error(`Ошибка при выполнении ${action} через n8n:`, error);
      if (forceN8n) return null;
      const fallbackMock = await loadMock(action);
      showPage(overlayId);
      return fallbackMock;
    }
  }

  // Генерируем функции-заглушки для каждого маршрута
  const generatedApi = {};
  Object.keys(API_ROUTES).forEach((action) => {
    generatedApi[action] = async function(params = {}, opts = {}) {
      const paramsWithAction = { ...params, action: params.action || action };
      return requestViaN8nOrMock(action, paramsWithAction, opts);
    };
  });

  function resolveStoreContext(storeId, storeName) {
    const stores = window.STORES_CACHE || [];
    let entry = null;
    const numericId = Number(storeId);
    if (!Number.isNaN(numericId)) {
      entry = stores.find((s) => Number(s?.storeId ?? s?.id ?? s?.[0]) === numericId);
    }
    if (!entry && storeName) {
      const nameLower = String(storeName).trim().toLowerCase();
      entry = stores.find((s) => String(s?.storeName || "").trim().toLowerCase() === nameLower);
    }
    if (!entry && stores.length === 1) {
      entry = stores[0];
    }
    if (!entry) return null;
    return {
      sheetName_sklad: entry.sheetName_sklad,
      sheetName_accounting: entry.sheetName_accounting,
      storeName: entry.storeName,
      storeId: entry.storeId ?? entry.id ?? entry[0],
    };
  }

  function normalizeStoresResponse(parsed) {
    const unwrap = (val) => {
      if (val == null) return [];
      if (typeof val === "string") {
        try { return unwrap(JSON.parse(val)); } catch (_) { return []; }
      }
      if (Array.isArray(val)) {
        return val;
      }
      if (typeof val === "object") {
        if (Array.isArray(val.data)) return unwrap(val.data);
        const firstArray = Object.values(val).find(Array.isArray);
        if (firstArray) return unwrap(firstArray);
      }
      return [];
    };
    return unwrap(parsed);
  }

  async function getAuthData(params = {"token":token}, opts = {}) {
    const payload = {
      action: params.action || "getAuthData",
      token: params.token,
      login: params.login,
      store: params.store,
    };
    try {
      const data = await requestViaN8nOrMock("getAuthData", payload, opts);
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      // Поддерживаем вложенные структуры { data: { data: [...] } } и массивы
      const unwrap = (val) => {
        if (Array.isArray(val)) return val[0];
        if (val && typeof val === "object" && val.data !== undefined) return unwrap(val.data);
        return val;
      };
      return unwrap(parsed);
    } catch (error) {
      console.error("Не удалось получить токен из n8n или mock", error);
      return null;
    }
  }
  generatedApi.getAuthData = getAuthData;




  async function getStores(params = {}, opts = {}) {
    const payload = {
      action: params.action || "getStores",
      token: params.token,
      login: params.login,
      password: params.password,
      store: params.store,
    };
    try {
      // Один запрос: getStores по GET (согласно API_ROUTES)
      const method = opts.method || API_ROUTES.getStores.method || "GET";
      const data = await requestViaN8nOrMock("getStores", payload, { ...opts, method });
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      let stores = normalizeStoresResponse(parsed);

      // Фолбэк: если нормализованный ответ пуст, попробуем прямое поле data или сам parsed
      if (!Array.isArray(stores) || stores.length === 0) {
        const direct = parsed?.data?.data || parsed?.data || parsed;
        if (Array.isArray(direct)) {
          stores = direct;
        }
      }

      // Если всё ещё пусто, но в кеше уже есть магазины — отдадим кеш, чтобы не ломать логин
      if ((!stores || stores.length === 0) && Array.isArray(window.STORES_CACHE)) {
        return window.STORES_CACHE;
      }

      if (Array.isArray(stores)) {
        window.STORES_CACHE = stores;
      }
      return stores;
    } catch (error) {
      console.error("Не удалось получить токен из n8n или mock", error);
      return null;
    }
  }



  generatedApi.getStores = getStores;

  async function getItemByArticleName(params = {}, opts = {}) {
    const article =
      params.articleName ||
      params.article ||
      params.value ||
      params.name ||
      params.id;

    const storeIdFromParams = params.store || params.storeId || window?.USER_STORE?.storeId;
    const storeNameFromParams = params.storeName || window?.USER_STORE?.storeName;
    const storeContext = resolveStoreContext(storeIdFromParams, storeNameFromParams);

    const payload = {
      action: params.action || "getItemByArticleName",
      value: article,
      token: params.token,
      store: storeIdFromParams,
      storeName: storeContext?.storeName || storeNameFromParams,
      sheetName_sklad: storeContext?.sheetName_sklad,
      sheetName_accounting: storeContext?.sheetName_accounting,
      sklad: storeContext?.sheetName_sklad,
    };
    console.log("getItemByArticleName payload ->", payload);

    try {
      const data = await requestViaN8nOrMock("getItemByArticleName", payload, opts);
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed?.data || parsed;
    } catch (error) {
      console.error("Не удалось получить товар по артикулу", error);
      return null;
    }
  }
  generatedApi.getItemByArticleName = getItemByArticleName;

  async function fetchConfigFromN8n() {
    try {
      const data = await requestViaN8nOrMock("getConfig", { token: window.token, action: "getConfig" });
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const cfg = parsed?.data || parsed;
      applyConfig(cfg);
      return cfg;
    } catch (error) {
      console.error("Не удалось получить CONFIG из n8n или mock", error);
      return null;
    }
  }







  function applyConfig(cfg) {
    if (!cfg || typeof cfg !== "object") return;
    window.CONFIG = cfg;
    window.GLOBAL_EXECUTION_TESTING = cfg.GLOBAL_EXECUTION_TESTING || 0;
    if (cfg.USE_MOCK_DATA !== undefined) {
      window.USE_MOCK_DATA = cfg.USE_MOCK_DATA;
    }
  }

  async function fetchUserStoreFromToken() {
    if (!window.token) return null;
    try {
      const data = await requestViaN8nOrMock("getUserStoreByToken", { token: window.token, action: "getUserStoreByToken" });
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const normalized = Array.isArray(parsed) ? parsed[0] : parsed;
      const store = normalized?.data || normalized;
      applyUserStore(store);
      return store;
    } catch (error) {
      console.error("Не удалось получить Store по токену из n8n или mock", error);
      return null;
    }
  }

  function applyUserStore(store) {
    if (!store || typeof store !== "object") return;
    window.USER_STORE = store;
    const el = document.getElementById("store");
    if (el && store.storeName) {
      el.textContent = store.storeName;
    }
  }






  async function setToken(params = {}, opts = {}) {

    const loginpassword =
      params.login && params.password ? `${params.login}${params.password}` : params.loginpassword;
    const store = params.store;
    const actionName = params.action || "setToken";

    // Payload с раздельными полями и слитным, чтобы покрыть оба варианта
    const simplePayload = {
      action: actionName,
      login: params.login,
      password: params.password,
      store,
      storeId: store,
      loginpassword,
    };

    // Чистый набор без undefined
    const cleanPayload = Object.fromEntries(
      Object.entries(simplePayload).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );

    const parseResult = (raw) => {
      if (!raw) return null;
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const normalized = Array.isArray(parsed) ? parsed[0] : parsed;
        const result = normalized?.data || normalized;
        return Array.isArray(result) ? result[0] : result;
      } catch (e) {
        console.error("Failed to parse Auth response", raw, e);
        return null;
      }
    };

    // Только POST: n8n webhook Auth зарегистрирован под POST
    const webhookProd = getWebHook(opts.webhook || opts.mode || "prod");
    const qs = new URLSearchParams();
    Object.entries(cleanPayload).forEach(([k, v]) => qs.append(k, v));
    // n8n часто использует data.query.* — добавим
    qs.append("data", JSON.stringify({ query: cleanPayload }));
    const urlWithQuery = `${webhookProd}Auth${qs.toString() ? `?${qs.toString()}` : ""}`;

    // Основной POST с query и json body одновременно
    try {
      const resp = await fetch(urlWithQuery, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanPayload),
      });
      const text = await resp.text();
      const res = parseResult(text);
      if (res?.token) return res;
    } catch (e) {
      console.warn("Auth POST (query+json) failed", e);
    }

    // Fallback: POST form-url-encoded
    try {
      const resp = await fetch(`${webhookProd}Auth`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: qs.toString(),
      });
      const text = await resp.text();
      const res = parseResult(text);
      if (res?.token) return res;
    } catch (e) {
      console.warn("Auth POST form failed", e);
    }

    // Fallback: через основной механизм (оставляем только POST)
    try {
      const fromPost = parseResult(
        await requestViaN8nOrMock("setToken", cleanPayload, { ...opts, method: "POST" })
      );
      return fromPost?.token ? fromPost : fromPost;
    } catch (error) {
      console.error("Не удалось получить токен из n8n или mock", error);
      return null;
    }
  }

  generatedApi.setToken = setToken;










  // Экспорт в глобальную область
  window.API_ROUTES = API_ROUTES;
  window.requestViaN8nOrMock = requestViaN8nOrMock;
  window.loadMock = loadMock;
  window.fetchConfigFromN8n = fetchConfigFromN8n;
  window.applyConfig = applyConfig;
  window.fetchUserStoreFromToken = fetchUserStoreFromToken;
  window.applyUserStore = applyUserStore;
  window.API = generatedApi;
})();
