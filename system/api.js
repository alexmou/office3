(function() {
  const DEFAULT_TIMEOUT = 80000;

  
  let API_ROUTES = {
    addBudgetRecord: { source: "n8n", webhook: "prod" },
    addCacheRegisterRecord: { source: "n8n", webhook: "prod" },
    getAllItemsFromCatalogByQuery: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "getCatalogData" },
    getAllItemsFromSalesByQuery: { source: "auto", webhook: "prod" },
    getAllSalesStatistic: { source: "auto", webhook: "prod" },
    getBudget: { source: "auto", webhook: "prod" },
    getBudgetRecords: { source: "auto", webhook: "prod" },

    getCash: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "CashRegister" },
    getCashRegisterRecords: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "CashRegister" },

    getCatalogFilterOptions: { source: "auto", webhook: "prod" },
    getConfig: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "config" },
    updateConfig: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "config?action=updateConfig", rawBody: true },
    getDistinctBrandNames: { source: "auto", webhook: "prod" },
    getHeader:  { source: "n8n", method: "GET", webhook: "prod", webhookAction: "getCatalogData" },
    getItemByArticleName: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "getCatalogData" },
    sendSalesToSheet:{ source: "n8n", method: "POST", webhook: "prod", webhookAction: "newSale" },

    getMenu: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "Menu" },
    getMySalary:{ source: "n8n", method: "GET", webhook: "prod", webhookAction: "Salary" },

        getSalaryFix:{ source: "n8n", method: "GET", webhook: "test", webhookAction: "SalaryFix" },

    getPivot: { source: "auto", webhook: "prod" },
    getPnl: { source: "auto", webhook: "prod" },
    getSalesFilterOptions: { source: "auto", webhook: "prod" },
    getUserStoreByToken: { source: "auto", webhook: "prod" },
    getVocabulary:  { source: "n8n", method: "GET", webhook: "prod", webhookAction: "CashRegister" },

    // Charts services (n8n webhook: /charts)
    getChartsData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "charts" },

    // Sales services (n8n webhook: /sales)
    getSalesData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "sales" },

    // Budget services (n8n webhook: /budget)
    // NOTE: backend action can be overridden via params.action (keeps API_ROUTES simple).
    getBudgetVocabulary: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "budget" },
    getBudgetData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "budget" },
    getMonthsSummary: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "budget" },
    saveBudgetChanges: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "budget?action=saveChanges", rawBody: true },

    // Tags services (n8n webhook: /tags)
    // NOTE: backend action can be overridden via params.action.
    getTagsConfig: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "tags" },
    saveTagsConfig: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "tags?action=saveChanges", rawBody: true },

    // Sklad services (n8n webhook: /sklad)
    getSkladHeader: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "sklad" },
    getSkladData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "sklad" },
    // NOTE: backend action can be overridden via params.action.
    getSkladVocabulary: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "sklad" },
    saveSkladChanges: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "sklad?action=saveChanges", rawBody: true },
    deleteSkladItem: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "sklad?action=deleteItem", rawBody: true },
    addSkladItem: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "sklad?action=addItem", rawBody: true },
    editSkladItem: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "sklad?action=editItem", rawBody: true },

    // Schedule services (n8n webhook: /schedule)
    getScheduleMeta: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "schedule" },
    getSchedule: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "schedule" },
    upsertShifts: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "schedule?action=upsertShifts", rawBody: true },


    setStatisticBrandName: { source: "auto", webhook: "prod" },
    setToken: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "Auth" },
    getToken: { source: "n8n", method: "GET", webhook: "prod" },
    updateBudgetData: { source: "auto", webhook: "prod" },
    getStores: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "stores" },
    getAuthData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "Auth" },


  };

  // API contract version:
  // 1 = legacy (GET uses `data={"query":...}` wrapper; some POST routes may still rely on raw body/query-action)
  // 2 = universal (GET uses plain query params; POST uses `{ action, token, payload }` envelope; no rawBody)
  let API_CONTRACT_VERSION = 1;

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

  async function callN8nGet(
    action,
    paramsWithToken,
    timeout = DEFAULT_TIMEOUT,
    mode,
    contractVersion = API_CONTRACT_VERSION
  ) {
    const isV2 = Number(contractVersion) >= 2;
    const webhook = getWebHook(mode);
    const qs = new URLSearchParams();
    const payload = paramsWithToken || {};
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined) return;
      qs.append(key, typeof value === "string" ? value : JSON.stringify(value));
    });
    // Legacy n8n workflows may expect parameters inside data.query.*
    if (!isV2 && !qs.has("data")) {
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
    const contractVersion = Number(opts.contractVersion ?? API_CONTRACT_VERSION);
    const isV2 = contractVersion >= 2;
    const endpoint = isV2 ? String(targetAction).split("?")[0] : targetAction;
    // Автодобавление контекста склада/магазина для каталогов/поиска товара
    if (action === "getItemByArticleName" || action === "getHeader" || action === "getAllItemsFromCatalogByQuery") {
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
      } else if (action === "getAllItemsFromCatalogByQuery") {
        console.log("getAllItemsFromCatalogByQuery payload ->", paramsWithToken);
      }
    }

    // Автодобавление sheetName_accounting для Cash (нужен лист accounting)
    if (action === "getCash") {
      const storeIdFromParams = paramsWithToken.store || paramsWithToken.storeId || window?.USER_STORE?.storeId;
      const storeNameFromParams = paramsWithToken.storeName || window?.USER_STORE?.storeName;
      const storeContext = resolveStoreContext(storeIdFromParams, storeNameFromParams);
      if (storeIdFromParams) {
        paramsWithToken.store = storeIdFromParams;
        paramsWithToken.storeId = paramsWithToken.storeId || storeIdFromParams;
      }
      if (storeNameFromParams) paramsWithToken.storeName = storeNameFromParams;
      if (storeContext) {
        paramsWithToken.storeName = paramsWithToken.storeName || storeContext.storeName;
        paramsWithToken.storeId = paramsWithToken.storeId || storeContext.storeId;
        paramsWithToken.sheetName_accounting =
          paramsWithToken.sheetName_accounting || storeContext.sheetName_accounting;
        // alias, если workflow ждёт другое имя
        paramsWithToken.accounting = paramsWithToken.accounting || storeContext.sheetName_accounting;
      }
      console.log("getCash payload ->", paramsWithToken);
    }

    // Автодобавление sheetName_accounting для Cash Register Records (нужен лист accounting)
    if (action === "getCashRegisterRecords") {
      const storeIdFromParams = paramsWithToken.store || paramsWithToken.storeId || window?.USER_STORE?.storeId;
      const storeNameFromParams = paramsWithToken.storeName || window?.USER_STORE?.storeName;
      const storeContext = resolveStoreContext(storeIdFromParams, storeNameFromParams);
      if (storeIdFromParams) {
        paramsWithToken.store = storeIdFromParams;
        paramsWithToken.storeId = paramsWithToken.storeId || storeIdFromParams;
      }
      if (storeNameFromParams) paramsWithToken.storeName = storeNameFromParams;
      if (storeContext) {
        paramsWithToken.storeName = paramsWithToken.storeName || storeContext.storeName;
        paramsWithToken.storeId = paramsWithToken.storeId || storeContext.storeId;
        paramsWithToken.sheetName_accounting =
          paramsWithToken.sheetName_accounting || storeContext.sheetName_accounting;
        // alias, если workflow ждёт другое имя
        paramsWithToken.accounting = paramsWithToken.accounting || storeContext.sheetName_accounting;
      }
      console.log("getCashRegisterRecords payload ->", paramsWithToken);
    }

    // Автодобавление username для Salary (нужен в n8n как $json.query.username)
    if (action === "getMySalary") {
      const usernameFromParams =
        paramsWithToken.username ||
        paramsWithToken.user ||
        paramsWithToken.login ||
        paramsWithToken.email;
      const usernameFromDom = document.getElementById("username")?.textContent;
      const usernameFromGlobal = window.currentLoginName || window.username;
      const resolvedUsername = String(usernameFromParams || usernameFromDom || usernameFromGlobal || "").trim();
      if (resolvedUsername) {
        // Для совместимости оставляем value (в Apps Script getMySalary использует data.value)
        paramsWithToken.username = paramsWithToken.username || resolvedUsername;
        paramsWithToken.value = paramsWithToken.value || resolvedUsername;
      }
      console.log("getMySalary payload ->", paramsWithToken);
    }

    const payload = {
      ...paramsWithToken,
      action: paramsWithToken?.action || action,
    };

    const overlayId = opts.overlayId || `n8n-${action}-${Date.now()}`;
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
        const res = await callN8nGet(
          endpoint,
          payload,
          opts.timeout || DEFAULT_TIMEOUT,
          mode,
          contractVersion
        );
        showPage(overlayId);
        return res;
      }

      if (isV2) {
        const actionName = payload?.action || action;
        const token = payload?.token || window.token;
        let payloadData;
        if (opts.rawBody !== undefined) {
          payloadData = opts.rawBody;
        } else {
          payloadData = { ...payload };
          delete payloadData.action;
          delete payloadData.token;
        }
        const body = { action: actionName, token, payload: payloadData };
        const resp = await postDataToN8n(
          `${endpoint}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
          opts.timeout || DEFAULT_TIMEOUT,
          mode
        );
        if (!resp.ok) throw new Error(await resp.text());
        const json = await safeJson(resp);
        showPage(overlayId);
        return json;
      }

      // Some endpoints expect raw JSON array/object in request body (no wrapper).
      if (opts.rawBody !== undefined) {
        const resp = await postDataToN8n(
          `${targetAction}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(opts.rawBody),
          },
          opts.timeout || DEFAULT_TIMEOUT,
          mode
        );
        if (!resp.ok) throw new Error(await resp.text());
        const json = await safeJson(resp);
        showPage(overlayId);
        return json;
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

  async function invokeApiAction(actionName, params = {}, opts = {}) {
    const route = API_ROUTES[actionName] || {};

    // Raw-body routes (legacy): first argument is the JSON body as-is (array/object).
    if (route.rawBody) {
      const actionValue =
        (params && typeof params === "object" && !Array.isArray(params) ? params.action : undefined) ||
        actionName;
      return requestViaN8nOrMock(actionName, { action: actionValue }, { ...opts, rawBody: params });
    }

    // Regular routes: params can be object or primitive (mapped to { value }).
    const baseParams =
      params && typeof params === "object" && !Array.isArray(params)
        ? params
        : params === undefined || params === null
          ? {}
          : { value: params };

    const paramsWithAction = { ...baseParams, action: baseParams.action || actionName };
    return requestViaN8nOrMock(actionName, paramsWithAction, opts);
  }

  // Generated API (known routes) + Proxy fallback (unknown routes).
  const generatedApi = {};
  Object.keys(API_ROUTES).forEach((action) => {
    generatedApi[action] = (params = {}, opts = {}) => invokeApiAction(action, params, opts);
  });
  generatedApi.call = (action, params = {}, opts = {}) => invokeApiAction(action, params, opts);
  generatedApi.getRoutes = () => API_ROUTES;
  generatedApi.setRoutes = (routes) => {
    if (!routes || typeof routes !== "object" || Array.isArray(routes)) return;
    API_ROUTES = { ...API_ROUTES, ...routes };
    window.API_ROUTES = API_ROUTES;
  };
  generatedApi.getContractVersion = () => API_CONTRACT_VERSION;
  generatedApi.setContractVersion = (v) => {
    const parsed = Number(v);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    API_CONTRACT_VERSION = parsed;
    window.API_CONTRACT_VERSION = API_CONTRACT_VERSION;
  };

  const apiProxy = new Proxy(generatedApi, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop !== "string") return undefined;
      return (params = {}, opts = {}) => invokeApiAction(prop, params, opts);
    },
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

  async function getAuthData(params = {}, opts = {}) {
    const payload = {
      action: params.action || "getAuthData",
      token: params.token || window.token,
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

    // Contract version (1 = legacy, 2 = universal)
    const cfgContract =
      cfg.API_CONTRACT_VERSION ??
      cfg.API_CONTRACT ??
      cfg.API_VERSION ??
      cfg.apiContractVersion ??
      cfg.apiContract ??
      cfg.apiVersion;
    const parsedContract = Number(cfgContract);
    if (Number.isFinite(parsedContract) && parsedContract > 0) {
      API_CONTRACT_VERSION = parsedContract;
    }
    window.API_CONTRACT_VERSION = API_CONTRACT_VERSION;

    // Routes can be provided by backend config (e.g. as JSON in Google Sheets).
    const cfgRoutes =
      cfg.API_ROUTES ??
      cfg.apiRoutes ??
      cfg.api_routes ??
      cfg.ApiRoutes ??
      cfg.Api_Routes;
    if (cfgRoutes) {
      try {
        const parsed =
          typeof cfgRoutes === "string" ? JSON.parse(cfgRoutes) : cfgRoutes;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          API_ROUTES = { ...API_ROUTES, ...parsed };
          window.API_ROUTES = API_ROUTES;
        }
      } catch (e) {
        console.warn("CONFIG.API_ROUTES parse failed", e);
      }
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
    const actionValue = params.action || "setToken";

    // Payload с раздельными полями и слитным, чтобы покрыть оба варианта
    const simplePayload = {
      action: actionValue,
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

  async function upsertShifts(rows = [], opts = {}) {
    const normalizedRows = Array.isArray(rows) ? rows : [rows];
    return requestViaN8nOrMock(
      "upsertShifts",
      { action: "upsertShifts" },
      { ...opts, rawBody: normalizedRows, overlayId: opts.overlayId || "schedule" }
    );
  }

  generatedApi.upsertShifts = upsertShifts;
  // Backward-compatible alias (old name used by schedule page)
  generatedApi.upsertScheduleShifts = upsertShifts;










  // Экспорт в глобальную область
  window.API_ROUTES = API_ROUTES;
  window.API_CONTRACT_VERSION = API_CONTRACT_VERSION;
  window.requestViaN8nOrMock = requestViaN8nOrMock;
  window.loadMock = loadMock;
  window.fetchConfigFromN8n = fetchConfigFromN8n;
  window.applyConfig = applyConfig;
  window.fetchUserStoreFromToken = fetchUserStoreFromToken;
  window.applyUserStore = applyUserStore;
  window.API = apiProxy;
})();
