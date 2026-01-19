(function() {
const PAGE_ID = "catalog";

registerPageInit(PAGE_ID, initCatalogPage);

async function initCatalogPage() {


  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  const INITIAL_QUERY = "All"; //{type:"someFilter"}
  const DATA_FUNCTION_NAME="getAllItemsFromCatalogByQuery"
  const FILTER_FUNCTION_NAME="getCatalogFilterOptions"
  const TABLEID="catalog-list"
		  const COLUMNS_TO_KEEP = ["article", "Brand", "Name", "price", "quantity","type", "subtype", "color", "size", "производитель", "description"];
	  const catalogData = new TableData();
	  await catalogData.initWithServerQuery(INITIAL_QUERY, DATA_FUNCTION_NAME, FILTER_FUNCTION_NAME);
	  normalizeCatalogResponse(catalogData, COLUMNS_TO_KEEP);
	  reInitFilterOptions(catalogData); // Пересоздаем filterOptions и currentQuery под новую структуру

	  function normalizeCatalogResponse(catalogData, columnsToKeep) {
	    const raw = catalogData.values;
	    if (!Array.isArray(raw) || raw.length === 0) {
	      throw new Error("Некорректные данные или пустой массив.");
	    }

	    // Новый формат: массив объектов [{...}, {...}]
	    if (raw[0] && typeof raw[0] === "object" && !Array.isArray(raw[0])) {
	      const present = new Set();
	      raw.forEach((row) => {
	        Object.keys(row || {}).forEach((k) => present.add(k));
	      });
	      // Строгое соответствие разрешенным заголовкам и порядок из columnsToKeep
	      const headers = columnsToKeep.filter((h) => present.has(h));
	      catalogData.header = headers;
	      catalogData.values = raw.map((row) => headers.map((h) => (row?.[h] ?? "")));
	      return;
	    }

	    // Старый формат: матрица [headers, visibleContext, editableContext, ...data]
	    if (!Array.isArray(raw[0])) {
	      throw new Error("Неизвестный формат данных каталога.");
	    }

	    const headersRow = raw[0];
	    const indices = columnsToKeep
	      .map((col) => headersRow.indexOf(col))
	      .filter((idx) => idx !== -1);

	    const filteredHeaders = indices.map((i) => headersRow[i]);
	    const dataStartIndex = raw.length >= 3 ? 3 : 1; // headers + 2 context rows
	    const filteredRows = raw
	      .slice(dataStartIndex)
	      .map((row) => indices.map((i) => (row && row[i] !== undefined ? row[i] : "")));

	    catalogData.header = filteredHeaders;
	    catalogData.values = filteredRows;
	  }

	  function reInitFilterOptions(catalogData) {
	    catalogData.filterOptions = catalogData.header.map((h, i) => ({header: h, index: i}));
	    catalogData.currentQuery = {};
	    catalogData.filterOptions.forEach(opt => {
	      catalogData.currentQuery[opt.header] = "All";
	    });
	  }

		  const catalogUI = new TableUI(TABLEID, catalogData);

		  // Полнотекстовый поиск (по аналогии с admin_sklad: debounce + includes по видимым полям)
		  const contentEl = document.getElementById("content");
		  const listEl = document.getElementById(TABLEID);
		  if (contentEl && listEl && !document.getElementById("catalogFullTextSearch")) {
		    const wrap = document.createElement("div");
		    wrap.className = "catalog-search";
		    wrap.innerHTML = `
		      <input
		        id="catalogFullTextSearch"
		        type="text"
		        placeholder="Поиск по каталогу..."
		        style="width: 100%; max-width: 520px; padding: 8px 10px; border: 1px solid #d0d0d0; border-radius: 8px; margin: 8px 0;"
		      />
		    `;
		    contentEl.insertBefore(wrap, listEl);

		    const input = document.getElementById("catalogFullTextSearch");
		    const deb = debounce((val) => {
		      catalogData.fullTextQuery = val;
		      catalogUI.updateTable();
		    }, 200);
		    input.addEventListener("input", (e) => deb(e.target.value));
		  }

	      
	        catalogUI.drawAll();

        const colorizeRowsOptions={
            columnName: "quantity",  // Название столбца
            value: "0", // Значение для фильтрации
            style: "background-color: #97888c66;"   // Цвет фона строки
}
catalogUI.colorizeRowsOptions=colorizeRowsOptions
catalogUI.colorizeRows();




/** 
 * Пример использования:
 * 
 * // Если данные приходят с сервера:
 * const catalogData = new CatalogData();
 * await catalogData.initWithServerQuery({type:"someFilter"}, "getDataFunction", "getFilterFunction");
 * 
 * // После загрузки данных:
 * const catalogUI = new CatalogUI("product-list", catalogData);
 * catalogUI.drawAll();
 * 
 * // Если данные уже заранее загружены:
 * const data = [
 *   ["Name", "Category", "Price"],
 *   ["Product A", "Clothes", 100],
 *   ["Product B", "Electronics", 200],
 *   ["Product C", "Clothes", 150],
 * ];
 * const catalogData2 = new CatalogData();
 * catalogData2.initWithPreloadedData(data);
 * 
 * const catalogUI2 = new CatalogUI("product-list", catalogData2);
 * catalogUI2.drawAll();
 */





}

})();




