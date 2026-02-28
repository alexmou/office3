



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
    //   console.log('Ответ GET:', data[0]);

  //  catalogData.values =  data[0].values
   //     catalogData.header =  data[0].header

   catalogData.initWithPreloadedData(data[0].values, data[0].header, data[0].filterOptions) 
 

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





