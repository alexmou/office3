












function getMyPivot(token) {
    try {
			username = getUserNameByToken(token)
    //  logError(username)
         var pivot =  new Pivot();
           return pivot.getValues(username); 
     } catch (e) {
        logError(e.message + " " + e.stack);
    }
}


function getPivot() {
    try {
         var pivot =  new Pivot();
         //Logger.log(pivot.getValues() )
            return pivot.getValues() 
     } catch (e) {
        logError(e.message + " " + e.stack);
    }
}

class Pivot {
  constructor() {
			excel = new Excel
  }

getValues(employeeName){
    try {
      if(employeeName){
        this.employeeName=employeeName
       //  var income =  new Income();
        var res=  this.arranged; 
        return res[employeeName]

      }else{
      const catalog=new Catalog
      const sales=new Sales
      const pivotTable = this.createPivotTable(catalog.values, sales.values);   
      return pivotTable
      }
    } catch (e) {
        logError(e.message + " " + e.stack);
 }

}


createPivotTable(catalog, sales) {
    // Получаем индексы нужных полей из заголовков
    const catalogHeaders = catalog[0];
    const salesHeaders = sales[0];
    const idxBrand = catalogHeaders.indexOf('Brand');
    const idxScladPrice = catalogHeaders.indexOf('scladprice');
    const idxNetPrice = catalogHeaders.indexOf('netprice');
 

    const idxBrandSales = salesHeaders.indexOf('Brand');
    const idxFinalPriceVND = salesHeaders.indexOf('finalPriceVND');


    // Создаем объект для сводной таблицы
    const pivot = {};

    // Сначала обрабатываем каталог
    for (let i = 3; i < catalog.length; i++) {
        const row = catalog[i];
        const brand = row[idxBrand];
        const scladPrice = parseFloat(row[idxScladPrice]) || 0;
        const netPrice = parseFloat(row[idxNetPrice]) || 0;

        if (!pivot[brand]) {
            pivot[brand] = {
                scladprice: 0,
                netprice: 0,
                finalpriceVND: 0,
            };
        }

        pivot[brand].scladprice += scladPrice;
        pivot[brand].netprice += netPrice;
    }

    // Затем обрабатываем продажи
    for (let i = 1; i < sales.length; i++) {
        const row = sales[i];
        const brand = row[idxBrandSales];
        const finalPriceVND = parseFloat(row[idxFinalPriceVND]) || 0;

        if (pivot[brand]) {
            pivot[brand].finalpriceVND += finalPriceVND;
        } else {
            // Если бренд из sales отсутствует в catalog, добавляем его
            pivot[brand] = {
                scladprice: 0,
                netprice: 0,
                finalpriceVND: finalPriceVND,
            };
        }
    }

    return pivot;
}















}



function getMySalary(data) {
  
    try {
         var salary =  new Salary();
           return salary.getSalary(data.value); 
     } catch (e) {
        logError(e.message + " " + e.stack);
        return false
    }
}



class Salary {
  constructor() {
    		if (!excel) {
			excel = new Excel
		}
    
    const sheet = excel.getSheetByName(SALARY_PIVOT_SHEET_NAME);
    const range = sheet.getDataRange();
      this.values=range.getDisplayValues()
      this.arranged=this.arrangeData()
  }

getSalary(employeeName){

   // try {
        this.employeeName=employeeName
     //    var salary =  new Salary();
        var res=  this.arranged; 
        return res[employeeName]
 //   } catch (e) {
  //      logError(e.message + " " + e.stack);
  //  }

}

arrangeData() {
    const result = {};

     this.values.forEach((row, index) => {
        // Пропускаем заголовок
        if (index === 0) return;

        const [usernameDay, date, salaryDay, usernameMonth, month, salaryMonth, usernameYear, year, salaryYear] = row;

        // Инициализируем объект для текущего сотрудника (по дням)
        if (usernameDay && !result[usernameDay]) {
            result[usernameDay] = { days: {}, months: {}, years: {} };
        }

        // Добавляем данные по дням
        if (usernameDay && date && salaryDay) {
            result[usernameDay].days[date] = salaryDay;
        }

        // Инициализируем объект для текущего сотрудника (по месяцам)
        if (usernameMonth && !result[usernameMonth]) {
            result[usernameMonth] = { days: {}, months: {}, years: {} };
        }

        // Добавляем данные по месяцам
        if (usernameMonth && month && salaryMonth) {
            result[usernameMonth].months[month] = salaryMonth;
        }

        // Инициализируем объект для текущего сотрудника (по годам)
        if (usernameYear && !result[usernameYear]) {
            result[usernameYear] = { days: {}, months: {}, years: {} };
        }

        // Добавляем данные по годам
        if (usernameYear && year && salaryYear) {
            result[usernameYear].years[year] = salaryYear;
        }
    });

    return result;
}
}













