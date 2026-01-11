/*
function onExcelEdit(e){
  try{
 var activeSheet = e.source.getActiveSheet();
 if (activeSheet.getName() == catalogSheetName) {
      let catalog=new Catalog
    catalog.clearCache()

   // logError("очистили кэш для каталога "+ activeSheet.getName() );


}else if(activeSheet.getName() == salesSheetName) {
    let sale=new Sales
    sale.clearCache()
    let uiSale=new UISales
    uiSale.clearCache()

}else if(activeSheet.getName() == configSheetName) {
    let conf=new Config
    conf.clearCache()
}
    } catch (e) {
        logError(e.message + " " + e.stack);
    }
}






function createSpreadsheetOpenTrigger() {
  const ss = SpreadsheetApp.openById(sheetConfig)
  ScriptApp.newTrigger('myFunction')
      .forSpreadsheet(ss)
      .onOpen()
      .create();
}

*/
