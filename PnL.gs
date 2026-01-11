const BUDGETNAME="BUTTON ROUGE"
  

/*
const budgetRecord={
    date: "5.12.2024",
    time: "5.12.2024",
    type: "Факт",
    category: "Приход",
    amount: 20000000,
    budget: BUDGETNAME,
    description: "Алименты",
    comment: "Комментарий",
  }
*/

function getVocabulary(){
 const budget = new BudgetRecord(SHEET_BUDGET_VOCABULARY_NAME);
 const record = budget.getVocabulary();
return record

}


function getBudgetRecords(params)
{
  try{

    const token  = params.token;
    const brandName="BUTTON ROUGE"
    if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    const sheetId=getStoreAccountById(userData.storeId)
    const budget = new BudgetRecord(sheetId);
const columnsToReturn = [0, 2, 3,4, 6,7,8, 9, 12]; // это пример, подставьте свои нужные колонки

 const record = budget.getBudgetRecords(brandName, columnsToReturn);
  const filterOptions = generateFilterOptions(record)
      // Logger.log(record)
     return JSON.stringify({ data: record, filterOptions:filterOptions });

	} catch (e) {
		logError(e.message + " " + arguments.callee.name + " " + e.stack)
	}

}



function getCashRegisterRecords(params)
{
  try{
    const token  = params.token;
    const brandName=params.value
    if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    const sheetId=getStoreAccountById(userData.storeId)
    const budget = new BudgetRecord(sheetId);


const columnsToReturn = [0,2, 3,4, 6,7,8, 9, 10]; // это пример, подставьте свои нужные колонки
 const record = budget.getCashRegisterRecords(brandName, columnsToReturn);
  const filterOptions = generateFilterOptions(record)
     return JSON.stringify({ data: record, filterOptions:filterOptions });
	} catch (e) {
		logError(e.message + " " + arguments.callee.name + " " + e.stack)
	}

}



function getPnl(brandName=BUDGETNAME) {
 const budget = new BudgetRecord(SHEET_BUDGET_PNL_NAME);
 const record = budget.getPnLRecord(brandName);
// Logger.log(record)
return record
}



function getCash(params) {
  try{
  const token  = params.token;
      if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
  
    const cash=getCashByStoreID(userData.storeId)
  return cash
} catch(e){
  		logError("Ошибка при получении данных остатка на кассе: " + e.message + " " + e.stack);
   return false
}
}



function getBudget() {
  try{
 const budget = new BudgetRecord(SHEET_BUDGET_PNL_NAME);
 const record = budget.getBudgetRecord();
 //  var a= JSON.stringify(record)
 //Logger.log(record)
    return record
}catch(e){
  		logError("Ошибка при получении данных остатка на кассе: " + e.message + " " + e.stack);
  
}
}

function addBudgetRecord(params) {
  try{
       const token  = params.token;

            let     data= JSON.parse(params)
     data=data.value
    /*
        const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    */


        const sheetId=getStoreAccountByName(data.storeName)
      const budget = new BudgetRecord(sheetId);
      data["Год"]=getYearFromDate(data["Дата"]) 
      data["Месяц"]=getMonthFromDate(data["Дата"])
      data["Бюджет"]=BUDGETNAME
      data["PaymentCashRegister"]=data["PaymentCashRegister"]
      data["countInBudget"]=1
     return budget.addRecord(data);
  }	catch (e) {
		logError("Ошибка при записи данных в таблицу: " + e.message + " " + e.stack);
    return false
  }

}


function addBudgetRecord_server(params) {
  try{
      // const token  = params.token;
    const data=params

    /*
        const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    */
    //budgetRecord["storeName"]=storeName

      data= JSON.parse(data)
      const sheetId=getStoreAccountByName(data.storeName)
      const budget = new BudgetRecord(sheetId);
      data["Год"]=getYearFromDate(data["Дата"]) 
      data["Месяц"]=getMonthFromDate(data["Дата"])
      data["Бюджет"]=BUDGETNAME
      data["PaymentCashRegister"]=data["PaymentCashRegister"]
      data["countInBudget"]=1
     return budget.addRecord(data);
  }	catch (e) {
		logError("Ошибка при записи данных в таблицу: " + e.message + " " + e.stack);
    return false
  }

}