///---------------------------------------------------------------------------------
class EmployeeSalaryCalculator {
  constructor(employeeName, brand) {
    try{
    		if (!configExcel) {
			configExcel = new ConfigExcel
		}
    this.employeeName=employeeName
    this.brand=brand
    const sheet = configExcel.getSheetByName(SALARY_SHEET_NAME);
    const range = sheet.getDataRange();
    this.values=range.getValues()
    this.salaryConfiguration= this.getSalaryConfiguration()
    	} catch (e) {
    		logError(e.message + " " + e.stack);
        return 0
}
  }

getSalaryConfiguration(){
try{
  var	 query= { "username": this.employeeName, "Brand": this.brand };
return this.getAllItemsByQuery(query) 


	} catch (e) {
    		logError(e.message + " " + e.stack);
        return 0
}
}


getAllItemsByQuery(query) {

	try {

		var res = this.values
    var header=res[0]
		let result

		if (query == "All") {
			result = {
				data: res
			}
		} else {
			result = filterArrayByQuery(res, query)
			
		}
    var r=result[0]
        result=arraysToObject(header, result[0])
		return result
} catch (e) {
		logError(e.message + " " + e.stack);
    return 0
}

}

  getIncome(finalPrice, paymentMethod) {
    if( this.salaryConfiguration){
    const income = finalPrice * this.salaryConfiguration[paymentMethod]/100;
return income
    }
else {return 0}
  }

}



function testSalary(){
//var finalPrice=1000
//var paymentMethod="Cash"
  var employee=new EmployeeSalaryCalculator("Марина")
  var income=employee.getIncome(finalPrice,paymentMethod)
return income
}




function getMenu(data) {
//logError(data)
	try {

    const username=data.username
		var auth = new Auth
		var res = {}
		res[username] = auth.getRole(username)


		var userRole = res[username]; // Определяем роль пользователя

		if (!userRole || roles.indexOf(userRole) === -1) {
			return []; // Если роль не найдена, возвращаем пустой массив
		}

		var userRoleIndex = roles.indexOf(userRole);

		// Фильтруем пункты меню по роли и сразу возвращаем результат
		const filteredMenuItems = menuItems.filter(item => {
			let itemRoleIndex = roles.indexOf(item.role);

			// Проверяем два условия:
			// 1. Уровень доступа пользователя (`userRoleIndex`) должен быть таким же или выше, чем роль, требуемая для доступа к этому пункту (`itemRoleIndex`).
			// 2. Пункт меню не должен иметь роль "none", которая делает его недоступным для всех.
			return itemRoleIndex <= userRoleIndex && item.role !== "none";
		});

		//Logger.log(filteredMenuItems.length); // Логируем количество отфильтрованных элементов
		//Logger.log(filteredMenuItems);        // Логируем отфильтрованные элементы
		return filteredMenuItems;
	} catch (e) {
		logError(e.message + " " + e.stack);
	}
}




function sendToSheet(name, text) {
	SpreadsheetApp.openById(sheetID).getSheetByName(sheetName).appendRow([name, text]);
}



//---------------------------------------------------------------Excel------------------------------------------------------------------------

class ConfigExcel {
	constructor() {
		return SpreadsheetApp.openById(sheetConfig)
	}

}



class Excel {
	constructor() {
		return SpreadsheetApp.openById(sheetID)
	}

}


//---------------------------------------------------------------CONFIG------------------------------------------------------------------------




function getConfig() {
    try {
        if (!config) {
            config = new Config();
        }
         return config.getValues(); // Return all config values as a hash map

    } catch (e) {
        logError(e.message + " " + e.stack);
    }
}

class Config {
    constructor() {
        try {
            if (!configExcel) {
                configExcel = new ConfigExcel();
            }

            this.sheet = configExcel.getSheetByName(configSheetName);
            this.cacheKey = SCRIPT_VERSION+"_"+configSheetName;

            const cache = CacheService.getScriptCache();
            const cachedData = cache.get(this.cacheKey);

          //  if (cachedData && USE_DATA_CACHE) {
          //      this.values = JSON.parse(cachedData);
          //      this.configMap = this._buildConfigMap(); // Build hash map from cached data
          //  } else {
                this.loadDataFromSheet();
          //  }
        } catch (e) {
            logError(e.message + " " + e.stack);
        }
    }

    // Load data from the sheet and update the cache and hash map
    loadDataFromSheet() {
        this.range = this.sheet.getDataRange();
        this.values = this.range.getValues();
          const globalvar=["GLOBAL_EXECUTION_TESTING","" , "", TESTING,"",""]
            this.values.push(globalvar)


        this.configMap = this._buildConfigMap(); // Build hash map from fresh data
        CacheService.getScriptCache().put(this.cacheKey, JSON.stringify(this.values), CONFIG_CACHE_TIME);
    }

    // Clear cache
    clearCache() {
        CacheService.getScriptCache().remove(this.cacheKey);
    }

    // Build a hash map for quick lookups
    _buildConfigMap() {
        const configMap = {};
        for (let k in this.values) {
            const row = this.values[k];
            if (row.length >= 4) { // Ensure there are enough columns
                configMap[row[0]] = row[3]; // Use first column as key, fourth as value
            }
        }
        return configMap;
    }

