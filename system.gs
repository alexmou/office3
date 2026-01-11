


function getMinifiedHtml(html) {
  var html = HtmlService.createTemplateFromFile('index/index').evaluate().getContent();
  // Удаляем переносы строк и лишние пробелы
  var minified = html.replace(/\s{2,}/g, ' ').replace(/[\n\r]/g, '');
  return HtmlService.createHtmlOutput(minified);
}


function renderOnlyHTMLPage(params) {
    try {
       const token = params.token;
        const name=params.value

        // Check if the page exists in the configuration
        const config = pageConfig[name];
        if (!config) {
            logError(`Page "${name}" not found in configuration.`);
        }

        const res = { pageName: name, pageTitle: config.pageTitle };


        if (config.javascript) {
          res.jsNames=config.javascript
         
        }


        // Generate HTML content
        const htmlFiles = Array.isArray(config.html) ? config.html : [config.html];
        res.html = htmlFiles
          .map(name => include(name))
          .join("");
        return res;
    } catch (e) {
        logError(`${e.message} in ${e.stack}`);
        return null;
    }
}
















function renderPage(params) {
    try {
 const token = params.token;
 const name=params.value

    if (!token) {
    logError("Токен не предоставлен");
  }
  
  // Проверяем авторизацию
  const userData = new UserContext().getUserByToken(token);
  if (!userData) {
    logError("Неверный токен");
  }


        // Check if the page exists in the configuration
        const config = pageConfig[name];
        if (!config) {
            logError(`Page "${name}" not found in configuration.`);
        }

        const res = { pageName: name, pageTitle: config.pageTitle };

        // Generate HTML content
        const htmlFiles = Array.isArray(config.html) ? config.html : [config.html];
        res.html = htmlFiles
          .map(html => include(html))
          .join("");
     
/*
if (config.html) {
  res.html = config.html
    .map(html => {
      try {
        // First try to fetch as a local file
        return HtmlService.createHtmlOutputFromFile(html).getContent();
      } catch (e) {
        // If that fails, try to fetch as a URL
        return UrlFetchApp.fetch(html).getContentText();
      }
    })
    .join("\n");
}
///logError(res.htmlNames)
*/





        if (config.src) {
            res.src = config.src

        }

        if (config.link) {
            res.link = config.link

        }

        // Generate JavaScript content
        if (config.javascript) {
          res.jsNames=config.javascript
            res.javascript = config.javascript
                .map(js =>
                    js.startsWith("http")
                        ? UrlFetchApp.fetch(js).getContentText() // Fetch external JS
                        : include(js) // Fetch local JS
                )
        }

        // Generate CSS content
        if (config.css) {
          res.cssNames=config.css
            res.css = config.css
                .map(css => include(css))
        }

                      
        return res;
    } catch (e) {
        logError(`${e.message} in ${arguments.callee.name} ${e.stack}`);
        return null;
    }
}





function clearCacheByVersion(version) {
    const cache = CacheService.getScriptCache();
    const keys = Object.keys(pageConfig); // Get all page names from the configuration

    // Iterate through all keys and remove the ones matching the version
    keys.forEach(key => {
        const cacheKey = `${version}_${key}`; // Construct cache key
        cache.remove(cacheKey); // Remove the cache entry
        console.log(`Cache cleared for key: ${cacheKey}`);
    });
}


function getScriptParam(param)
{

const scriptProperties = PropertiesService.getScriptProperties();
return scriptProperties.getProperty(param)
}


function setScriptProperty(p) {
 // var p={"currentPageName":"barcode"}
  try{
  if (typeof p === 'object' && p !== null) {
    const scriptProperties = PropertiesService.getScriptProperties();
    Object.keys(p).forEach(key => {
      scriptProperties.setProperty(key, p[key]);
    });
  } else {
   logError('Input must be an object with key-value pairs.');
  }
  	} catch (e) {
		logError(e.message + " " + e.stack);
}
}




function executeFunctionByName(functionName, params) {
  try{
    logError("выполняем "+functionName)
    var allowedFunctions = ['getItemByArticleName', 'getHeader', 'getMenu', "getAuthData" , "getConfig", "sendSalesToSheet", "sendBascketToSheet","getAllItemsFromSalesByQuery","getAllItemsFromCatalogByQuery","getCatalogFilterOptions", "getSalesData", "getSalesFilterOptions","renderPage","renderOnlyHTMLPage","setScriptProperty","getMySalary","getPivot","getAllSalesStatistic","getCashRegisterRecords","getBudgetRecords","getPnl","getCash","getBudget","addBudgetRecord", "getVocabulary","getDistinctBrandNames","setStatisticBrandName","updateBudgetData", "addCacheRegisterRecord","getUserStoreByToken"];
    if (allowedFunctions.indexOf(functionName) !== -1 && typeof this[functionName] === 'function') {
        return this[functionName](params);
    } else {
        logError("Неизвестная или неавторизованная функция: " + functionName);
    }

	} catch (e) {
		logError(e.message + " " + e.stack);
}
}



function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
   .getContent(); 
};



