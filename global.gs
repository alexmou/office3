var excel, configExcel, config, sales, token, username, authData, uiSales

//https://c3js.org/samples/chart_bar.html

/*
getDataFromServer(request)
    .then((data) => {
     

    })
    .catch((error) => {
        console.error("Ошибка получения даннх с сервера:", error);
    }); 

*/


 
const TESTING=0
var   SCRIPT_VERSION = "p2"; 

function clearcache() {
try{

clearCacheByVersion(SCRIPT_VERSION)

let config=new Config
 config.clearCache()
 let catalog=new Catalog
 catalog.clearCache()
 let sale=new Sales
 sale.clearCache()
  let auth=new Auth
 auth.clearCache()
  let uiSale=new UISales
  uiSale.clearCache()

 	} catch (e) {
		logError(e.message + " " + e.stack);
	}
}
var USE_DATA_CACHE = false
var USE_SCRIPT_CACHE = true; 
const SCRIPT_CACHE_TIME = 3600*6;  
const CONFIG_CACHE_TIME = 3600*6;  // 6 часов для конфигурации
const CATALOG_CACHE_TIME = 3600*6;  // 6 час для каталога
const SALES_CACHE_TIME = 3600*6;    // 1 час для продаж
const AUTH_CACHE_TIME = 3600*8;    // 4 часа для авторизации

var telegramToken = "5842986239:AAGvoRqIvlt8PGT0NpuQNLE7pGauQLT9yhU";
var telegramUrl = "https://api.telegram.org/bot" + telegramToken;
var telegramChatIds=['-4530967442'] //815603564
var enableTelegram=true

var webAppUrl="https://buttonrouge.org/store?"

var sheetID="1ukpmGUN1QGJDPfoXFlcdt-AY6ynsGD5HOMeYneagr3k";
var sheetConfig="1WCARw2suIx4oYkvFTJwXxdrRZt0QzAudFIEtkkjMs9U";
var SHEET_BUDGET_ID="1C4D4tPQ7fJDcjxQTZxt7AmwTv5MhdON5v8giZUWHLPs";
const SHEET_STATISTIC_ID="1RIpCfjXMj1PTsOW_xoRZnc9zPQeWBZQbRuNBFUBBqk4"

var errorLogSheet="errors"
var sheetName="Buy";
//var catalogSheetName="Sklad"
var configSheetName="Config (Настройки)"
var authSheetName="Authorization"
var articleFieldName="article"
var articleFieldBrand= "Brand"
var salesSheetName= "Sales"  //SalesTest
var basketSheetName="Basket"
var UI_SHEET_SALES="Sales for interface"
const SHEET_STATISTIC_CONFIG_NAME="Config"



var SALARY_SHEET_NAME="Salary"
const SALARY_PIVOT_SHEET_NAME="PivotSalary"
const INCOME_PIVOT_SHEET_NAME="PivotIncome"
//var SHEET_BUDGET_ACCOUNTING_NAME="accounting"
const SHEET_BUDGET_PNL_NAME="PNL"
const SHEET_BUDGET_VOCABULARY_NAME="vocabulary"
const STORE_SHEET_NAME="stores"
const SHEET_CASHREGISTER_NAME="cashregister"


var roles=["none","reader","editor","author","admin"]
const MENU_CONFIG_SHEET_NAME = "Menu"


    var menuItems=[]
//menuItems[0]={name:"Home", globalUrl: webAppUrl, "role":roles[3], request:'{"action":"openpage","pageName":"home","text":"Home"}'}
//menuItems[0]={pos:0, name:"newale", globalUrl: webAppUrl, "role":roles[2],  request:'{}'}
menuItems[0]={pos:0, name:"New sale", globalUrl: webAppUrl, "role":roles[2],  request:'{"action":"openpage","pageName":"newsale","text":"New sale"}'}

menuItems[1]={pos:0, name:"Barcode", globalUrl: webAppUrl, "role":roles[2],  request:'{"action":"openpage","pageName":"barcode","text":"Tag print"}'}
menuItems[2]={pos:0, name:"Catalog", globalUrl: webAppUrl, "role":roles[2],  request:'{"action":"openpage","pageName":"catalog","text":"Catalog"}'}
menuItems[3]={pos:0, name:"Sales", globalUrl: webAppUrl, "role":roles[2],  request:'{"action":"openpage","pageName":"sales","text":"Sales"}'}
menuItems[4]={pos:0, name:"Salary", globalUrl: webAppUrl, "role":roles[2],  request:'{"action":"openpage","pageName":"salary","text":"Salary"}'}
menuItems[5]={pos:0, name:"CashRegister", globalUrl: webAppUrl, "role":roles[2],  request:'{"action":"openpage","pageName":"cashregister","text":"Cash Register"}'}
menuItems[6]={pos:0, name:"Budget", globalUrl: webAppUrl, "role":roles[4],  request:'{"action":"openpage","pageName":"budget","text":"Budget"}'}
menuItems[8]={pos:0, name:"Statistic", globalUrl: webAppUrl, "role":roles[4],  request:'{"action":"openpage","pageName":"statistic","text":"Statistic"}'}
menuItems[9]={pos:0, name:"Supliers", globalUrl: webAppUrl, "role":roles[4],  request:'{"action":"openpage","pageName":"supliers","text":"Supliers"}'}
menuItems[10]={pos:0, name:"Settings", globalUrl: webAppUrl, "role":roles[4],  request:'{"action":"openpage","pageName":"settings","text":"Settings"}'}
menuItems[11]={pos:0, name:"admin_sklad", globalUrl: webAppUrl, "role":roles[4],  request:'{"action":"openpage","pageName":"admin_sklad","text":"Админка"}'}
menuItems[12]={pos:0, name:"Charts", globalUrl: webAppUrl, "role":roles[4],  request:'{"action":"openpage","pageName":"charts","text":"Charts"}'}
menuItems[13] = {
  pos: 0,
  name: "Schedule",
  globalUrl: webAppUrl,
  role: roles[2], // выбери нужную роль: editor/author/admin по твоей модели
  request: '{"action":"openpage","pageName":"schedule","text":"Schedule"}'
};



if (TESTING){
  webAppUrl=ScriptApp.getService().getUrl() + '?'
  SCRIPT_VERSION = "dev1"; 
enableTelegram=false
salesSheetName= "Sales (копия)"  //SalesTest
basketSheetName="Basket (копия)"
//catalogSheetName="Sklad (копия)"
UI_SHEET_SALES="Sales for interface (копия)"
//SHEET_BUDGET_ACCOUNTING_NAME="accounting (копия)"
USE_DATA_CACHE = false
USE_SCRIPT_CACHE = false; // Меняйте на false во время разработки
//clearVersionedCache() 
}