    // Get all values as a key-value object
    getValues() {
           const scriptProperties = PropertiesService.getScriptProperties();
          var props = scriptProperties.getProperties();
              Object.keys(props).forEach(key => {
                this.configMap[key] = props[key];
                // this.configMap[key] = "";
              });



       

        return this.configMap; // Return the hash map directly
       

    }

    // Get a specific value by key
    getValueByKey(key) {
        return this.configMap[key] || null; // Return the value or null if not found
    }
}


//---------------------------auth------------------------------------------//


function getAuthData(data) {
  data=data.senData
	const login = data[0]
	const password = data[1]
  const store = data[2]
	try {

			var auth = new Auth()
		var res = auth.filterColumn(2, login)
    var authdata = res[0]
		var pass = authdata[4]
		var username = authdata[1]

		this.filterRowIndex = authdata[0]

		var me = {}
		if (pass == password) {
			var token = auth.setToken(authdata[0])
      auth.setStore(authdata[0],store)
			me.token = token;
			me.username = username
      me.store=store
      me.globalUrl= webAppUrl;
		} else {
			me = false
		}
		return me
	} catch (e) {
		logError(e.message + " " + e.stack);
	}
}



function deleteToken(token) {

	try {
    var auth = new Auth()
    auth.requestToken=token
    if(auth){    auth.deleteToken()} else {return false}
	} catch (e) {
		logError(e.message + " " + e.stack);
	}
}

class Auth {
	constructor() {
		this.requestToken = "";
		this.globalLogin = "";

		if (!configExcel) {
			configExcel = new ConfigExcel();
		}
		this.sheet = configExcel.getSheetByName(authSheetName);
		this.range = this.sheet.getDataRange();
    this.cachekey=SCRIPT_VERSION+"_" + authSheetName
	}

	getToken() {
		return this.requestToken;
	}

	setToken(filterRowIndex) {
		try {
			const token = guidGenerator();
			const row = filterRowIndex + 1;
			this.sheet.getRange(`F${row}`).setValue(token);
			this.clearCache();
			return (this.requestToken = token);
		} catch (e) {
			logError(e.message + " " + e.stack);
		}
	}
	setStore(filterRowIndex,store) {
		try {
			const row = filterRowIndex + 1;
			this.sheet.getRange(`G${row}`).setValue(store);
			this.clearCache();
			return (this.store = store);
		} catch (e) {
			logError(e.message + " " + e.stack);
		}
	}

	deleteToken() {
		try {
		const res = this.filterColumn(6, this.requestToken)
       const authdata = res[0]
       if(authdata){
		const row = authdata[0] + 1;
			this.sheet.getRange(`F${row}`).setValue(token);
			this.clearCache();
			return (this.requestToken = token);
       }
       else{
        return false
       }
		} catch (e) {
			logError(e.message + " " + e.stack);
		}
	}

	filterColumn(columnNumber, filterValues) {
		const data = this.getCachedValues();
   return data.filter(row => row[columnNumber - 1] === filterValues);
	}

	getCachedValues() {
    try{
		const cache = CacheService.getScriptCache();
		const cachedData = cache.get( this.cachekey);

  if (cachedData && USE_DATA_CACHE) {
			return JSON.parse(cachedData);
		} else {
			const data = this.range.getValues();
			cache.put( this.cachekey, JSON.stringify(data), AUTH_CACHE_TIME); 
			return data;
		}
    		} catch (e) {
			logError(e.message + " " + e.name + " " + e.stack);
		}
	}

	getValues() {
		const data = this.getCachedValues();
		return data.reduce((conf, row) => {
			conf[row[0]] = row[3];
			return conf;
		}, {});
	}

	getRole(username) {
		try{
    const res = this.filterColumn(2, username);
var role=res.length > 0 ? res[0][3] : false;
		return role
    		} catch (e) {
			logError(e.message + " " + e.name + " " + e.stack);
		}
	}

	clearCache() {
		CacheService.getScriptCache().remove( this.cachekey);
	}
}






//---------------------------------------------------------------Store------------------------------------------------------------------------

function getStores() {
    const store= new Store
    return  JSON.stringify(store.getStores())
}

function getStoreNameByID(storeId) {
    const store= new Store
    return store.getStoreNameByID(storeId)
}

function getStoreSkladByID(storeId) {
    const store= new Store
    return store.getStoreSkladByID(storeId)
}
function bbbbbbb(storeName="Urban") {
   const store= new Store
    Logger.log(store.getStoreAccountByName(storeName))
  //  return store.getStoreSkladByName(storeName)
}


function getStoreSkladByName(storeName) {
    const store= new Store
      return store.getStoreSkladByName(storeName)
}

function getStoreAccountById(storeId) {
    const store= new Store
    return store.getStoreAccountById(storeId)
}

function getStoreAccountByName(storeName) {
    const store= new Store
    return store.getStoreAccountByName(storeName)
}

class Store {
	constructor() {
		if (!configExcel) {
			configExcel = new ConfigExcel();
		}
		this.sheet = configExcel.getSheetByName(STORE_SHEET_NAME);
		this.range = this.sheet.getDataRange();

	}

