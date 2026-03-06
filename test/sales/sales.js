



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
	          const wrap = document.createElement("div");
	          wrap.className = "table-toolbar";
	          wrap.innerHTML = `
	            <input
	              id="salesFullTextSearch"
	              type="text"
	              placeholder="Поиск по продажам..."
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



}




