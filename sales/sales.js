



//var productTable 

registerPageInit("sales", initSalesPage);

async function initSalesPage() {

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

   const query = { action: "getSalesData", visible: true };

const params = {
    data: { query: query }
};

        const data = await getDataFromN8n('sales', params);
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



        const catalogUI = new TableUI(TABLEID, catalogData);
        catalogUI.drawAll(); 



}