function addCacheRegisterRecord(params) {
  try{
   const token  = params.token;
  var data=params.value
    if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    const sheetId=getStoreAccountById(userData.storeId)
    const budget = new BudgetRecord(sheetId);
      data= JSON.parse(data)
      // logError(data)
      data["Год"]=getYearFromDate(data["Дата"]) 
      data["Месяц"]=getMonthFromDate(data["Дата"])
      data["Бюджет"]=BUDGETNAME
      data["PaymentCashRegister"]="Касса"
      data["countInBudget"]=0
      
     return budget.addRecord(data);
  }	catch (e) {
		logError("Ошибка при записи данных в таблицу: " + e.message + " " + e.stack);
    return false
  }

}



function updateBudgetData(params) {

 try{
   const token  = params.token;
    const data=params.value
    if (!token) {
      throw new Error("Токен не передан. Доступ запрещён.");
    }
    const userContext = new UserContext();
    const userData = userContext.getUserByToken(token);
    if (!userData) {
      throw new Error("Неверный токен. Пользователь не авторизован.");
    }
    const sheetId=getStoreAccountById(userData.storeId)
    const budget = new BudgetRecord(sheetId);
   //   budget.updateRecord(data);
         budget.updateRecord(JSON.parse(data));
        return true

  }	catch (e) {
		logError("Ошибка при записи данных в бюджет: " + e.message + " " + e.stack);
    return false
  }
}








class BudgetRecord {
  constructor(sheetName) {
    this.sheetId = SHEET_BUDGET_ID; 
    this.sheetName = sheetName; 
  }

  // Получение объекта таблицы
  getSheet() {
    const spreadsheet = SpreadsheetApp.openById(this.sheetId);
    return spreadsheet.getSheetByName(this.sheetName);
  }

  // Добавление новой записи
 addRecord(record) {
  try {
    const sheet = this.getSheet();
    const data = sheet.getDataRange().getDisplayValues();
    const header = data[0]; // Получаем заголовки столбцов

    const lastRow = data.length + 1; // Определяем индекс следующей свободной строки

    let newRow = header.map((col) => record[col] || ""); // Создаём строку по заголовкам

    // Записываем новую строку в конец таблицы
    sheet.getRange(lastRow, 1, 1, newRow.length).setValues([newRow]);

    return true
  } catch (e) {
    logError("Ошибка при добавлении записи: " + e.message + " " + e.stack);
    return false
  }
}

 
updateRecord(newData) {
  try {
    const sheet = this.getSheet(); // Получаем таблицу
    const data = sheet.getDataRange().getDisplayValues(); // Загружаем все данные
    const header = data[0]; // Заголовки столбцов

    const rowIndex = parseInt(newData.id, 10); // Определяем номер строки по ID
    if (isNaN(rowIndex) || rowIndex < 2 || rowIndex > data.length) {
      logError("Некорректный ID: " + newData.id);
      return false;
    }

    const rowValues = sheet.getRange(rowIndex, 1, 1, header.length).getValues()[0]; // Получаем текущие данные строки
    let updatedRow = [...rowValues]; // Создаём копию строки

    // Обновляем только переданные поля, кроме ID
    Object.keys(newData).forEach((key) => {
      const colIndex = header.indexOf(key);
      if (colIndex !== -1 && key !== "id") {
        updatedRow[colIndex] = newData[key]; // Обновляем значение
      }
    });

    // Определяем индекс столбца ID, чтобы не перезаписывать его
    const idColumnIndex = header.indexOf("id");

    // Если индекс ID найден, удаляем его из массива перед записью
    if (idColumnIndex !== -1) {
      updatedRow.splice(idColumnIndex, 1); // Убираем ID из обновляемого массива
    }

    // Обновляем строку в Google Sheets, кроме столбца ID
    sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);

    return true;
  } catch (e) {
    logError("Ошибка при обновлении данных: " + e.message + " " + e.stack);
    return false;
  }
}







  getCashRecord() {
    const sheet = this.getSheet();
    const data = sheet.getRange("C52").getDisplayValue(); 
    return data
  }

    getBudgetRecord() {
    const sheet = this.getSheet();
    const data = sheet.getRange("53:53").getDisplayValues();

  
    return data
  }