	filterColumn(columnNumber, filterValues) {
    var data = this.sheet.getDataRange().getDisplayValues();
      for(var i = 1; i < data.length; i++) {
            if(data[i][columnNumber] === filterValues) {
          return data[i]
        }
      }
	}
	getStoreNameByID(storeId) {
		try{
    const res = this.filterColumn(0, storeId.toString());
    const storeName=res.length > 0 ? res[1] : false;
		return storeName
    		} catch (e) {
			logError(e.message + " " + e.name + " " + e.stack);
		}
	}

  	getStoreSkladByID(storeId) {
		try{
    const res = this.filterColumn(0, storeId.toString());
    const storeSclad=res.length > 0 ? res[2] : false;
		return storeSclad
    		} catch (e) {
			logError(e.message + " " + e.name + " " + e.stack);
		}
	}
    	getStoreSkladByName(storeName) {
		try{
    const res = this.filterColumn(1, storeName.toString());
    const storeSclad=res.length > 0 ? res[2] : false;
		return storeSclad
    		} catch (e) {
			logError(e.message + " " + e.name + " " + e.stack);
		}
	}

    	getStoreAccountByName(storeName) {
		try{
    const res = this.filterColumn(1, storeName.toString());
    const storeSclad=res.length > 0 ? res[3] : false;
		return storeSclad
    		} catch (e) {
			logError(e.message + " " + e.name + " " + e.stack);
		}
	}

      	getStoreAccountById(storeName) {
		try{
    const res = this.filterColumn(0, storeName.toString());
    const storeSclad=res.length > 0 ? res[3] : false;
		return storeSclad
    		} catch (e) {
			logError(e.message + " " + e.name + " " + e.stack);
		}
	}

        	getStores() {
		try{
    return this.sheet.getDataRange().getDisplayValues();
     		} catch (e) {
			logError(e.message + " " + e.name + " " + e.stack);
		}
	}

}






//---------------------------------------------------------------UserContext------------------------------------------------------------------------


class UserContext {
  constructor() {
    this.cache = CacheService.getScriptCache();
    this.auth = new Auth();
    this.store = new Store();
  }

  getUserByToken(token) {
    const cacheKey = `${SCRIPT_VERSION}_user_${token}`;
    const cachedUser = this.cache.get(cacheKey);
    
    if (cachedUser && USE_DATA_CACHE) {
      return JSON.parse(cachedUser);
    }
    
    const authData = this.auth.filterColumn(6, token);
    if (!authData || authData.length === 0) {
      return false;
    }
    
    const userData = authData[0];
    const user = {
      username: userData[1],
      token: token,
      storeId: userData[6],
      storeName: this.store.getStoreNameByID(userData[6]),
      storeSklad: this.store.getStoreSkladByID(userData[6]),
      role: userData[3]
    };
    
    this.cache.put(cacheKey, JSON.stringify(user), AUTH_CACHE_TIME);
    return user;
  }

  getUserNameByToken(token) {
    const user = this.getUserByToken(token);
    return user ? user.username : false;
  }

  getUserStoreByToken(token) {
    const user = this.getUserByToken(token);
    return user ? user.storeName : false;
  }

  getUserStoreId(token) {
    const user = this.getUserByToken(token);
    return user ? user.storeId : false;
  }

  getRoleByToken(token) {
    const user = this.getUserByToken(token);
    return user ? user.role : false;
  }
}

// Обновленные функции для совместимости со старым кодом
const userContext = new UserContext();

function getUser(token) {
  const user = userContext.getUserByToken(token);
  return user ? user.username : false;
}

function getUserNameByToken(token) {
  return userContext.getUserNameByToken(token);
}

function getUserStoreByToken(token) {

      //logError(token)

        //logError(userContext.getUserStoreByToken(token))
  return userContext.getUserStoreByToken(token);
}

function getStoreSkladByToken(token) {
  return userContext.getStoreSkladByToken(token);
}

// Остальные классы (Auth, Store) остаются без изменений






//---------------------------------------------------------------CATALOG------------------------------------------------------------------------

var cat;

function getHeader(params = {}) {
  try {
    const { token } = params;
    if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    const catalogsheetId=getStoreSkladByID(userData.storeId)
    const catalog = new Catalog(catalogsheetId); 

    return catalog.getHeader();
  } catch (e) {
    logError(`Ошибка в getHeader: ${e.message}`);
    throw e; // Пробрасываем ошибку на фронтенд
  }
}



function testt() {
	var articleName = '111111111'
	var f = getItemByArticleName(articleName)
	//Logger.log(f)
}


/*

function getItemQuantity(articleName){
 // var articleName= "08109006"
   const data=getItemByArticleNameGS(articleName)
const quantityIndex = data[0].indexOf("quantity");
// Извлекаем значение "quantity" из второй строки данных, если индекс найден
if (quantityIndex !== -1) {
    const quantity = data[1][quantityIndex];
 //   Logger.log(quantity)
    return(quantity);
} else {
    return -1
}
}

*/

