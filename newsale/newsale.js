(function() {
  const PAGE_ID = "newsale";
  const ARTICLE_INPUT_ID = "articleName";
  const NEWSALE_DRAFT_STORAGE_PREFIX = "newsaleDraft.v1";

  let productTable;
  let cartUI;
  let salesManager = null;

  // --- Amelie payment state ---
  let amelieRate = null;
  let amelieRateInterval = null;
  let amelieStatusInterval = null;
  let amelieTimerInterval = null;
  let amelieQrTimeout = null;


//print bill begin//



window.printbill = function () {
  try {
    const manager = ensureSalesManager();
    window.salesManager = manager;

    manager.updateProductData(
      productTable.rawData,
      manager.values
    );

    console.log("printbill:", manager.values);

    let request = {
      googleFuncName: "printbill",
      callbackJSfunctionName: "printbill_done",
      params: JSON.stringify(manager.values)
    };

    runGSfunction(request);
  } catch (error) {
    systemError("Error submitting sales data", error);
  }
}

window.printbill_done = function (res) {
console.log("printbill_done:", res)
showReceipt(res.html);

}
window.showReceipt = function (receiptHtml) {

    // удалить старое окно
    const old = document.getElementById("receiptModal");
    if (old) old.remove();

    const modal = document.createElement("div");
    modal.id = "receiptModal";

    modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.65);

        display: flex;
        justify-content: center;
        align-items: center;

        padding: 10px;

        box-sizing: border-box;
        z-index: 999999;
    `;

    modal.innerHTML = `
        <div
            id="receiptWindow"
            style="
                width: calc(78mm + 20px);
                max-width: calc(100vw - 20px);

                height: 90vh;
                max-height: calc(100vh - 20px);

                background: #f3f3f3;

                border-radius: 8px;

                display: flex;
                flex-direction: column;

                overflow: hidden;

                box-shadow: 0 0 30px rgba(0,0,0,.5);
            "
        >

            <!-- Панель кнопок -->
            <div style="
                padding: 8px 10px;

                background: #f3f3f3;
                border-bottom: 1px solid #ddd;

                display: flex;
                justify-content: flex-end;
                align-items: center;

                gap: 8px;

                flex: 0 0 auto;
            ">
                <button
                    id="receiptPrint"
                    type="button"
                    style="
                        cursor: pointer;
                        padding: 6px 10px;
                    "
                >
                    🖨️ Печать
                </button>

                <button
                    id="receiptClose"
                    type="button"
                    style="
                        cursor: pointer;
                        padding: 6px 10px;
                    "
                >
                    ✖ Закрыть
                </button>
            </div>


            <!-- Область просмотра чека -->
            <div style="
                flex: 1 1 auto;

                min-height: 0;

                overflow: auto;

                display: flex;
                justify-content: center;
                align-items: flex-start;

                background: #ddd;
            ">

                <iframe
                    id="receiptFrame"

                    style="
                        display: block;

                        flex: 0 0 78mm;

                        width: 78mm;
                        min-width: 78mm;
                        max-width: 78mm;

                        height: 100%;

                        margin: 0;

                        border: none;

                        background: white;
                    "
                ></iframe>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    const frame = modal.querySelector("#receiptFrame");


    // если строка пришла с \\n и экранированными символами
    try {

        receiptHtml = JSON.parse(
            '"' +
            receiptHtml
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"') +
            '"'
        );

    } catch (e) {
        // если это уже нормальный HTML,
        // оставляем его как есть
    }


    // записать HTML чека в iframe
    frame.srcdoc = receiptHtml;


    // закрытие
    modal.querySelector("#receiptClose").onclick = () => {
        modal.remove();
    };


    // печать
    modal.querySelector("#receiptPrint").onclick = () => {

        if (!frame.contentWindow) return;

        frame.contentWindow.focus();
        frame.contentWindow.print();
    };


    // закрытие по клику на затемнённый фон
    modal.onclick = (e) => {

        if (e.target === modal) {
            modal.remove();
        }
    };


    // закрытие по Escape
    const escapeHandler = (e) => {

        if (e.key === "Escape") {

            document.removeEventListener(
                "keydown",
                escapeHandler
            );

            modal.remove();
        }
    };

    document.addEventListener(
        "keydown",
        escapeHandler
    );
};

//print bill end//


  async function fetchAmelieRate() {
    const endpoint = window.CONFIG?.Amelie_Endpoint_getCurrency;
    if (!endpoint) return;

    hidePage("amelie-rate-fetch");

    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: getAmelieAuthHeaders()
      });

      const data = await res.json();

      if (typeof data.rate === "number") {
        amelieRate = data.rate;

        if (typeof window.updateSale === "function") {
          window.updateSale();
        }
      }
    } catch (e) {
      console.warn("[Amelie] getCurrency error", e);
    } finally {
      forceHideOverlay();
    }
  }

  function startAmelieRatePolling() {
    if (amelieRateInterval) return;

    const inFlow = !!(
      document.getElementById("amelie-qr-overlay") ||
      document.getElementById("amelie-confirm-overlay")
    );

    if (!inFlow && cartUI) {
      cartUI.setOrderButtonEnabled(false);
    }

    fetchAmelieRate();

    amelieRateInterval = setInterval(
      fetchAmelieRate,
      30000
    );
  }

  function stopAmelieRatePolling() {
    clearInterval(amelieRateInterval);

    amelieRateInterval = null;
    amelieRate = null;
  }

  function getAmelieAuthHeaders() {
    const raw = window.CONFIG?.Amelie_AuthHeader;

    if (!raw) return {};

    try {
      return typeof raw === "string"
        ? JSON.parse(raw)
        : raw;
    } catch (e) {
      console.warn(
        "[Amelie] failed to parse Amelie_AuthHeader",
        e
      );

      return {};
    }
  }

  function stopAmelieFlow() {
    clearInterval(amelieStatusInterval);
    clearInterval(amelieTimerInterval);
    clearTimeout(amelieQrTimeout);

    amelieStatusInterval = null;
    amelieTimerInterval = null;
    amelieQrTimeout = null;
  }

  function removeAmelieQrOverlay() {
    stopAmelieFlow();

    const overlay =
      document.getElementById("amelie-qr-overlay");

    if (overlay) {
      overlay.remove();
    }

    if (cartUI) {
      cartUI.setOrderButtonEnabled(true);
    }
  }

  function showAmelieQrOverlay(qrData, onBack) {
    removeAmelieQrOverlay();

    const overlay = document.createElement("div");
    overlay.id = "amelie-qr-overlay";

    const modal = document.createElement("div");
    modal.id = "amelie-qr-modal";

    const title = document.createElement("h3");
    title.id = "amelie-qr-title";
    title.textContent = "Awaiting RUB QR Payment";

    const amountEl = document.createElement("div");

    amountEl.style.cssText =
      "font-size:28px;" +
      "font-weight:700;" +
      "color:#1a1a1a;" +
      "margin:4px 0 2px;" +
      "letter-spacing:0.5px;";

    amountEl.textContent =
      qrData.amount
        ? `${qrData.amount} RUB`
        : "";

    const statusEl = document.createElement("div");
    statusEl.id = "amelie-qr-status";
    statusEl.textContent =
      "Created. Waiting for payment...";

    const timerEl = document.createElement("div");
    timerEl.id = "amelie-qr-timer";

    const imgEl = document.createElement("img");
    imgEl.id = "amelie-qr-image";
    imgEl.alt = "QR code";

    if (qrData.qr_image_url) {
      imgEl.src = qrData.qr_image_url;
    } else {
      imgEl.style.display = "none";
    }

    const rateInfoEl =
      document.createElement("div");

    rateInfoEl.id = "amelie-qr-rateinfo";

    rateInfoEl.style.cssText =
      "font-size:12px;" +
      "color:#888;" +
      "margin-top:6px;";

    if (amelieRate) {
      rateInfoEl.textContent =
        `Rate: 1 RUB = ${(amelieRate / 10000).toFixed(2)} VND`;
    }

    const payLinkEl = document.createElement("a");

    payLinkEl.id = "amelie-qr-paylink";
    payLinkEl.target = "_blank";
    payLinkEl.rel = "noopener noreferrer";

    if (qrData.pay_link) {
      payLinkEl.href = qrData.pay_link;
      payLinkEl.textContent =
        "Open payment link";
    } else {
      payLinkEl.style.display = "none";
    }

    const backBtn =
      document.createElement("button");

    backBtn.id = "amelie-qr-back";
    backBtn.textContent = "Cancel";

    backBtn.addEventListener(
      "click",
      () => {
        removeAmelieQrOverlay();

        if (typeof onBack === "function") {
          onBack();
        }
      }
    );

    modal.appendChild(title);
    modal.appendChild(amountEl);
    modal.appendChild(statusEl);
    modal.appendChild(imgEl);
    modal.appendChild(rateInfoEl);
    modal.appendChild(payLinkEl);
    modal.appendChild(timerEl);
    modal.appendChild(backBtn);

    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    return {
      statusEl,
      timerEl,
      backBtn
    };
  }

  async function callAmelieGenerateQr(
    amountRub,
    amountVnd
  ) {
    const endpoint =
      window.CONFIG?.Amelie_Endpoint_generateQr;

    if (!endpoint) {
      throw new Error(
        "Amelie_Endpoint_generateQr not in CONFIG"
      );
    }

    hidePage("amelie-generate-qr");

    try {
      const headers = Object.assign(
        {
          "Content-Type": "application/json"
        },
        getAmelieAuthHeaders()
      );

      const store =
        document
          .getElementById("store")
          ?.textContent
          ?.trim() ||
        cartUI?.store ||
        "";

      const body = JSON.stringify({
        amount: amountRub,
        currency: "RUBQR",
        out_amount: amountVnd,
        source: "POS",
        ...(store
          ? {
              descriptor: store
            }
          : {})
      });

      const res = await fetch(
        endpoint,
        {
          method: "POST",
          headers,
          body
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw Object.assign(
          new Error(
            data.message ||
            String(res.status)
          ),
          {
            status: res.status,
            data
          }
        );
      }

      return data;
    } finally {
      forceHideOverlay();
    }
  }

  async function callAmelieGetStatus(
    orderUuid
  ) {
    const endpoint =
      window.CONFIG?.Amelie_Endpoint_getstatus;

    if (!endpoint) {
      throw new Error(
        "Amelie_Endpoint_getstatus not in CONFIG"
      );
    }

    const url =
      `${endpoint.replace(/\/$/, "")}/${orderUuid}`;

    const headers =
      getAmelieAuthHeaders();

    const res =
      await fetch(
        url,
        {
          method: "GET",
          headers
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      throw Object.assign(
        new Error(
          data.message ||
          String(res.status)
        ),
        {
          status: res.status,
          data
        }
      );
    }

    return data;
  }

  function startStatusPolling(
    orderUuid,
    uiRefs,
    onConfirmed,
    onFailed
  ) {
    const POLL_INTERVAL_MS = 5000;

    const TIMEOUT_MS =
      15 * 60 * 1000;

    const deadline =
      Date.now() + TIMEOUT_MS;

    const TERMINAL_STATUSES = [
      "CONFIRMED",
      "DECLINED",
      "MISSMATCH"
    ];

    function updateTimer() {
      const remaining =
        Math.max(
          0,
          deadline - Date.now()
        );

      const min =
        Math.floor(
          remaining / 60000
        );

      const sec =
        Math.floor(
          (remaining % 60000) / 1000
        );

      if (uiRefs.timerEl) {
        uiRefs.timerEl.textContent =
          `Осталось: ${min}:${String(sec).padStart(2, "0")}`;
      }
    }

    updateTimer();

    amelieTimerInterval =
      setInterval(
        updateTimer,
        1000
      );

    amelieStatusInterval =
      setInterval(
        async () => {
          try {
            const data =
              await callAmelieGetStatus(
                orderUuid
              );

            const status =
              data.status;

            if (uiRefs.statusEl) {
              const statusMap = {
                CREATED:
                  "Created. Waiting for payment...",

                PROCESSING:
                  "Processing payment...",

                CONFIRMED:
                  "Payment confirmed!",

                DECLINED:
                  "Payment declined.",

                MISSMATCH:
                  "Payment processing error."
              };

              uiRefs.statusEl.textContent =
                statusMap[status] ||
                status;
            }

            if (
              TERMINAL_STATUSES.includes(
                status
              )
            ) {
              stopAmelieFlow();

              if (
                status ===
                "CONFIRMED"
              ) {
                onConfirmed(data);
              } else {
                if (
                  uiRefs.backBtn
                ) {
                  uiRefs.backBtn.style.display =
                    "";
                }

                onFailed(status);
              }
            }
          } catch (e) {
            console.warn(
              "[Amelie] getStatus error",
              e
            );
          }
        },
        POLL_INTERVAL_MS
      );

    amelieQrTimeout =
      setTimeout(
        () => {
          stopAmelieFlow();

          if (
            uiRefs.statusEl
          ) {
            uiRefs.statusEl.textContent =
              "Payment timeout.";
          }

          if (
            uiRefs.backBtn
          ) {
            uiRefs.backBtn.style.display =
              "";
          }

          onFailed("TIMEOUT");
        },
        TIMEOUT_MS
      );
  }

  function showAmelieConfirmationModal(
    statusData,
    onClose
  ) {
    removeAmelieQrOverlay();

    const overlay =
      document.createElement("div");

    overlay.id =
      "amelie-confirm-overlay";

    overlay.style.cssText =
      "position:fixed;" +
      "inset:0;" +
      "background:rgba(0,0,0,0.65);" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:center;" +
      "z-index:9999;";

    const modal =
      document.createElement("div");

    modal.style.cssText =
      "background:#fff;" +
      "border-radius:12px;" +
      "padding:28px 36px;" +
      "max-width:400px;" +
      "width:90%;" +
      "box-shadow:0 8px 32px rgba(0,0,0,0.25);";

    const checkCircle =
      document.createElement("div");

    checkCircle.style.cssText =
      "width:60px;" +
      "height:60px;" +
      "border-radius:50%;" +
      "background:#4caf50;" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:center;" +
      "margin:0 auto 12px;";

    checkCircle.innerHTML =
      '<span style="color:#fff;font-size:32px;line-height:1;">&#10003;</span>';

    const title =
      document.createElement("div");

    title.textContent =
      "Оплата подтверждена";

    title.style.cssText =
      "text-align:center;" +
      "font-size:17px;" +
      "font-weight:600;" +
      "margin-bottom:20px;";

    const now =
      new Date();

    const pad =
      (n) =>
        String(n).padStart(
          2,
          "0"
        );

    const dateStr =
      `${pad(now.getDate())}.` +
      `${pad(now.getMonth() + 1)}.` +
      `${now.getFullYear()}, ` +
      `${pad(now.getHours())}:` +
      `${pad(now.getMinutes())}:` +
      `${pad(now.getSeconds())}`;

    const outAmountNum =
      parseFloat(
        statusData.out_amount
      );

    const outAmountStr =
      Number.isFinite(
        outAmountNum
      )
        ? Math
            .round(outAmountNum)
            .toLocaleString("ru-RU")
        : String(
            statusData.out_amount ||
            ""
          );

    const isValid =
      statusData.amount_validity ===
      "VALID";

    const fields = [
      {
        label: "Дата",
        value: dateStr
      },
      {
        label: "№ чека",
        value:
          statusData.order_uuid ||
          ""
      },
      {
        label: "ИД терминала",
        value:
          statusData.pos_uuid ||
          ""
      },
      {
        label: "Корректность",
        value:
          isValid
            ? "✓"
            : "✗",
        color:
          isValid
            ? "#4caf50"
            : "#f44336"
      },
      {
        label: "Сумма",
        value:
          (statusData.amount || "") +
          " RUB"
      },
      {
        label: "Получено",
        value:
          outAmountStr +
          " VND"
      }
    ];

    const table =
      document.createElement("div");

    table.style.marginBottom =
      "20px";

    fields.forEach(
      ({
        label,
        value,
        color
      }) => {
        const row =
          document.createElement(
            "div"
          );

        row.style.cssText =
          "display:flex;" +
          "justify-content:space-between;" +
          "padding:8px 0;" +
          "border-bottom:1px solid #f0f0f0;" +
          "font-size:14px;";

        const labelEl =
          document.createElement(
            "span"
          );

        labelEl.textContent =
          label;

        labelEl.style.color =
          "#666";

        const valueEl =
          document.createElement(
            "span"
          );

        valueEl.textContent =
          value;

        valueEl.style.cssText =
          "font-weight:500;" +
          (
            color
              ? `color:${color};`
              : ""
          );

        row.appendChild(
          labelEl
        );

        row.appendChild(
          valueEl
        );

        table.appendChild(
          row
        );
      }
    );

    const closeBtn =
      document.createElement(
        "button"
      );

    closeBtn.textContent =
      "Закрыть";

    closeBtn.style.cssText =
      "width:100%;" +
      "padding:11px;" +
      "background:#4caf50;" +
      "color:#fff;" +
      "border:none;" +
      "border-radius:7px;" +
      "cursor:pointer;" +
      "font-size:15px;" +
      "font-weight:500;" +
      "margin-top:4px;";

    closeBtn.addEventListener(
      "click",
      () => {
        overlay.remove();

        if (
          typeof onClose ===
          "function"
        ) {
          onClose();
        }
      }
    );

    modal.appendChild(
      checkCircle
    );

    modal.appendChild(
      title
    );

    modal.appendChild(
      table
    );

    modal.appendChild(
      closeBtn
    );

    overlay.appendChild(
      modal
    );

    document.body.appendChild(
      overlay
    );
  }

  function focusArticleInput() {
    const el =
      document.getElementById(
        ARTICLE_INPUT_ID
      );

    if (
      el &&
      typeof el.focus ===
        "function"
    ) {
      el.focus();
    }
  }

  function ensureSalesManager() {
    if (!salesManager || !Array.isArray(salesManager.values)) {
      salesManager = new SalesManager();
    }

    window.salesManager = salesManager;
    return salesManager;
  }

  function parseNumber(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (
      typeof value === "number"
    ) {
      return Number.isFinite(value)
        ? value
        : null;
    }

    const normalized =
      String(value)
        .trim()
        .replace(/\s+/g, "")
        .replace(",", ".");

    if (!normalized) {
      return null;
    }

    const num =
      Number(normalized);

    return Number.isFinite(num)
      ? num
      : null;
  }

  function getNewsaleDraftStorage() {
    try {
      return (
        window.sessionStorage ||
        null
      );
    } catch (error) {
      console.warn(
        "newsale draft storage unavailable",
        error
      );

      return null;
    }
  }

  function getNewsaleDraftKey() {
    const envTag =
      window.location
        ?.pathname
        ?.includes("/test/")
        ? "test"
        : "prod";

    const storeTag =
      String(
        window.USER_STORE
          ?.storeId ??
        window.USER_STORE
          ?.id ??
        window.USER_STORE
          ?.store ??
        "store"
      ).trim();

    const userTag =
      String(
        window.currentLoginName ||
        window.token ||
        "anonymous"
      ).trim();

    return (
      `${NEWSALE_DRAFT_STORAGE_PREFIX}:` +
      `${envTag}:` +
      `${storeTag}:` +
      `${userTag}`
    );
  }

  function collectVisibleRowsFromTable() {
    const header =
      Array.isArray(
        productTable?.header
      )
        ? productTable.header
        : [];

    if (
      header.length === 0
    ) {
      return [];
    }

    const rows =
      document.querySelectorAll(
        "#flowTable tbody tr"
      );

    return Array
      .from(rows)
      .map(
        (row) => {
          const cells =
            row.querySelectorAll(
              "td"
            );

          const item = {};

          header.forEach(
            (
              fieldName,
              columnIndex
            ) => {
              item[fieldName] =
                (
                  cells[
                    columnIndex
                  ]
                    ?.textContent ||
                  ""
                ).trim();
            }
          );

          return item;
        }
      );
  }

  function buildMergedRawDataForDraft() {
    const visibleRows =
      collectVisibleRowsFromTable();

    const rawData =
      Array.isArray(
        productTable?.rawData
      )
        ? productTable.rawData
        : [];

    const header =
      Array.isArray(
        productTable?.header
      )
        ? productTable.header
        : [];

    // UI is the source of truth for the number/order of cart rows.
    const rowCount =
      visibleRows.length;

    const merged = [];

    const usernameEl =
      document.getElementById(
        "username"
      );

    const storeEl =
      document.getElementById(
        "store"
      );

    const username =
      String(
        cartUI?.username ||
        usernameEl?.textContent ||
        window.currentLoginName ||
        ""
      ).trim();

    const store =
      String(
        cartUI?.store ||
        storeEl?.textContent ||
        window.USER_STORE
          ?.storeName ||
        ""
      ).trim();

    for (
      let i = 0;
      i < rowCount;
      i += 1
    ) {
      const source =
        rawData[i] &&
        typeof rawData[i] ===
          "object" &&
        !Array.isArray(
          rawData[i]
        )
          ? {
              ...rawData[i]
            }
          : {};

      const visible =
        visibleRows[i] &&
        typeof visibleRows[i] ===
          "object" &&
        !Array.isArray(
          visibleRows[i]
        )
          ? visibleRows[i]
          : {};

      header.forEach(
        (fieldName) => {
          if (
            Object.prototype
              .hasOwnProperty
              .call(
                visible,
                fieldName
              )
          ) {
            source[
              fieldName
            ] =
              visible[
                fieldName
              ];
          }
        }
      );

      source.id =
        String(i);

      source.username =
        username;

      source.currency =
        cartUI?.currency ??
        source.currency ??
        "";

      source.paymentmethod =
        cartUI?.paymentmethod ??
        source.paymentmethod ??
        "";

      source.curs =
        cartUI?.curs ??
        source.curs ??
        1;

      source.store =
        store ||
        source.store ||
        "";

      if (
        source.storeId ===
          undefined ||
        source.storeId ===
          null ||
        source.storeId ===
          ""
      ) {
        source.storeId =
          window.USER_STORE
            ?.storeId ??
          window.USER_STORE
            ?.id ??
          window.USER_STORE
            ?.store ??
          "";
      }

      if (
        source.sheetName_sklad ===
          undefined ||
        source.sheetName_sklad ===
          null ||
        source.sheetName_sklad ===
          ""
      ) {
        source.sheetName_sklad =
          window.USER_STORE
            ?.sheetName_sklad ??
          "";
      }

      if (
        source.sheetName_accounting ===
          undefined ||
        source.sheetName_accounting ===
          null ||
        source.sheetName_accounting ===
          ""
      ) {
        source.sheetName_accounting =
          window.USER_STORE
            ?.sheetName_accounting ??
          "";
      }

      merged.push(source);
    }

    productTable.rawData =
      merged.map(
        (item) => ({
          ...item
        })
      );

    productTable.len =
      merged.length;

    return merged;
  }

  function clearNewsaleDraft() {
    const storage =
      getNewsaleDraftStorage();

    if (!storage) {
      return;
    }

    storage.removeItem(
      getNewsaleDraftKey()
    );
  }

  function saveNewsaleDraft() {
    if (
      !productTable ||
      !cartUI
    ) {
      return;
    }

    const storage =
      getNewsaleDraftStorage();

    if (!storage) {
      return;
    }

    const usernameEl =
      document.getElementById(
        "username"
      );

    if (usernameEl) {
      cartUI.username =
        usernameEl.textContent.trim();
    }

    const storeEl =
      document.getElementById(
        "store"
      );

    if (storeEl) {
      cartUI.store =
        storeEl.textContent.trim();
    }

    const rawData =
      buildMergedRawDataForDraft();

    if (
      rawData.length === 0
    ) {
      clearNewsaleDraft();
      return;
    }

    const draft = {
      rawData,

      cart: {
        discountGeneral:
          cartUI.discountGeneral,

        paymentmethod:
          cartUI.paymentmethod,

        currency:
          cartUI.currency,

        curs:
          cartUI.curs,

        username:
          cartUI.username,

        store:
          cartUI.store
      },

      savedAt:
        Date.now()
    };

    storage.setItem(
      getNewsaleDraftKey(),
      JSON.stringify(draft)
    );
  }

  function readNewsaleDraft() {
    const storage =
      getNewsaleDraftStorage();

    if (!storage) {
      return null;
    }

    const raw =
      storage.getItem(
        getNewsaleDraftKey()
      );

    if (!raw) {
      return null;
    }

    try {
      const parsed =
        JSON.parse(raw);

      return (
        parsed &&
        typeof parsed ===
          "object"
      )
        ? parsed
        : null;
    } catch (error) {
      console.warn(
        "newsale draft parse failed",
        error
      );

      clearNewsaleDraft();

      return null;
    }
  }

  function applyCartDraft(
    cartDraft
  ) {
    if (
      !cartDraft ||
      typeof cartDraft !==
        "object" ||
      !cartUI
    ) {
      return;
    }

    if (
      cartDraft.discountGeneral !==
        undefined &&
      cartDraft.discountGeneral !==
        null
    ) {
      const discountValue =
        String(
          cartDraft.discountGeneral
        ).trim();

      const discountInput =
        document.getElementById(
          cartUI.discountGeneralId
        );

      if (discountInput) {
        discountInput.value =
          discountValue;
      }

      cartUI.discountGeneral =
        discountValue;
    }

    if (
      typeof cartDraft.paymentmethod ===
        "string" &&
      cartDraft.paymentmethod.trim()
    ) {
      cartUI.setSelectValue(
        cartUI.paymentmethodId,
        cartDraft.paymentmethod
      );

      const paymentSelect =
        document.getElementById(
          cartUI.paymentmethodId
        );

      if (paymentSelect) {
        cartUI.paymentmethod =
          paymentSelect.value;
      }
    }

    if (
      typeof cartDraft.currency ===
        "string" &&
      cartDraft.currency.trim()
    ) {
      cartUI.setSelectValue(
        cartUI.currencyId,
        cartDraft.currency
      );

      const currencySelect =
        document.getElementById(
          cartUI.currencyId
        );

      if (currencySelect) {
        cartUI.currency =
          currencySelect.value;
      }
    }

    if (
      cartDraft.curs !==
        undefined &&
      cartDraft.curs !==
        null
    ) {
      cartUI.curs =
        cartDraft.curs;
    }

    if (
      typeof cartDraft.username ===
        "string" &&
      cartDraft.username.trim()
    ) {
      cartUI.username =
        cartDraft.username.trim();
    }

    if (
      typeof cartDraft.store ===
        "string" &&
      cartDraft.store.trim()
    ) {
      cartUI.store =
        cartDraft.store.trim();
    }
  }

  function restoreNewsaleDraft() {
    const draft =
      readNewsaleDraft();

    if (
      !draft ||
      !Array.isArray(
        draft.rawData
      ) ||
      draft.rawData.length === 0
    ) {
      return;
    }

    if (
      !Array.isArray(
        productTable?.header
      ) ||
      productTable.header.length ===
        0
    ) {
      return;
    }

    const tbody =
      productTable.tbody ||
      document.querySelector(
        "#flowTable tbody"
      );

    if (!tbody) {
      return;
    }

    tbody.innerHTML = "";

    productTable.rawData =
      [];

    productTable.len = 0;

    draft.rawData.forEach(
      (entry) => {
        if (
          !entry ||
          typeof entry !==
            "object" ||
          Array.isArray(entry)
        ) {
          return;
        }

        const index =
          productTable.len;

        const row =
          productTable.header.map(
            (fieldName) =>
              entry[
                fieldName
              ] ?? ""
          );

        productTable.createRow(
          row,
          index
        );

        productTable.rawData.push({
          ...entry,
          id: String(index)
        });

        productTable.len += 1;
      }
    );

    applyCartDraft(
      draft.cart
    );

    productTable.update();
  }

  function isSuccessfulServiceResult(
    raw,
    depth = 0
  ) {
    if (depth > 6) {
      return false;
    }

    if (raw === true) {
      return true;
    }

    if (
      raw === false ||
      raw === null ||
      raw === undefined
    ) {
      return false;
    }

    if (
      typeof raw === "number"
    ) {
      return (
        Number.isFinite(raw) &&
        raw !== 0
      );
    }

    if (
      typeof raw === "string"
    ) {
      const s =
        raw.trim();

      if (!s) {
        return false;
      }

      const lowered =
        s.toLowerCase();

      if (
        [
          "0",
          "false",
          "fail",
          "failed",
          "error"
        ].includes(
          lowered
        )
      ) {
        return false;
      }

      if (
        [
          "1",
          "true",
          "ok",
          "success"
        ].includes(
          lowered
        )
      ) {
        return true;
      }

      try {
        return (
          isSuccessfulServiceResult(
            JSON.parse(s),
            depth + 1
          )
        );
      } catch (_) {
        return true;
      }
    }

    if (
      Array.isArray(raw)
    ) {
      if (
        raw.length === 0
      ) {
        return false;
      }

      return (
        isSuccessfulServiceResult(
          raw[0],
          depth + 1
        )
      );
    }

    if (
      typeof raw === "object"
    ) {
      if (raw.error) {
        return false;
      }

      const candidates = [
        raw.success,
        raw.ok,
        raw.result,
        raw.status,
        raw.data,
        raw.response
      ].filter(
        (v) =>
          v !== undefined
      );

      for (
        const c of candidates
      ) {
        if (
          isSuccessfulServiceResult(
            c,
            depth + 1
          )
        ) {
          return true;
        }
      }

      return false;
    }

    return !!raw;
  }

  function createNewCatalogItem(
    data
  ) {
    const ok =
      productTable.createNewCatalogItem(
        data
      );

    if (ok) {
      focusArticleInput();
    }
  }

  function getHeader(data) {
    productTable.getHeader(
      data
    );
  }

  async function process_button(
    el
  ) {
    const inputEl =
      document.getElementById(
        el.name
      );

    if (!inputEl) {
      return;
    }

    const value =
      (
        inputEl.value ||
        ""
      ).trim();

    if (!value) {
      return;
    }

    productTable.addArticle(
      value
    );

    inputEl.value = "";

    focusArticleInput();
  }

  async function makeOrderRubQr() {
    updateSale();

    const mergedRawData =
      buildMergedRawDataForDraft();

    salesManager = new SalesManager();
    window.salesManager = salesManager;

    const basket =
      new Basket();

    salesManager.updateProductData(
      mergedRawData,
      salesManager.values
    );

    if (
      salesManager.values.length ===
      0
    ) {
      showErrorPopup(
        CONFIG.productlistisempty
      );

      return;
    }

    for (
      const key in cartUI
    ) {
      basket.addData(
        key,
        cartUI[key]
      );
    }

    salesManager.createBasket(
      basket
    );

    cartUI.setOrderButtonEnabled(
      false
    );

    const finalVnd =
      cartUI.finalPriceVND ||
      0;

    const rate =
      amelieRate ??
      parseNumber(
        CONFIG.currencyRUB
      ) ??
      1;

    const amountRub =
      Math.round(
        (
          finalVnd *
          10000 /
          rate
        ) *
        100
      ) /
      100;

    let qrData;

    try {
      qrData =
        await callAmelieGenerateQr(
          amountRub,
          finalVnd
        );
    } catch (e) {
      cartUI.setOrderButtonEnabled(
        true
      );

      const msg =
        e?.data?.message ||
        e.message ||
        "Ошибка создания QR-кода";

      const uiRefs =
        showAmelieQrOverlay(
          {
            qr_image_url:
              null,

            pay_link:
              null
          },
          null
        );

      if (
        uiRefs.statusEl
      ) {
        uiRefs.statusEl.textContent =
          `Ошибка: ${msg}`;
      }

      if (
        uiRefs.backBtn
      ) {
        uiRefs.backBtn.style.display =
          "";
      }

      return;
    }

    const orderUuid =
      qrData.order_uuid;

    if (!orderUuid) {
      cartUI.setOrderButtonEnabled(
        true
      );

      const errMsg =
        qrData.message ||
        qrData.error ||
        "Нет order_uuid в ответе";

      const errRefs =
        showAmelieQrOverlay(
          {
            qr_image_url:
              null,

            pay_link:
              null
          },
          null
        );

      if (
        errRefs.statusEl
      ) {
        errRefs.statusEl.textContent =
          `Ошибка: ${errMsg}`;
      }

      return;
    }

    const currentPaymentMethod =
      cartUI?.paymentmethod &&
      cartUI.paymentmethod !== "RUB_QR"
        ? cartUI.paymentmethod
        : cartUI?.lastNonRubQrPaymentMethod ||
          cartUI?.DEFAULT_PAYMENT_METHOD ||
          "Cash";

    cartUI.lastNonRubQrPaymentMethod =
      currentPaymentMethod;

    const uiRefs =
      showAmelieQrOverlay(
        qrData,
        () => {
          restoreSelects();

          cartUI.setOrderButtonEnabled(
            true
          );
        }
      );

    const pmSelect =
      document.getElementById(
        cartUI.paymentmethodId
      );

    if (pmSelect) {
      pmSelect.disabled =
        true;
    }

    const currSelect =
      document.getElementById(
        cartUI.currencyId
      );

    if (currSelect) {
      currSelect.disabled =
        true;
    }

    function restoreSelects() {
      if (pmSelect) {
        pmSelect.disabled = false;
      }

      if (currSelect) {
        currSelect.disabled = false;
      }
    }

    function submitConfirmedAmelieSale() {
      updateSale();

      const finalRawData =
        buildMergedRawDataForDraft();

      const finalManager =
        new SalesManager();

      salesManager = finalManager;
      window.salesManager = salesManager;

      finalManager.updateProductData(
        finalRawData,
        finalManager.values
      );

      finalManager.values.forEach(
        (item) => {
          item.paymentmethod =
            "RUB_QR";

          item.currency =
            "VND";

          item.curs =
            "1";

          item.finalPrice =
            item.finalPriceVND;
        }
      );

      const finalBasket =
        new Basket();

      for (
        const key in cartUI
      ) {
        finalBasket.addData(
          key,
          cartUI[key]
        );
      }

      finalManager.createBasket(
        finalBasket
      );

      cartUI.setOrderButtonEnabled(
        false
      );

      finalManager.submitSales();
    }

    startStatusPolling(
      orderUuid,
      uiRefs,

      (statusData) => {
        restoreSelects();

        showAmelieConfirmationModal(
          statusData,
          submitConfirmedAmelieSale
        );
      },

      () => {
        restoreSelects();

        cartUI.setOrderButtonEnabled(
          true
        );
      }
    );
  }

  function makeOrder() {
    if (
      cartUI.paymentmethod ===
      "RUB_QR"
    ) {
      makeOrderRubQr();
      return;
    }

    updateSale();

    const mergedRawData =
      buildMergedRawDataForDraft();

    salesManager = new SalesManager();
    window.salesManager = salesManager;

    const basket =
      new Basket();

    salesManager.updateProductData(
      mergedRawData,
      salesManager.values
    );

    if (
      salesManager.values.length >
      0
    ) {
      for (
        const key in cartUI
      ) {
        basket.addData(
          key,
          cartUI[key]
        );
      }

      salesManager.createBasket(
        basket
      );

      cartUI.setOrderButtonEnabled(
        false
      );

      salesManager.submitSales();
    } else {
      showErrorPopup(
        CONFIG.productlistisempty
      );
    }
  }

  /**
   * Контракт ответа `sendSalesToSheet` (n8n webhook `newSale`):
   * - Успех: JSON с любым из признаков успеха:
   *   { "success": true },
   *   { "ok": true },
   *   { "status": "success" },
   *   "ok".
   * - Ошибка:
   *   { "success": false, "error": "..." }
   *   или
   *   { "error": "..." }.
   */
  function sendSalesToSheet_done(
    res
  ) {
    cartUI.setOrderButtonEnabled(
      true
    );

    if (
      isSuccessfulServiceResult(
        res
      )
    ) {
      showInformationalPopup(
        CONFIG.saleregistred
      );
            printbill();
      productTable.clear();

      cartUI.clear();

      clearNewsaleDraft();

      focusArticleInput();
    } else {
      console.error(
        "sendSalesToSheet_done: unexpected response ->",
        res
      );

      const msg =
        typeof window.localizeUiText ===
          "function"
          ? window.localizeUiText(
              "ОШИБКА: Продажи не записались или записались частично",
              "ОШИБКА: Продажи не записались или записались частично"
            )
          : "ОШИБКА: Продажи не записались или записались частично";

      systemError(msg);
    }
  }

  function updateSale() {
    const totalCoastGross =
      parseNumber(
        productTable?.totalPrice
      ) ||
      0;

    const totalDiscount =
      parseNumber(
        productTable?.totalDiscount
      ) ||
      0;

    const discountGeneral =
      parseNumber(
        cartUI?.discountGeneral
      ) ||
      0;

    cartUI.totalCoastGross =
      totalCoastGross;

    cartUI.totalDiscount =
      totalDiscount;

    cartUI.totalCoastClean =
      cartUI.totalCoastGross -
      cartUI.totalDiscount;

    const finalVNDWithoutPaymentFees =
      minusPercent(
        cartUI.totalCoastClean,
        discountGeneral
      );

    cartUI.setTotalCoast(
      cartUI.totalCoastGross
    );

    cartUI.setDiscount(
      cartUI.totalCoastGross -
      finalVNDWithoutPaymentFees
    );

    let finalVND =
      finalVNDWithoutPaymentFees;

    switch (
      cartUI.paymentmethod
    ) {
      case "Cash":
        finalVND =
          plusPercent(
            finalVND,
            parseNumber(
              CONFIG.cashPercent
            ) ||
            0
          );

        break;

      case "Terminal":
        finalVND =
          plusPercent(
            finalVND,
            parseNumber(
              CONFIG.terminalPercent
            ) ||
            0
          );

        break;

      case "Transfer":
        finalVND =
          plusPercent(
            finalVND,
            parseNumber(
              CONFIG.transferPercent
            ) ||
            0
          );

        break;

      default:
        break;
    }

    const isRubQr =
      cartUI.paymentmethod ===
      "RUB_QR";

    const currencyMap = {
      VND: "",
      RUB:
        CONFIG.currencyRUB,
      KZT:
        CONFIG.currencyKZT,
      USD:
        CONFIG.currencyUSD,
      CNY:
        CONFIG.currencyCNY,
      KRW:
        CONFIG.currencyKRW
    };

    cartUI.finalPriceVND =
      finalVND;

    const inQrFlow =
      !!(
        document.getElementById(
          "amelie-qr-overlay"
        ) ||
        document.getElementById(
          "amelie-confirm-overlay"
        )
      );

    if (isRubQr) {
      cartUI.setCurrency(
        "RUB"
      );

      cartUI.setTooltipCurrency(
        ""
      );

      if (
        amelieRate ===
        null
      ) {
        const totalEl =
          document.getElementById(
            cartUI.finalTotalId
          );

        if (totalEl) {
          totalEl.textContent =
            "...";
        }

        cartUI.finalPrice =
          null;

        cartUI.curs =
          null;

        if (!inQrFlow) {
          cartUI.setOrderButtonEnabled(
            false
          );
        }
      } else {
        const exchangeRate =
          amelieRate;

        const rubAmount =
          Math.round(
            (
              finalVND *
              10000 /
              exchangeRate
            ) *
            100
          ) /
          100;

        cartUI.finalPrice =
          rubAmount;

        cartUI.curs =
          exchangeRate;

        const totalEl =
          document.getElementById(
            cartUI.finalTotalId
          );

        if (totalEl) {
          totalEl.textContent =
            rubAmount.toFixed(2);
        }

        if (!inQrFlow) {
          cartUI.setOrderButtonEnabled(
            true
          );
        }
      }
    } else {
      if (!inQrFlow) {
        cartUI.setOrderButtonEnabled(
          true
        );
      }

      const curs =
        currencyMap[
          cartUI.currency
        ];

      const parsedCurs =
        parseNumber(curs);

      const exchangeRate =
        cartUI.currency !==
          "VND" &&
        parsedCurs
          ? parsedCurs
          : 1;

      cartUI.finalPrice =
        finalVND *
        exchangeRate;

      cartUI.curs =
        exchangeRate;

      cartUI.setCurrency(
        cartUI.currency
      );

      cartUI.setTooltipCurrency(
        exchangeRate !== 1 && exchangeRate > 0
          ? (() => {
              const directAmount = exchangeRate * 1000000;
              const roundedCurrencyAmount =
                10 ** Math.max(0, Math.ceil(Math.log10(directAmount)));

              return `1 000 000 VND = ${directAmount.toLocaleString("ru-RU")} ${cartUI.currency}\n${roundedCurrencyAmount.toLocaleString("ru-RU")} ${cartUI.currency} = ${(roundedCurrencyAmount / exchangeRate).toLocaleString("ru-RU")} VND`;
            })()
          : ""
      );

      cartUI.setFinalPrice(
        cartUI.finalPrice
      );
    }

    const usernameEl =
      document.getElementById(
        "username"
      );

    if (usernameEl) {
      cartUI.username =
        usernameEl.textContent.trim();
    }

    const storeEl =
      document.getElementById(
        "store"
      );

    if (storeEl) {
      cartUI.store =
        storeEl.textContent.trim();
    }

    saveNewsaleDraft();

    if (isRubQr) {
      startAmelieRatePolling();
    } else {
      stopAmelieRatePolling();
    }
  }

  async function initNewsalePage() {
    stopAmelieRatePolling();
    stopAmelieFlow();
    salesManager = null;

    productTable =
      new SalesTableUI();

    window.productTable =
      productTable;
    window.salesManager =
      salesManager;

    window.updateSale =
      updateSale;

    const inputName =
      ARTICLE_INPUT_ID;

    const caption_h1 =
      "";

    const initValue =
      "";

    const action =
      "process_button";

    createNewInputWithButton(
      inputName,
      caption_h1,
      initValue,
      action,
      "inputForm"
    );

    const focusFieldId =
      inputName;

    const TOTALCOAST =
      0.0;

    const DISCOUNTGENERAL =
      parseNumber(
        CONFIG.discountGeneral
      ) ||
      0;

    const DELIVERYCOST =
      0;

    const FINALTOTAL =
      0;

    const DISCOUNT =
      0;

    const CURRENCY =
      CONFIG.currency;

    cartUI =
      new CartUI(
        TOTALCOAST,
        DISCOUNT,
        DISCOUNTGENERAL,
        DELIVERYCOST,
        FINALTOTAL,
        CURRENCY
      );

    window.cartUI =
      cartUI;

    await productTable.createTable();

    restoreNewsaleDraft();

    makeFocus(
      focusFieldId
    );

    window.createNewCatalogItem =
      createNewCatalogItem;

    window.getHeader =
      getHeader;

    window.process_button =
      process_button;

    window.makeOrder =
      makeOrder;

    window.sendSalesToSheet_done =
      sendSalesToSheet_done;

    window.updateSale =
      updateSale;

    window.productTable =
      productTable;

    window.cartUI =
      cartUI;
  }

  registerPageInit(
    PAGE_ID,
    initNewsalePage
  );
})();