getCashRegisterRecords(brandName,columnsToReturn) {
  const sheet = this.getSheet();
  const data = sheet.getDataRange().getDisplayValues();

  const paymentCashRegister = "Касса";

  // Задаем столбцы, которые хотим вернуть. Пример индексов.
  // Индексы можно определить, посмотрев, в каком порядке у вас идут столбцы.
  

  // Фильтруем данные
  const filteredData = data.filter((row, index) => {
    // Пропускаем заголовок
    if (index === 0) return true;
    // Фильтрация по бренду и "Кассе"
    return row[5] === brandName && row[11] === paymentCashRegister;
  });

  // Теперь отфильтруем столбцы, чтобы оставить только нужные
  const result = filteredData.map(row => columnsToReturn.map(colIndex => row[colIndex]));

  return result;
}

getBudgetRecords(brandName,columnsToReturn) {
  const sheet = this.getSheet();
  const data = sheet.getDataRange().getDisplayValues();

  const paymentCashRegister = "Бюджет";
  // Фильтруем данные
  const filteredData = data.filter((row, index) => {
    // Пропускаем заголовок
    if (index === 0) return true;
    // Фильтрация по бренду и "Кассе"
    return row[5] === brandName && row[11] === paymentCashRegister;
  });

  // Теперь отфильтруем столбцы, чтобы оставить только нужные
  const result = filteredData.map(row => columnsToReturn.map(colIndex => row[colIndex]));

  return result;
}

getVocabulary(){
    const sheet = this.getSheet();
    const data = sheet.getRange("A:G").getDisplayValues(); 
    return data


}


    // Получение всех записей
getPnLRecord(brandName) {

    const sheet = this.getSheet();
    if(sheet.getRange("A3").getValue()!=brandName) {    sheet.getRange("A3").setValue(brandName)}
    const data = sheet.getRange("D53:AA53").getDisplayValues(); 
    return data[0]  
}

  // Удаление записи по индексу
  deleteRecord(rowIndex) {
    const sheet = this.getSheet();
    sheet.deleteRow(rowIndex + 1); // Индекс начинается с 0
  }
}





function convertToReadableDate(serialDate) {
  // Нулевая дата: 1 января 1900 года
  const zeroDate = new Date(1900, 0, 1);

  // Вычесть 1 день, потому что 1900-й год считается в системе как високосный
  // (ошибка в спецификации Excel)
  const adjustedSerialDate = serialDate - 1;

  // Добавить количество дней из serialDate
  zeroDate.setDate(zeroDate.getDate() + adjustedSerialDate);

  // Вернуть в читаемом формате (например, yyyy-MM-dd)
  return zeroDate.toISOString().split('T')[0];
}






//---------------------------------------------------------------CashRegister------------------------------------------------------------------------

function getCashByStoreID(storeId) {
    const casheRegister= new CashRegister
    return casheRegister.getCashByStoreID(storeId)
}



class CashRegister {
	constructor() {
    const spreadsheet = SpreadsheetApp.openById(SHEET_BUDGET_ID);
		this.sheet = spreadsheet.getSheetByName(SHEET_CASHREGISTER_NAME);
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
	getCashByStoreID(storeId) {
		try{
    const res = this.filterColumn(0, storeId.toString());
    const cash=res.length > 0 ? res[3] : false;
   	return cash
    		} catch (e) {
			logError(e.message + " " + e.name + " " + e.stack);
		}
	}


}

















