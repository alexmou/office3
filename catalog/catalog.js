(function() {
const PAGE_ID = "catalog";

registerPageInit(PAGE_ID, initCatalogPage);

async function initCatalogPage() {

	var inputName = "articleName";
	var caption_h1 = "";
	var initValue = "BUTTON ROUGE" 
	var action = "process_button";
	//var addArticle = createNewInputWithButton(inputName, caption_h1, initValue, action, "inputForm");
	const focusFieldId = inputName

	const TOTALCOAST = 0.0;
	const DISCOUNTGENERAL = CONFIG.discountGeneral;
	const DELIVERYCOST = 0;
	const FINALTOTAL = 0;
	const DISCOUNT = 0;
	const CURRENCY = CONFIG.currency;


  const INITIAL_QUERY = "All"; //{type:"someFilter"}
  const DATA_FUNCTION_NAME="getAllItemsFromCatalogByQuery"
  const FILTER_FUNCTION_NAME="getCatalogFilterOptions"
  const TABLEID="catalog-list"
  const COLUMNS_TO_KEEP = ["article", "Brand", "Name", "price", "quantity","type", "subtype", "color", "size", "производитель", "description"];
  const catalogData = new TableData();
  await catalogData.initWithServerQuery(INITIAL_QUERY, DATA_FUNCTION_NAME, FILTER_FUNCTION_NAME);

       
filterCatalogDataByColumns(catalogData, COLUMNS_TO_KEEP)
reInitFilterOptions(catalogData); // Пересоздаем filterOptions и currentQuery под новую структуру

function filterCatalogDataByColumns(catalogData, columnsToKeep) {
  const data = catalogData.values;
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Некорректные данные или пустой массив.");
  }
  const headers = data[0];
  const indices = columnsToKeep.map(col => headers.indexOf(col)).filter(index => index !== -1);
  const filteredData = data.map(row => indices.map(i => row[i]));
  catalogData.values = filteredData;
  catalogData.header = filteredData[0]; // Первая строка теперь обновлённый заголовок
}

function reInitFilterOptions(catalogData) {
     catalogData.filterOptions = catalogData.header.map((h, i) => ({header: h, index: i}));
    catalogData.currentQuery = {};
    catalogData.filterOptions.forEach(opt => {
        catalogData.currentQuery[opt.header] = "All";
    });
}

        catalogData.values=catalogData.values.slice(2)
        const catalogUI = new TableUI(TABLEID, catalogData);

      
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