function getItemByArticleName(params) {
	try {

  
    const token  = params.token;
    const articleName  = params.value;

    if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    const catalogsheetId=getStoreSkladByID(userData.storeId)
    



		const res = getItemByArticleNameGS(articleName,catalogsheetId)

		//logError(JSON.stringify(res))
    return (JSON.stringify(res))
    
	} catch (e) {
		logError(e.message + " " + arguments.callee.name + " " + e.stack)
	}
}




function getItemByArticleNameGS(articleName, catalogsheetId) {
	try {
    

		cat = new Catalog(catalogsheetId)
		var position = cat.getFieldPosition(articleFieldName) + 1
		var res = cat.filterColumn(position, articleName)
		return res


		return (res)
	} catch (e) {
		logError(e.message + " " + arguments.callee.name + " " + e.stack)
	}
}


function filterArrayByQuery(dataArray, query) {
	// Извлекаем первую строку с названиями полей
	const headers = dataArray[0];
	// Получаем индексы полей, которые соответствуют ключам из query
	const queryKeys = Object.keys(query);
	const queryIndexes = queryKeys.map(key => headers.indexOf(key));

	// Проходим по массиву данных (начиная со второй строки) и фильтруем их по query
	const filteredRows = dataArray.slice(1).filter(row => {
		return queryKeys.every((key, i) => {
			const value = query[key].toLowerCase();
			const rowValue = (row[queryIndexes[i]] || "").toLowerCase(); // игнорируем регистр
			return rowValue.includes(value);
		});
	});

	return filteredRows;
}

function generateFilterOptions(dataArray) {
	// Получаем заголовки из первой строки массива (оставляем пустые заголовки)
	const headers = dataArray[0];

	// Инициализируем массив для хранения заголовков с индексами и значениями
	let filterOptions = [];

	headers.forEach((header, index) => {
		// Если заголовок пустой, задаем уникальное имя, например "Unnamed X", где X — индекс
		const headerName = header !== "" ? header : `${index + 1}`;

		filterOptions.push({
			header: headerName,
			index: index,
			values: new Set() // Используем Set для уникальных значений
		});
	});

	// Проходим по каждой строке данных (начиная со второй строки)
	dataArray.slice(1).forEach(row => {
		filterOptions.forEach(option => {
			const value = row[option.index]; // Используем текущий индекс, не смещая его
			if (value !== undefined && value !== "") {
				option.values.add(value); // Добавляем уникальные значения
			}
		});
	});

	// Преобразуем Set в массивы и добавляем "all" как первый элемент
	filterOptions.forEach(option => {
		option.values = ["all", ...Array.from(option.values)]; // Преобразуем Set в массив
	});

	return filterOptions;
}




function getCatalogFilterOptions(params) {
	try {
    const token  = params.token;
    if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    const catalogsheetId=getStoreSkladByID(userData.storeId)
			cat = new Catalog(catalogsheetId)


		var filterOptions = generateFilterOptions(cat.values)
    //    Logger.log(filterOptions)
   return JSON.stringify({ data: filterOptions });
	} catch (e) {
		        	logError(e.message + " " + e.stack);
	}

}



/*
function getAllItemsByQuery(query) {
 //query={"Brand":"BUTTON ROUGE", "subtype": "брюки" }
    try {
        if (!cat) {
            cat = new Catalog
        }
        var res=cat.values
const result = filterArrayByQuery(res, query);
        return (result)
    } catch (e) {
        logError(e.message + " " + arguments.callee.name + " " + e.stack)
    }

}

*/


function getAllItemsFromCatalogByQuery(params) {
	try {
    const token  = params.token;
    const query=params.value
        if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    const catalogsheetId=getStoreSkladByID(userData.storeId)

		cat = new Catalog(catalogsheetId)

		var res = cat.values

		let result
		if (query == "All") {
			result = res
		} else {

			result = {
				data: filterArrayByQuery(res, query)
			}
		}
		return (JSON.stringify({data:result}))
	} catch (e) {
		        	logError(e.message + " " + e.stack);
	}

}



function getDistinctBrandNames() {
	try {
    const token  = params.token;
    const articleName  = params.value;
    if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    const catalogsheetId=getStoreSkladByID(userData.storeId)

cat = new Catalog(catalogsheetId)
		var res = cat.returnColumnValues("Brand")
		var result = findUnique(res, d => d.Brand);
    result.splice(0, 2)
		return (result)
	} catch (e) {
		        	logError(e.message + " " + e.stack);
	}
}


class Catalog {
	constructor(sheetName) {
    try {
			excel = new Excel();

		this.cache = CacheService.getScriptCache();

		// Получаем объект листа


		this.sheet = excel.getSheetByName(sheetName);

/*
		// Попробуем получить данные из кэша
		const cachedData = this.cache.get("catalogData");
		const cachedContext = this.cache.get("catalogContext");

		if (USE_DATA_CACHE && cachedData && cachedContext) {
			// Если данные есть в кэше, используем их
			this.values = JSON.parse(cachedData);
			this.context = JSON.parse(cachedContext);
		} else {
	*/
  		// Если данных нет в кэше, загружаем их из Google Sheets
			this.range = this.sheet.getDataRange();
			this.values = this.range.getValues();
			this.context = this.sheet.getRange("2:3").getValues();

			// Сохраняем данные в кэше на 10 минут (600 секунд)
		//	this.cache.put("catalogData", JSON.stringify(this.values), CATALOG_CACHE_TIME);
			//this.cache.put("catalogContext", JSON.stringify(this.context), CATALOG_CACHE_TIME);
	//	
  	} catch (e) {
		        	logError(e.message + " " + e.stack);
	}
  }

