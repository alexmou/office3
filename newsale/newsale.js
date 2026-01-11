(function() {
  const PAGE_ID = "newsale";

  let productTable;
  let cartUI;

  function parseNumber(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const normalized = String(value).trim().replace(/\s+/g, "").replace(",", ".");
    if (!normalized) return null;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
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
    productTable.createNewCatalogItem(data);
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

  function sendSalesToSheet_done(res) {
    if (isSuccessfulServiceResult(res)) {
      showInformationalPopup(CONFIG.saleregistred);
      productTable.clear();
      cartUI.clear();
    } else {
      console.error("sendSalesToSheet_done: unexpected response ->", res);
      systemError("ОШИБКА: Продажи не записались или записались частично");
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
      CNY: CONFIG.currencyCNY
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
	  }

  function initNewsalePage() {
    productTable = new SalesTableUI();
    const inputName = "articleName";
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

    productTable.createTable();
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
