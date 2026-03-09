(function() {
  const PAGE_ID = "newsale";
  const ARTICLE_INPUT_ID = "articleName";
  const NEWSALE_DRAFT_STORAGE_PREFIX = "newsaleDraft.v1";

  let productTable;
  let cartUI;

  function focusArticleInput() {
    const el = document.getElementById(ARTICLE_INPUT_ID);
    if (el && typeof el.focus === "function") el.focus();
  }

  function parseNumber(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const normalized = String(value).trim().replace(/\s+/g, "").replace(",", ".");
    if (!normalized) return null;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }

  function getNewsaleDraftStorage() {
    try {
      return window.sessionStorage || null;
    } catch (error) {
      console.warn("newsale draft storage unavailable", error);
      return null;
    }
  }

  function getNewsaleDraftKey() {
    const envTag = window.location?.pathname?.includes("/test/") ? "test" : "prod";
    const storeTag = String(
      window.USER_STORE?.storeId ?? window.USER_STORE?.id ?? window.USER_STORE?.store ?? "store"
    ).trim();
    const userTag = String(window.currentLoginName || window.token || "anonymous").trim();
    return `${NEWSALE_DRAFT_STORAGE_PREFIX}:${envTag}:${storeTag}:${userTag}`;
  }

  function collectVisibleRowsFromTable() {
    const header = Array.isArray(productTable?.header) ? productTable.header : [];
    if (header.length === 0) return [];

    const rows = document.querySelectorAll("#flowTable tbody tr");
    return Array.from(rows).map((row) => {
      const cells = row.querySelectorAll("td");
      const item = {};
      header.forEach((fieldName, columnIndex) => {
        item[fieldName] = (cells[columnIndex]?.textContent || "").trim();
      });
      return item;
    });
  }

  function buildMergedRawDataForDraft() {
    const visibleRows = collectVisibleRowsFromTable();
    const rawData = Array.isArray(productTable?.rawData) ? productTable.rawData : [];
    const maxLen = Math.max(rawData.length, visibleRows.length);
    const merged = [];

    for (let i = 0; i < maxLen; i += 1) {
      const base =
        rawData[i] && typeof rawData[i] === "object" && !Array.isArray(rawData[i])
          ? { ...rawData[i] }
          : {};
      if (visibleRows[i]) Object.assign(base, visibleRows[i]);
      base.id = String(i);
      merged.push(base);
    }
    return merged;
  }

  function clearNewsaleDraft() {
    const storage = getNewsaleDraftStorage();
    if (!storage) return;
    storage.removeItem(getNewsaleDraftKey());
  }

  function saveNewsaleDraft() {
    if (!productTable || !cartUI) return;
    const storage = getNewsaleDraftStorage();
    if (!storage) return;

    const rawData = buildMergedRawDataForDraft();
    if (rawData.length === 0) {
      clearNewsaleDraft();
      return;
    }

    const draft = {
      rawData,
      cart: {
        discountGeneral: cartUI.discountGeneral,
        paymentmethod: cartUI.paymentmethod,
        currency: cartUI.currency,
      },
      savedAt: Date.now(),
    };
    storage.setItem(getNewsaleDraftKey(), JSON.stringify(draft));
  }

  function readNewsaleDraft() {
    const storage = getNewsaleDraftStorage();
    if (!storage) return null;

    const raw = storage.getItem(getNewsaleDraftKey());
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      console.warn("newsale draft parse failed", error);
      clearNewsaleDraft();
      return null;
    }
  }

  function applyCartDraft(cartDraft) {
    if (!cartDraft || typeof cartDraft !== "object" || !cartUI) return;

    if (cartDraft.discountGeneral !== undefined && cartDraft.discountGeneral !== null) {
      const discountValue = String(cartDraft.discountGeneral).trim();
      const discountInput = document.getElementById(cartUI.discountGeneralId);
      if (discountInput) discountInput.value = discountValue;
      cartUI.discountGeneral = discountValue;
    }

    if (typeof cartDraft.paymentmethod === "string" && cartDraft.paymentmethod.trim()) {
      cartUI.setSelectValue(cartUI.paymentmethodId, cartDraft.paymentmethod);
      const paymentSelect = document.getElementById(cartUI.paymentmethodId);
      if (paymentSelect) cartUI.paymentmethod = paymentSelect.value;
    }

    if (typeof cartDraft.currency === "string" && cartDraft.currency.trim()) {
      cartUI.setSelectValue(cartUI.currencyId, cartDraft.currency);
      const currencySelect = document.getElementById(cartUI.currencyId);
      if (currencySelect) cartUI.currency = currencySelect.value;
    }
  }

  function restoreNewsaleDraft() {
    const draft = readNewsaleDraft();
    if (!draft || !Array.isArray(draft.rawData) || draft.rawData.length === 0) return;
    if (!Array.isArray(productTable?.header) || productTable.header.length === 0) return;

    const tbody = productTable.tbody || document.querySelector("#flowTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    productTable.rawData = [];
    productTable.len = 0;

    draft.rawData.forEach((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return;
      const index = productTable.len;
      const row = productTable.header.map((fieldName) => entry[fieldName] ?? "");
      productTable.createRow(row, index);
      productTable.rawData.push({ ...entry, id: String(index) });
      productTable.len += 1;
    });

    applyCartDraft(draft.cart);
    productTable.update();
  }

  function isSuccessfulServiceResult(raw, depth = 0) {
    if (depth > 6) return false;
    if (raw === true) return true;
    if (raw === false || raw === null || raw === undefined) return false;

    if (typeof raw === "number") return Number.isFinite(raw) && raw !== 0;
    if (typeof raw === "string") {
      const s = raw.trim();
      if (!s) return false;
      const lowered = s.toLowerCase();
      if (["0", "false", "fail", "failed", "error"].includes(lowered)) return false;
      if (["1", "true", "ok", "success"].includes(lowered)) return true;
      try {
        return isSuccessfulServiceResult(JSON.parse(s), depth + 1);
      } catch (_) {
        return true; // неизвестная непустая строка — считаем успехом для совместимости
      }
    }

    if (Array.isArray(raw)) {
      if (raw.length === 0) return false;
      return isSuccessfulServiceResult(raw[0], depth + 1);
    }

    if (typeof raw === "object") {
      if (raw.error) return false;
      const candidates = [
        raw.success,
        raw.ok,
        raw.result,
        raw.status,
        raw.data,
        raw.response,
      ].filter((v) => v !== undefined);

      for (const c of candidates) {
        if (isSuccessfulServiceResult(c, depth + 1)) return true;
      }
      return false;
    }

    return !!raw;
  }

  function createNewCatalogItem(data) {
    const ok = productTable.createNewCatalogItem(data);
    if (ok) focusArticleInput();
  }

  function getHeader(data) {
    productTable.getHeader(data);
  }

  async function process_button(el) {
    const inputEl = document.getElementById(el.name);
    if (!inputEl) return;
    const value = (inputEl.value || "").trim();
    if (!value) return;
    productTable.addArticle(value);
    inputEl.value = "";
    focusArticleInput();
  }

  function makeOrder() {
    const salesManager = new SalesManager();
    const basket = new Basket();
    salesManager.updateProductData(productTable.rawData, salesManager.values); // обогащаем данные из UI
    if (salesManager.values.length > 0) {
      for (const key in cartUI) {
        basket.addData(key, cartUI[key]);
      }
      salesManager.createBasket(basket);
      salesManager.submitSales();
    } else {
      showErrorPopup(CONFIG.productlistisempty);
    }
  }

  /**
   * Контракт ответа `sendSalesToSheet` (n8n webhook `newSale`):
   * - Успех: JSON с любым из признаков успеха: `{ "success": true }`, `{ "ok": true }`, `{ "status": "success" }`, `"ok"`.
   * - Ошибка: JSON с ошибкой: `{ "success": false, "error": "..." }` или `{ "error": "..." }` (или любая "ложная" строка типа `"error"`/`"failed"`).
   */
  function sendSalesToSheet_done(res) {
    if (isSuccessfulServiceResult(res)) {
      showInformationalPopup(CONFIG.saleregistred);
      productTable.clear();
      cartUI.clear();
      clearNewsaleDraft();
      focusArticleInput();
    } else {
      console.error("sendSalesToSheet_done: unexpected response ->", res);
      const msg =
        typeof window.localizeUiText === "function"
          ? window.localizeUiText("ОШИБКА: Продажи не записались или записались частично", "ОШИБКА: Продажи не записались или записались частично")
          : "ОШИБКА: Продажи не записались или записались частично";
      systemError(msg);
    }
  }

  function updateSale() {
    const totalCoastGross = parseNumber(productTable?.totalPrice) || 0;
    const totalDiscount = parseNumber(productTable?.totalDiscount) || 0;
    const discountGeneral = parseNumber(cartUI?.discountGeneral) || 0;

    cartUI.totalCoastGross = totalCoastGross;
    cartUI.totalDiscount = totalDiscount;

    cartUI.totalCoastClean = cartUI.totalCoastGross - cartUI.totalDiscount;
    const finalVNDWithoutPaymentFees = minusPercent(cartUI.totalCoastClean, discountGeneral);
    cartUI.setTotalCoast(cartUI.totalCoastGross);
    cartUI.setDiscount(cartUI.totalCoastGross - finalVNDWithoutPaymentFees);

    let finalVND = finalVNDWithoutPaymentFees;

    switch (cartUI.paymentmethod) {
      case "Cash":
        finalVND = plusPercent(finalVND, parseNumber(CONFIG.cashPercent) || 0);
        break;
      case "Terminal":
        finalVND = plusPercent(finalVND, parseNumber(CONFIG.terminalPercent) || 0);
        break;
      case "Transfer":
        finalVND = plusPercent(finalVND, parseNumber(CONFIG.transferPercent) || 0);
        break;
      default:
        break;
    }

    const currencyMap = {
      VND: "",
      RUB: CONFIG.currencyRUB,
      KZT: CONFIG.currencyKZT,
      USD: CONFIG.currencyUSD,
      CNY: CONFIG.currencyCNY,
      KRW: CONFIG.currencyKRW
    };

	    const curs = currencyMap[cartUI.currency];
	    const parsedCurs = parseNumber(curs);

	    cartUI.finalPriceVND = finalVND;
	    const exchangeRate = cartUI.currency !== "VND" && parsedCurs ? parsedCurs : 1;
	    cartUI.finalPrice = finalVND * exchangeRate;
	    cartUI.curs = exchangeRate;
	    cartUI.setCurrency(cartUI.currency);
	    cartUI.setTooltipCurrency(exchangeRate !== 1 ? curs : "");
	    cartUI.setFinalPrice(cartUI.finalPrice);
	    const usernameEl = document.getElementById("username");
	    if (usernameEl) cartUI.username = usernameEl.textContent;
	    const storeEl = document.getElementById("store");
	    if (storeEl) cartUI.store = storeEl.textContent;
      saveNewsaleDraft();
	  }

  async function initNewsalePage() {
    productTable = new SalesTableUI();
    // Legacy newsales_classes.js relies on global productTable/cartUI during async header load.
    window.productTable = productTable;
    // CartUI.update() resolves updateSale as a global function.
    window.updateSale = updateSale;
    const inputName = ARTICLE_INPUT_ID;
    const caption_h1 = "";
    const initValue = "";
    const action = "process_button";
    createNewInputWithButton(inputName, caption_h1, initValue, action, "inputForm");
    const focusFieldId = inputName;

    const TOTALCOAST = 0.0;
    const DISCOUNTGENERAL = parseNumber(CONFIG.discountGeneral) || 0;
    const DELIVERYCOST = 0;
    const FINALTOTAL = 0;
    const DISCOUNT = 0;
    const CURRENCY = CONFIG.currency;

    cartUI = new CartUI(
      TOTALCOAST,
      DISCOUNT,
      DISCOUNTGENERAL,
      DELIVERYCOST,
      FINALTOTAL,
      CURRENCY
    );
    window.cartUI = cartUI;

    await productTable.createTable();
    restoreNewsaleDraft();
    makeFocus(focusFieldId);

    // Экспорт в глобальную область
    window.createNewCatalogItem = createNewCatalogItem;
    window.getHeader = getHeader;
    window.process_button = process_button;
    window.makeOrder = makeOrder;
    window.sendSalesToSheet_done = sendSalesToSheet_done;
    window.updateSale = updateSale;
    window.productTable = productTable;
    window.cartUI = cartUI;
  }

  registerPageInit(PAGE_ID, initNewsalePage);
})();