	clearCache() {
		this.cache.remove("catalogData");
		this.cache.remove("catalogContext");
	}

	// Получение позиции столбца по названию
	getFieldPosition(fieldName) {
		const header = this.getHeader()[0];
		return header.indexOf(fieldName);
	}


	getRowByArticleName(articleName, columnNumber) {
		for (let i = 0; i < this.values.length; i++) {
			if (this.values[i][columnNumber] == articleName) {
				return i
			}
		}
	}

	// Фильтрация по столбцу с кэшированием данных
	filterColumn(columnNumber, filterValues) {
		const filteredData = [];
		filteredData.push(this.values[0]); // Заголовки
		for (let i = 0; i < this.values.length; i++) {
			if (this.values[i][columnNumber - 1] == filterValues) {
				filteredData.push(this.values[i]);
			}
		}
		return filteredData;
	}

	// Возвращение значений столбца по имени столбца
	returnColumnValues(columnName) {
		const index = this.values[0].indexOf(columnName);
		if (index === -1) return [];

		const columnData = this.values.map(row => [row[index]]);
		return arrayToObjects(columnData);
	}

	// Получение заголовков и контекста
	getHeader() {
		const headerAndContext = [];
		headerAndContext.push(this.values[0]);
		headerAndContext.push(this.context[0]);
		headerAndContext.push(this.context[1]);
		return headerAndContext;
	}

	updateRow(articleName, fieldName, newValue) {
		var articleColumnNumber = this.getFieldPosition("article")
		const rowNumber = this.getRowByArticleName(articleName, articleColumnNumber)
		const columnNumber = this.getFieldPosition(fieldName)
    this.sheet.getRange(rowNumber + 1, columnNumber + 1).setValue(newValue);

	}


	minusQuantityinCatalog(sale) {
		var fieldName = "quantity"
		var newValue = parseFloat(sale.quantity) - 1
    this.updateRow(sale.article, fieldName, newValue) 
    this.clearCache()

	}

  	getDescriptionByArticle(articleName) {
			var articleColumnNumber = this.getFieldPosition("article")
		const rowNumber = this.getRowByArticleName(articleName, articleColumnNumber)
		const columnNumber = this.getFieldPosition("description")
    const description=this.sheet.getRange(rowNumber + 1, columnNumber + 1).getDisplayValue()
    return description

	}

  getValueByParam(data, paramName) {
  // Проверяем, что массив имеет как минимум 2 элемента
  if (!Array.isArray(data) || data.length < 2) {
    return null;
  }
  
  const headers = data[0]; // Первый элемент - заголовки
  const values = data[1];  // Второй элемент - значения
  
  // Находим индекс параметра
  const paramIndex = headers.indexOf(paramName);
  
  // Если параметр не найден или нет соответствующего значения
  if (paramIndex === -1 || paramIndex >= values.length) {
    return null;
  }
  
  return values[paramIndex];
}




}


//--------------------------------------------------------------UISales-------------------------------------------------------------

function jjj(){

 //Logger.log(getAllItemsFromSalesByQuery("All"))
}

function getAllItemsFromSalesByQuery(query) {
      try {
             uiSales = new UISales();
           let result;
        if (query[0] === "All" || query[0] === "") {
            result = { data: uiSales.getAllValues() };
        } else {
            const filteredData = uiSales.filterSalesByQuery(query);
            const sanitizedData = filteredData.filter(
                row =>
                    !row.some(cell => typeof cell === "string" && cell.includes("#REF!")) &&
                    row.some(cell => cell !== "") // Ensure row is not entirely empty
            );
            result = { data: sanitizedData };
        }
 
        return JSON.stringify(result);
    } catch (e) {
        	logError(e.message + " " + e.stack);
    }
}







function getSalesFilterOptions() {
    try {
        if (!sales) {
            sales = new UISales();
        }

        const filterOptions = generateFilterOptions(sales.getAllValues());
      //  Logger.log(filterOptions)
        return JSON.stringify({ data: filterOptions });
    } catch (e) {
       	logError(e.message + " " + e.stack);
    }
}


class UISales {
    constructor() {
        if (!excel) {
            excel = new Excel();
        }

        // Get the sheet
        this.sheet = excel.getSheetByName(UI_SHEET_SALES);
        //this.cachekey=SCRIPT_VERSION+"_"+UI_SHEET_SALES
        // Initialize cache
       // this.cache = CacheService.getScriptCache();

        // Load values from cache or sheet
       // const cachedValues = this.cache.get(this.cachekey);

       // if (cachedValues && USE_DATA_CACHE) {
       //    this.values = JSON.parse(cachedValues);
        //} else {
            this.range = this.sheet.getDataRange();
            this.values = this.range.getDisplayValues();
         //   this.cache.put(this.cachekey, JSON.stringify(this.values), SALES_CACHE_TIME);
       // }

        // Initialize hash maps
        this.salesHashMap = this._buildSalesHashMap(); // Hash map for sales data
    }

