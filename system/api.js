(function() {
  const DEFAULT_TIMEOUT = 80000;

  /*
    Examples from legacy mock fixtures (removed). Used as response shape reference:
    - addBudgetRecord -> true
    - addCacheRegisterRecord -> true
    - getAllItemsFromCatalogByQuery -> { data: [[ "num","article","Brand","type", ...], [ "0","1",1,0, ... ]] }
    - getAllItemsFromSalesByQuery -> { data: [] }
    - getAllSalesStatistic -> {}
    - getAuthData -> { token: "MOCK_AUTH_TOKEN", globalUrl: "https://buttonrouge.org/store/?", storeId: 1, storeName: "Mock Store", username: "mock.user" }
    - getBudget -> []
    - getBudgetRecords -> { data: [], filterOptions: [] }
    - getCash -> 0
    - getCashRegisterRecords -> { data: [], filterOptions: [] }
    - getCatalogFilterOptions -> { data: [{ header: "num", index: 0, values: ["all", "0", ...] }, ...] }
    - getConfig -> { GLOBAL_EXECUTION_TESTING: 0, Email: "l.murygin@gmail.com", currentPageName_...: "...", ... }
    - getDistinctBrandNames -> []
    - getHeader -> [[ "num","article","Brand", ...], [ "0","1",1,0, ... ]]
    - getItemByArticleName -> { data: [] }
    - getMenu -> [{ pos: 0, type: "group", text: "Operations" }, { pos: 1, type: "page", pageName: "newsale", text: "New sale" }, ...]
    - getMySalary -> {}
    - getPivot -> {}
    - getPnl -> {}
    - getSalesFilterOptions -> { data: [] }
    - getStores -> true (legacy mock fixture; real API returns array of stores)
    - getToken -> { token: "MOCK_TOKEN_LOGIN", globalUrl: "https://buttonrouge.org/store/?" }
    - getUserStoreByToken -> { row_number: 2, storeId: 1, storeName: "Boho", sheetName_sklad: "Sklad", sheetName_accounting: "accounting" }
    - getVocabulary -> []
    - setStatisticBrandName -> true
    - setToken -> { token: "MOCK_TOKEN", globalUrl: "https://buttonrouge.org/store/?" }
    - updateBudgetData -> true
  */
  // Fast n8n lookup for integration edits:
  // See system/n8n-service-workflow-map.json (service -> webhookAction -> workflow id/name/file).
  // Generated after full sync on 2026-03-09; unresolved services are tracked in system/n8n-service-workflow-map.json.
  let API_ROUTES = {
    addBudgetRecord: { source: "n8n", webhook: "prod" },

    getAllItemsFromCatalogByQuery: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "getCatalogData" },
    getAllItemsFromSalesByQuery: { source: "auto", webhook: "prod" },
    getAllSalesStatistic: { source: "auto", webhook: "prod" },
    getBudget: { source: "auto", webhook: "prod" },
    getBudgetRecords: { source: "auto", webhook: "prod" },

    getCash: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "CashRegister" },
    getCashRegisterRecords: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "CashRegister" },
    addCacheRegisterRecord: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "CashRegister" },

   // getCatalogFilterOptions: { source: "auto", webhook: "prod" },
    getConfig: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "config" },
    updateConfig: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "config", rawBody: true },
    getDistinctBrandNames: { source: "auto", webhook: "prod" },
    getHeader:  { source: "n8n", method: "GET", webhook: "prod", webhookAction: "getCatalogData" },
    getItemByArticleName: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "getCatalogData" },


    sendSalesToSheet:{ source: "n8n", method: "POST", webhook: "prod", webhookAction: "newSale" },

    getMenu: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "Menu" },
    // Localization services (n8n workflow: localization, id: fJVdhXr3rGXg0TsB, webhook: /localization)
    getLocalizationDictionary: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "localization" },
    getMySalary:{ source: "n8n", method: "GET", webhook: "prod", webhookAction: "Salary" },

        getSalaryFix:{ source: "n8n", method: "GET", webhook: "test", webhookAction: "SalaryFix" },

    getPivot: { source: "auto", webhook: "prod" },
    getPnl: { source: "auto", webhook: "prod" },
    getSalesFilterOptions: { source: "auto", webhook: "prod" },
    //getUserStoreByToken: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "stores" },
    getVocabulary:  { source: "n8n", method: "GET", webhook: "prod", webhookAction: "CashRegister" },

    // Charts services (n8n webhook: /charts)
    getStatisticData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "statistic" }, 
    getStatisticSummary: { source: "n8n", method: "GET", webhook: "test", webhookAction: "statistic" },

    //supliers
    getSuppliersData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "Suppliers" }, 
    markSupplierPaymentsDone: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "Suppliers", rawBody: true },



    // Sales services (n8n webhook: /sales)
    getSalesData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "sales" },

    // Return services (n8n webhook: /return)
    requestReturn: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "return" },
    approveReturn: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "return" },

    // Budget services (n8n webhook: /budget)
    // NOTE: backend action can be overridden via params.action (keeps API_ROUTES simple).
    getBudgetVocabulary: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "budget" },
    getBudgetData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "budget" },
    getMonthsSummary: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "budget" },
    saveBudgetChanges: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "budget", rawBody: true },

    // Tags services (n8n webhook: /tags)
    // NOTE: backend action can be overridden via params.action.
    getTagsConfig: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "tags" },
    saveTagsConfig: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "tags", rawBody: true },

    // Sklad services (n8n webhook: /Warehouse)
    getSkladHeader: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "Warehouse" },
    getSkladData: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "Warehouse" },
    // NOTE: backend action can be overridden via params.action.
    getSkladVocabulary: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "Warehouse" },
    saveSkladChanges: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "Warehouse", rawBody: true },
    deleteSkladItem: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "Warehouse", rawBody: true },
    addSkladItem: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "Warehouse", rawBody: true },
    editSkladItem: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "Warehouse", rawBody: true },

    // Schedule services (n8n webhook: /schedule)  
    getScheduleMeta: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "schedule" },
    getSchedule: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "schedule" },
    getEmployeeColorMap: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "schedule" },
    upsertShifts: { source: "n8n", method: "POST", webhook: "prod", webhookAction: "schedule"},

    // Sapo CRM integration services (n8n webhook: /sapo)
    getSapoOrders: { source: "n8n", method: "GET", webhook: "prod", webhookAction: "sapo" },


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
  let overlayRequestId = 0;

  async function callN8n(action, paramsWithToken, timeout = DEFAULT_TIMEOUT, mode, opts = {}) {
    const resp = await postDataToN8n(
      `${action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paramsWithToken),
        signal: opts.signal,
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
    contractVersion = API_CONTRACT_VERSION,
    opts = {}
  ) {
    const isV2 = Number(contractVersion) >= 2;
    const dataOnly = !!opts.dataOnly;
    const webhook = getWebHook(mode);
    const qs = new URLSearchParams();
    const payload = paramsWithToken || {};
    if (!dataOnly) {
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined) return;
        qs.append(key, typeof value === "string" ? value : JSON.stringify(value));
      });
    }
    // Legacy n8n workflows may expect parameters inside data.query.*
    if (!isV2 && (!qs.has("data") || dataOnly)) {
      try {
        if (qs.has("data")) qs.delete("data");
        qs.append("data", JSON.stringify({ query: payload }));
      } catch (_) {
        // ignore serialization errors
      }
    }
    const url = `${webhook}${action}${qs.toString() ? `?${qs.toString()}` : ""}`;

    const resp = await Promise.race([
      fetch(url, { signal: opts.signal }),
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

  function sanitizeDownloadFilename(value, fallback = "download.bin") {
    const raw = String(value || "").trim();
    const normalized = raw.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim();
    return normalized || fallback;
  }

  function extensionFromContentType(contentType) {
    const mime = String(contentType || "").split(";")[0].trim().toLowerCase();
    if (!mime) return "";
    const map = {
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
      "application/pdf": "pdf",
      "text/csv": "csv",
      "application/zip": "zip",
      "application/json": "json",
      "text/plain": "txt",
      "application/xml": "xml",
      "text/xml": "xml"
    };
    return map[mime] || "";
  }

  function applyExtensionByContentType(fileName, contentType) {
    const normalizedName = String(fileName || "").trim();
    if (!normalizedName) return normalizedName;
    const inferredExt = extensionFromContentType(contentType);
    if (!inferredExt) return normalizedName;
    const extMatch = normalizedName.match(/\.([a-z0-9]{1,8})$/i);
    if (!extMatch) return `${normalizedName}.${inferredExt}`;
    const currentExt = String(extMatch[1] || "").toLowerCase();
    if (currentExt === "bin" && inferredExt !== "bin") {
      return normalizedName.replace(/\.bin$/i, `.${inferredExt}`);
    }
    return normalizedName;
  }

  function parseFilenameFromContentDisposition(headerValue) {
    const raw = String(headerValue || "");
    if (!raw) return "";
    const utf8Match = raw.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (utf8Match && utf8Match[1]) {
      try {
        return decodeURIComponent(utf8Match[1].trim().replace(/^"|"$/g, ""));
      } catch (_) {
        return utf8Match[1].trim().replace(/^"|"$/g, "");
      }
    }
    const plainMatch = raw.match(/filename\s*=\s*([^;]+)/i);
    if (plainMatch && plainMatch[1]) {
      return plainMatch[1].trim().replace(/^"|"$/g, "");
    }
    return "";
  }

  function parseFilenameFromResponseHeaders(resp) {
    const getHeader = (name) => String(resp?.headers?.get?.(name) || "").trim();
    const byDisposition = parseFilenameFromContentDisposition(getHeader("content-disposition"));
    if (byDisposition) return byDisposition;
    const directCandidates = [
      "file-name",
      "filename",
      "x-file-name",
      "x-filename",
      "x-download-filename",
      "download-filename",
      "name"
    ];
    for (const headerName of directCandidates) {
      const value = getHeader(headerName);
      if (value) return value;
    }
    return "";
  }

  function triggerBrowserDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async function parseResponseByMode(resp, opts = {}) {
    if (opts.responseType === "blob") {
      const headerContentType = String(resp.headers?.get?.("content-type") || "").toLowerCase();
      if (headerContentType.includes("application/json")) {
        return safeJson(resp);
      }
      const blob = await resp.blob();
      const headerFileName = parseFilenameFromResponseHeaders(resp);
      const fallbackName = sanitizeDownloadFilename(opts.downloadFileName, "report.bin");
      const resolvedContentType = blob.type || resp.headers?.get?.("content-type") || "";
      const fileName = applyExtensionByContentType(headerFileName || fallbackName, resolvedContentType);
      if (!headerFileName) {
        try {
          const allHeaders = [...(resp.headers?.entries?.() || [])];
          console.warn("Binary response has no filename headers; using fallback name", allHeaders);
        } catch (_) {
          console.warn("Binary response has no filename headers; using fallback name");
        }
      }
      const shouldDownload = opts.download !== false;
      if (shouldDownload) {
        triggerBrowserDownload(blob, fileName);
      }
      return {
        ok: true,
        isBinary: true,
        downloaded: shouldDownload,
        fileName,
        contentType: resolvedContentType,
        size: blob.size
      };
    }
    return safeJson(resp);
  }

  function normalizeWebhookMode(mode) {
    if (mode === undefined || mode === null) return "prod";
    return String(mode).trim().toLowerCase();
  }

  function isEmptyServiceResponse(value) {
    return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
  }

  function createEmptyServiceError(action) {
    const error = new Error(`Сервис "${action}" вернул пустой ответ`);
    error.name = "EmptyServiceResponseError";
    error.code = "EMPTY_SERVICE_RESPONSE";
    error.service = action;
    return error;
  }

  function ensureServiceResponse(value, action) {
    if (isEmptyServiceResponse(value)) throw createEmptyServiceError(action);
    return value;
  }

  function isEmptyServiceError(error) {
    return error?.code === "EMPTY_SERVICE_RESPONSE";
  }

  async function requestViaN8nOrMock(action, paramsWithToken = {}, opts = {}) {
    const navigation = window.__NAVIGATION;
    const scope = opts.scope || (navigation?.pageId ? "page" : "global");
    opts = {
      ...opts,
      scope,
      signal: opts.signal || (scope === "page" ? navigation?.controller?.signal : undefined),
    };
    const route = API_ROUTES[action] || {};
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
        //console.log("getItemByArticleName payload ->", paramsWithToken);
      } else if (action === "getHeader") {
        //console.log("getHeader payload ->", paramsWithToken);
      } else if (action === "getAllItemsFromCatalogByQuery") {
        //console.log("getAllItemsFromCatalogByQuery payload ->", paramsWithToken);
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
      //console.log("getCash payload ->", paramsWithToken);
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
      //console.log("getCashRegisterRecords payload ->", paramsWithToken);
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
        // Для совместимости оставляем value (legacy backend использует data.value)
        paramsWithToken.username = paramsWithToken.username || resolvedUsername;
        paramsWithToken.value = paramsWithToken.value || resolvedUsername;
      }
      //console.log("getMySalary payload ->", paramsWithToken);
    }

    const includeActionInPayload = !(opts.skipAction && method === "GET");
    const basePayload = { ...paramsWithToken };
    if (!includeActionInPayload) delete basePayload.action;
    const payload = includeActionInPayload
      ? { ...basePayload, action: basePayload?.action || action }
      : basePayload;
    const actionName = payload?.action || basePayload?.action || action;
    const endpointLabel = method === "GET" ? endpoint : (isV2 ? endpoint : targetAction);
   // console.info(`[API] ${method} ${endpointLabel} action=${actionName}`);

    const overlayId = opts.overlayId || `n8n-${action}-${++overlayRequestId}`;
    hidePage(overlayId);
    const throwIfAborted = () => {
      if (opts.signal?.aborted) {
        const error = new Error("Page request belongs to an inactive navigation");
        error.name = "AbortError";
        throw error;
      }
    };

    try {
      if (method === "GET") {
        const res = await callN8nGet(
          endpoint,
          payload,
          opts.timeout || DEFAULT_TIMEOUT,
          mode,
          contractVersion,
          opts
        );
        throwIfAborted();
        showPage(overlayId);
        return ensureServiceResponse(res, action);
      }

      if (isV2) {
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
            signal: opts.signal,
          },
          opts.timeout || DEFAULT_TIMEOUT,
          mode
        );
        if (!resp.ok) throw new Error(await resp.text());
        const json = await parseResponseByMode(resp, opts);
        throwIfAborted();
        showPage(overlayId);
        return ensureServiceResponse(json, action);
      }

      // Some endpoints expect raw JSON array/object in request body (no wrapper).
      if (opts.rawBody !== undefined) {
        const hasActionQuery = String(targetAction).includes("action=");
        const rawAction = payload?.action;
        const actionSuffix =
          !hasActionQuery && rawAction
            ? `${targetAction}${String(targetAction).includes("?") ? "&" : "?"}action=${encodeURIComponent(rawAction)}`
            : targetAction;
        const resp = await postDataToN8n(
          `${actionSuffix}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(opts.rawBody),
            signal: opts.signal,
          },
          opts.timeout || DEFAULT_TIMEOUT,
          mode
        );
        if (!resp.ok) throw new Error(await resp.text());
        const json = await parseResponseByMode(resp, opts);
        throwIfAborted();
        showPage(overlayId);
        return ensureServiceResponse(json, action);
      }

      const res = await callN8n(targetAction, payload, opts.timeout || DEFAULT_TIMEOUT, mode, opts);
      throwIfAborted();
      showPage(overlayId);
      return ensureServiceResponse(res, action);
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      console.error(`Ошибка при выполнении ${action} через n8n:`, error);
      showPage(overlayId);
      if (error?.code === "EMPTY_SERVICE_RESPONSE") throw error;
      return null;
    }
  }

  async function invokeApiAction(actionName, params = {}, opts = {}) {
    const route = API_ROUTES[actionName] || {};
    const method = (opts.method || route.method || "POST").toUpperCase();

    // Raw-body routes (legacy): first argument is the JSON body as-is (array/object).
    if (route.rawBody) {
      return requestViaN8nOrMock(actionName, { action: actionName }, { ...opts, rawBody: params });
    }

    // Regular routes: params can be object or primitive (mapped to { value }).
    const baseParams =
      params && typeof params === "object" && !Array.isArray(params)
        ? params
        : params === undefined || params === null
          ? {}
          : { value: params };

    const paramsWithAction =
      method === "POST"
        ? { ...baseParams, action: actionName }
        : { ...baseParams, action: baseParams.action || actionName };
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

  function normalizeLocalizationResponse(raw) {
    let parsed = raw;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch (_) {
        return {};
      }
    }

    const candidate =
      parsed?.data?.translations ??
      parsed?.translations ??
      parsed?.data?.dictionary ??
      parsed?.dictionary ??
      parsed?.data?.items ??
      parsed?.items ??
      parsed?.data ??
      parsed;

    if (!candidate) return {};

    if (Array.isArray(candidate)) {
      const map = {};
      candidate.forEach((item) => {
        if (!item) return;
        if (Array.isArray(item) && item.length >= 2) {
          const key = String(item[0] ?? "").trim();
          if (!key) return;
          map[key] = item[1];
          return;
        }
        if (typeof item === "object") {
          const key = String(item.key ?? item.id ?? item.name ?? "").trim();
          if (!key) return;
          map[key] = item.value ?? item.text ?? item.translation ?? item.label ?? "";
        }
      });
      return map;
    }

    if (candidate && typeof candidate === "object") {
      return { ...candidate };
    }

    return {};
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
      const authPayload = unwrap(parsed);
      if (authPayload && typeof authPayload === "object") {
        window.AUTH_DATA = authPayload;
        window.__authData = authPayload;
      }
      return authPayload;
    } catch (error) {
      console.error("Не удалось получить токен из n8n", error);
      if (isEmptyServiceError(error)) throw error;
      return null;
    }
  }
  generatedApi.getAuthData = getAuthData;




  async function getStores(params = {}, opts = {}) {
    let cachedStores = null;
    try {
      const cachedRaw = window.localStorage?.getItem("stores_cache");
      if (cachedRaw) {
        const parsedCached = JSON.parse(cachedRaw);
        if (Array.isArray(parsedCached)) cachedStores = parsedCached;
      }
    } catch (e) {
      console.warn("Не удалось прочитать stores_cache из localStorage", e);
    }
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
      if ((!stores || stores.length === 0) && Array.isArray(cachedStores)) {
        return cachedStores;
      }

      if (Array.isArray(stores)) {
        window.STORES_CACHE = stores;
        try {
          window.localStorage?.setItem("stores_cache", JSON.stringify(stores));
        } catch (e) {
          console.warn("Не удалось сохранить stores_cache в localStorage", e);
        }
      }
      return stores;
    } catch (error) {
      console.error("Не удалось получить токен из n8n", error);
      if (isEmptyServiceError(error)) throw error;
      if (Array.isArray(window.STORES_CACHE) && window.STORES_CACHE.length > 0) {
        return window.STORES_CACHE;
      }
      if (Array.isArray(cachedStores) && cachedStores.length > 0) {
        return cachedStores;
      }
      return null;
    }
  }



  generatedApi.getStores = getStores;

  async function getLocalizationDictionary(params = {}, opts = {}) {
    const payload = {
      action: params.action || "getLocalizationDictionary",
      token: params.token || window.token,
      lang: params.lang || params.locale || window.APP_LANG || "en",
      scope: params.scope || "ui",
      namespace: params.namespace,
      page: params.page,
      version: params.version,
    };
    try {
      const method = opts.method || API_ROUTES.getLocalizationDictionary?.method || "GET";
      const data = await requestViaN8nOrMock("getLocalizationDictionary", payload, {
        ...opts,
        method,
        contractVersion: 2,
        skipAction: true,
      });
      return normalizeLocalizationResponse(data);
    } catch (error) {
      console.error("Не удалось получить словарь локализации из n8n", error);
      if (isEmptyServiceError(error)) throw error;
      return {};
    }
  }
  generatedApi.getLocalizationDictionary = getLocalizationDictionary;

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
    //console.log("getItemByArticleName payload ->", payload);

    try {
      const data = await requestViaN8nOrMock("getItemByArticleName", payload, opts);
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      return parsed?.data || parsed;
    } catch (error) {
      console.error("Не удалось получить товар по артикулу", error);
      if (isEmptyServiceError(error)) throw error;
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
      console.error("Не удалось получить CONFIG из n8n", error);
      if (isEmptyServiceError(error)) throw error;
      return null;
    }
  }







  function applyConfig(cfg) {
    if (!cfg || typeof cfg !== "object") return;
    window.CONFIG = cfg;
    window.GLOBAL_EXECUTION_TESTING = cfg.GLOBAL_EXECUTION_TESTING || 0;

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

  /*
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
      console.error("Не удалось получить Store по токену из n8n", error);
      return null;
    }
  }
    */

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
      const text = ensureServiceResponse(await resp.text(), "setToken");
      const res = parseResult(text);
      if (res?.token) return res;
    } catch (e) {
      console.warn("Auth POST (query+json) failed", e);
      if (isEmptyServiceError(e)) throw e;
    }

    // Fallback: POST form-url-encoded
    try {
      const resp = await fetch(`${webhookProd}Auth`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: qs.toString(),
      });
      const text = ensureServiceResponse(await resp.text(), "setToken");
      const res = parseResult(text);
      if (res?.token) return res;
    } catch (e) {
      console.warn("Auth POST form failed", e);
      if (isEmptyServiceError(e)) throw e;
    }

    // Fallback: через основной механизм (оставляем только POST)
    try {
      const fromPost = parseResult(
        await requestViaN8nOrMock("setToken", cleanPayload, { ...opts, method: "POST" })
      );
      return fromPost?.token ? fromPost : fromPost;
    } catch (error) {
      console.error("Не удалось получить токен из n8n", error);
      if (isEmptyServiceError(error)) throw error;
      return null;
    }
  }

  generatedApi.setToken = setToken;

  async function getScheduleMetaLegacy(params = {}, opts = {}) {
    const payload = { ...(params || {}) };
    payload.action = payload.action || "getScheduleMeta";
    const mode = normalizeWebhookMode(opts.webhook || opts.webhookMode || opts.mode);
    const overlayId = opts.overlayId || "schedule";
    hidePage(overlayId);
    try {
      const res = await callN8nGet(
        "schedule",
        payload,
        opts.timeout || DEFAULT_TIMEOUT,
        mode,
        1,
        { dataOnly: true }
      );
      showPage(overlayId);
      return ensureServiceResponse(res, "getScheduleMeta");
    } catch (error) {
      console.error("Ошибка при выполнении getScheduleMeta (legacy GET):", error);
      showPage(overlayId);
      if (isEmptyServiceError(error)) throw error;
      return null;
    }
  }

  generatedApi.getScheduleMeta = getScheduleMetaLegacy;

  async function getEmployeeColorMap(params = {}, opts = {}) {
    const payload = {
      action: params.action || "getEmployeeColorMap",
      visible: params.visible !== false,
      token: params.token || window.token,
      employees: Array.isArray(params.employees) ? params.employees : [],
    };

    try {
      const method = opts.method || API_ROUTES.getEmployeeColorMap?.method || "GET";
      const data = await requestViaN8nOrMock("getEmployeeColorMap", payload, { ...opts, method });
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const candidates = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.data)
          ? parsed.data
          : Array.isArray(parsed?.items)
            ? parsed.items
            : Array.isArray(parsed?.employees)
              ? parsed.employees
              : [];
      return candidates;
    } catch (error) {
      console.warn("Не удалось получить список цветов сотрудников", error);
      return [];
    }
  }

  generatedApi.getEmployeeColorMap = getEmployeeColorMap;

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
  window.fetchConfigFromN8n = fetchConfigFromN8n;
  window.applyConfig = applyConfig;
  //window.fetchUserStoreFromToken = fetchUserStoreFromToken;
  window.applyUserStore = applyUserStore;
  window.API = apiProxy;
})();