// Универсальная функция для кэширования
function getCachedContent(cacheKey, generateContentFunction, useCache = USE_SCRIPT_CACHE) {
  const cache = CacheService.getScriptCache();
  const fullCacheKey = `${cacheKey}_${SCRIPT_VERSION}`; // Уникальный ключ с учетом версии

  // Если кэш отключен, сразу выполняем функцию генерации контента
  if (!useCache) {
   // Logger.log(`Cache disabled for key: ${fullCacheKey}`);
    return generateContentFunction();
  }

  let cachedContent = cache.get(fullCacheKey);

  if (!cachedContent) {
    //Logger.log(`Generating and caching content for key: ${fullCacheKey}`);
    cachedContent = generateContentFunction(); // Генерация контента, если его нет в кэше
    cache.put(fullCacheKey, cachedContent, SCRIPT_CACHE_TIME); 
  } else {
    //Logger.log(`Serving cached content for key: ${fullCacheKey}`);
  }

  return cachedContent;
}




// includeHeader с учетом параметра
function includeHeader(useCache = USE_SCRIPT_CACHE) {
 
  return getCachedContent("header", () => {
    return  includeSystemFiles() + 
            HtmlService.createHtmlOutputFromFile("header/header.js").getContent()
        //   HtmlService.createHtmlOutputFromFile("header/header").getContent();
    
    
  }, useCache);
}



function includeAuth() {
    return HtmlService.createHtmlOutputFromFile("auth.js").getContent()
}

// includeSystemFiles с учетом параметра
function includeSystemFiles() {
    return HtmlService.createHtmlOutputFromFile("system/system.js").getContent()+
           //HtmlService.createHtmlOutputFromFile("global.js").getContent()+
           HtmlService.createHtmlOutputFromFile("system/system.css").getContent() +
           HtmlService.createHtmlOutputFromFile("system/overlay").getContent();
}

function parseDate(dateString) {
    const parts = dateString.split("."); // Разделяем строку по точке
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JavaScript считает месяцы с 0
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day); // Возвращаем объект Date
    }
    return null; // Если формат некорректный, возвращаем null
}

function getMonthFromDate(dateString) {
    const parsedDate = parseDate(dateString); // Преобразуем строку в объект Date
    if (parsedDate && !isNaN(parsedDate)) { // Проверяем, что это валидная дата
        return parsedDate.getMonth() + 1; // Возвращаем номер месяца (добавляем 1)
    }
    return ""; // Если дата некорректная, возвращаем пустую строку
}




function getYearFromDate(dateString) {
    const parsedDate = parseDate(dateString); // Преобразуем строку в объект Date
    if (parsedDate && !isNaN(parsedDate)) { // Проверяем, что это валидная дата
        return parsedDate.getFullYear(); // Возвращаем год
    }
    return ""; // Если дата некорректная, возвращаем пустую строку
}




function getEuropeanWeekday(dateString) {
    const parsedDate = parseDate(dateString); // Преобразуем строку в объект Date
    if (parsedDate && !isNaN(parsedDate)) { // Проверяем, что это валидная дата
        let day = parsedDate.getDay(); // Получаем день недели (0 = воскресенье, 6 = суббота)
        return day === 0 ? 7 : day; // Если воскресенье (0), возвращаем 7, иначе возвращаем день
    }
    return ""; // Если дата некорректная, возвращаем пустую строку
}







function arraysToObject(keys, values) {  //Для создания объекта из двух массивов, где элементы первого массива выступают в роли ключей, а второго — в роли значений,
  const result = {};

  keys.forEach((key, index) => {
    if (key) { // Пропускаем пустые ключи
      result[key] = values[index];
    }
  });

  return result;
}




function logObject(obj) {
	if (Array.isArray(obj)) {
		// Если это массив, рекурсивно преобразуем его элементы в строку
		return '[' + obj.map(logObject).join(', ') + ']';
	} else if (obj && typeof obj === 'object') {
		// Если это объект, рекурсивно преобразуем ключи и значения
		let str = '{';
		for (let key in obj) {
			str += `${key}: ${logObject(obj[key])}, `;
		}
		return str.slice(0, -2) + '}'; // Убираем последнюю запятую и пробел
	} else if (typeof obj === 'string') {
		// Для строк добавляем кавычки
		return `"${obj}"`;
	} else {
		// Для примитивных типов возвращаем значение как есть
		return obj;
	}
}

function logError(obj){
 
var now = new Date();

const myerr = logObject(obj);
  	if (!configExcel) {
		var configExcel = new ConfigExcel;
	}
      if (!myerr) {
       configExcel.getSheetByName(errorLogSheet).appendRow(["NULL", SCRIPT_VERSION,  now.toString()]);
    } else {
      configExcel.getSheetByName(errorLogSheet).appendRow([myerr,SCRIPT_VERSION,  now.toString()]);
    }

//sendMessageToTelegram('Ошибка', myerr)

 
}




function writeLog(date, userName,userId,text,cont){
  excel.getSheetByName(sheetName).appendRow([date, userName,userId,text,true,cont ]);
  }




function sendEmail(){
  var now = new Date();
  GmailApp.sendEmail("l.murygin@gmail.com", "current time", "The time is: " + now.toString());
  }

function getScriptId() {
  // dev URI
 var url=   ScriptApp.getService().getUrl() ;
 const res = url.split("/");
return res[5]
}



function guidGenerator() {
    var S4 = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    var token=(S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    var replacedZeroToken = token.indexOf('|') == 0 ? token.substring(1) : token;
    
    return replacedZeroToken
}