    // Clear cache and rebuild hash maps
    clearCache() {
        this.cache.remove(this.cachekey);
        this.salesHashMap = {}; // Reset hash map
    }

    // Build a hash map for quick row lookups
    _buildSalesHashMap() {
        const hashMap = {};
        const headerRow = this.values[0];
        const idIndex = headerRow.indexOf("article"); // Replace with the column name you want to index by

        if (idIndex === -1) {
            logError("SaleID column not found in header.");
        }

        for (let i = 1; i < this.values.length; i++) {
            const row = this.values[i];
            const id = row[idIndex];
            if (id) {
                hashMap[id] = row;
            }
        }
        return hashMap;
    }

    // Get all values
    getAllValues() {
        return this.values;
    }

    // Get a specific sale by SaleID using the hash map
    getSaleById(saleId) {
        return this.salesHashMap[saleId] || null;
    }

    // Filter sales by a specific query (uses hash map for lookups if possible)
    filterSalesByQuery(query) {
        if (!query || query === "All") {
            return this.values;
        }

        const filteredData = this.values.filter(row => {
            return Object.keys(query).every(key => {
                const headerIndex = this.values[0].indexOf(key);
                if (headerIndex === -1) return false;

                const value = query[key].toLowerCase();
                const cellValue = (row[headerIndex] || "").toLowerCase();

                return cellValue.includes(value);
            });
        });

        return filteredData;
    }

    append(data){
      try{
        sendDataToSheet(data, this.sheet) 
        this.clearCache()
    } catch (e) {
            logError(e.message + " " + e.stack);

        }
    }
  }



//---------------------------------------------------------------SALES------------------------------------------------------------------------

class Sales {
	constructor() {
		if (!excel) {
			excel = new Excel();
		}

		// Получаем объект листа
		this.sheet = excel.getSheetByName(salesSheetName);

		// Инициализируем кэш
		this.cache = CacheService.getScriptCache();
		this.cachekey = SCRIPT_VERSION + "_" + salesSheetName;

	
	}


getAllValues()
{

  	// Проверяем кэш на наличие сохранённых данных
		const cachedValues = this.cache.get(this.cachekey); // Используем имя листа как ключ кэша

		if (cachedValues && USE_DATA_CACHE) {
			// Если данные есть в кэше, разбираем их из JSON
			this.values = JSON.parse(cachedValues);
		} else {
			// Если данных нет в кэше, получаем их напрямую из Google Sheets
			this.range = this.sheet.getDataRange();
			this.values = this.range.getDisplayValues();

			// Сохраняем данные в кэш в виде JSON строки на 5 минут
			this.cache.put(this.cachekey, JSON.stringify(this.values), SALES_CACHE_TIME);
		}
    return this.values
}

	// Метод для очистки кэша
	clearCache() {
		this.cache.remove(this.cachekey);
	}

	// Метод для фильтрации данных
	filterData(filter) {
		if (!filter || typeof filter !== "string") {
			throw new Error("Некорректный формат фильтра.");
		}

		// Разбиваем строку фильтра
		const [field, value] = filter.split("=");
		if (!field || value === undefined) {
			throw new Error("Фильтр должен быть в формате 'поле=значение'.");
		}

		// Находим индекс поля
		const headers = this.getAllValues[0];
		const fieldIndex = headers.indexOf(field.trim());
		if (fieldIndex === -1) {
			throw new Error(`Поле "${field}" не найдено.`);
		}

		// Фильтруем данные
		const filteredData = this.getAllValues.filter((row, index) => {
			// Пропускаем заголовок
			if (index === 0) return true;

			return String(row[fieldIndex]).trim() === String(value).trim();
		});

		return filteredData;
	}
}





//---------------------------------------------------------------SALE------------------------------------------------------------------------



function sendSalesToSheet(request) {
	try {

		var guid = guidGenerator()


		var salesData = request.sales;
		var basketData = request.basket;
    const storeName=	basketData[0].store

		if (!excel) {
			excel = new Excel
		}

		basketData[0].id = guid

		salesData.forEach(sale => {
			sale.basketid = guid
		})


		salesData.forEach(sale => {
			sale.store = storeName
		})
    
var saleMonth
var saleYear


		salesData.forEach(sale => {
///////Высчитываем поля с датой//////////////////////
sale.article=sale.article.trim()
saleMonth=getMonthFromDate(sale.date) 
saleYear=getYearFromDate(sale.date) 
sale.month= saleMonth
sale.year= saleYear
sale.weekday= getEuropeanWeekday(sale.date) 
sale.finalPrice=(sale.finalPrice.toString().replace(".",",")); //для русской локализации Excel
sale.curs=(sale.curs.toString().replace(".",",")); //для русской локализации Excel


///////Высчитываем зарплату//////////////////////

        var employeeSalary=new EmployeeSalaryCalculator(sale.username, sale.Brand)
        var income=employeeSalary.getIncome(sale.finalPriceVND,sale.paymentmethod)
        sale.salary=income
///////////////////////////////////////////////////////////////

		})


		const salesSheet = excel.getSheetByName(salesSheetName);
		sendDataToSheet(salesData, salesSheet);

    //const basketSheet = excel.getSheetByName(basketSheetName);
		//sendDataToSheet(basketData, basketSheet);


		////////////////////

      //var uiSales= new UISales
		//	uiSales.append(salesData)
     //uiSales.clearCache()


    const catalogSheetName=getStoreSkladByName(storeName) 
		var cat = new Catalog(catalogSheetName)
		salesData.forEach(sale => {
			cat.minusQuantityinCatalog(sale)
      const description=cat.getDescriptionByArticle(sale.article)
      sale.description=description
     // logError(description)
		});




//отправка данных в кассу, если платеж наличными
     const bData=basketData[0]
     // if(bData.paymentmethod=="Cash"){






const budgetRecord={}
budgetRecord["Дата"]=bData.date,
budgetRecord["Сумма"]=bData.finalPriceVND,
budgetRecord["Бюджет"]=BUDGETNAME,
budgetRecord["Статья расходов"]="Продажа"
budgetRecord["username"]=bData.username,
budgetRecord["budgetType"]=bData.paymentmethod
budgetRecord["Вид"]="Факт"
budgetRecord["Тип"]="Приход"
budgetRecord["countInBudget"]=1
  if(bData.paymentmethod=="Cash"){
budgetRecord["PaymentCashRegister"]="Касса"
budgetRecord["storeName"]=storeName

      var budgetData={"value": budgetRecord}
      addBudgetRecord(JSON.stringify(budgetData))

  } 


/*
    const budgetRecord={
        date: bData.date,
        time: bData.time,
        type: "Факт",
        category: "Приход",
        amount: bData.finalPriceVND,
        budget: BUDGETNAME,
        purpose: "Продажа",
        description: "Продажа",
        year: saleYear,
        month: saleMonth,
        comment: "",
        username: bData.username,
        paymentCashRegister:"Касса",
        budgetType: bData.paymentmethod
 
      }
      */

//}

     // var sale= new Sales
     // sale.clearCache()

//-------------------------




		if (enableTelegram) {
			salesData.forEach(sale => {
				sendDataToAllChats(sale)
			});
			sendDataToAllChats(basketData[0])
		}





		return 1;

	} catch (e) {
		
		logError("Ошибка при записи продажи: " +e.message + " " + e.stack);
  
    return 0
	}
}



function sendDataToSheet(data, sheet) {
	try {
		if (!sheet) {
			logError("Лист с данными не найден!");
		}

		const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
		const headerMap = mapHeaders(headers);

		data.forEach(sale => {
			const row = sheet.getLastRow() + 1;
			Object.keys(sale).forEach(key => {
				const column = headerMap[key.toLowerCase()];
				if (column !== undefined) {

				if(key=="article"){
          sheet.getRange(row, column + 1).setValue("'" +sale[key]);
        } else {
        	sheet.getRange(row, column + 1).setValue(sale[key]);
        }
        
        }
			});
		});
	} catch (e) {
		logError(e.message + " " + e.stack);
		logError("Ошибка при записи данных в таблицу: " + e.message);
	}
}




function mapHeaders(headers) {
	return headers.reduce((headerMap, header, index) => {
		headerMap[normalizeHeader(header)] = index;
		return headerMap;
	}, {});
}




// Вспомогательная функция для создания маппинга заголовков
function mapHeaders(headers) {
	const headerMap = {};
	headers.forEach((header, index) => {
		headerMap[normalizeHeader(header)] = index; // Сопоставляем заголовок с его индексом
	});
	return headerMap;
}

// Вспомогательная функция для нормализации заголовков (на случай несовпадений)
function normalizeHeader(header) {
	return header.trim().toLowerCase()
}



/*
	filterColumn_old(columnNumber, filterValues) {
			let checkfilter = this.sheet.getFilter();
			let values;
			if (checkfilter) {
				checkfilter.remove()
			};
			this.range.createFilter()
			let filter = this.sheet.getFilter();
			let criteria = SpreadsheetApp.newFilterCriteria()
				.whenTextEqualTo(filterValues)
				.build();
			filter.setColumnFilterCriteria(columnNumber, criteria);
			this.filterRange=this.sheet.getFilter().getRange()
	    var url = "https://docs.google.com/spreadsheets/d/" + sheetID + "/gviz/tq?tqx=out:csv&gid=" + this.sheet.getSheetId() + "&access_token=" + ScriptApp.getOAuthToken();
			var res = UrlFetchApp.fetch(url);
			values = Utilities.parseCsv(res.getContentText());
			this.values = values
			var res = values
			this.sheet.getFilter().remove();
			return res;
	    
		}

	*/
