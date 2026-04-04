(function() {
// Предотвращаем повторное определение классов при повторной загрузке страницы
class CartUI {

    constructor(totalCoast, discount, discountGeneral, deliveryCost,finalTotal, currency) {

this.DISCOUNTGENERAL=discountGeneral
this.DEFAULT_CURRENCY=currency
this.DEFAULT_DISCOUNT_GENERAL = 0
this.DEFAULT_PAYMENT_METHOD = "Cash"
this.DEFAULT_CURRENCY_AFTER_SUBMIT = "VND"
        const container = document.getElementById('order-summary-container');
        var randomId;
        
        const orderSummary = document.createElement('div');
        orderSummary.className = 'order-summary';
        orderSummary.id = 'order-summary';
       
        // Создаем блок для итоговой суммы
     
                this.finalTotalId = "finalTotalId";
                const finalTotalDiv = document.createElement('div');
                finalTotalDiv.className = 'final-total';

                // Создание строки для отображения итоговой суммы
                const totalSpan = document.createElement('span');
                totalSpan.textContent = 'Total: ';

                // Создание элемента для отображения итогового значения
                const totalValueSpan = document.createElement('span');
                totalValueSpan.id = this.finalTotalId;
                totalValueSpan.textContent = finalTotal.toFixed(0);

                // Создание элемента для отображения валюты
                const currencySpan = document.createElement('span');
                currencySpan.id = `${this.finalTotalId}-currency`;
                currencySpan.textContent = ` ${currency}`;

                // Добавление элементов в div
                finalTotalDiv.appendChild(totalSpan);
                finalTotalDiv.appendChild(totalValueSpan);
                finalTotalDiv.appendChild(currencySpan);

                // Добавление итогового блока в orderSummary
                orderSummary.appendChild(finalTotalDiv);




        this.totalCoastId = "totalCoast"
        var caption_h1 = "Sum gross"
        const orderItemsDiv = document.createElement('div');
        orderItemsDiv.className = 'order-items';
        orderItemsDiv.innerHTML = '<span>'+caption_h1+': </span><span id="' + this.totalCoastId + '">' + totalCoast.toFixed(0) + '</span>'
          orderItemsDiv.innerHTML=orderItemsDiv.innerHTML+ '<span id="' + this.totalCoastId +'-' + "currency" + '" style="margin-left: 10px"> ' + currency + '</span>'


     container.appendChild(orderSummary);
        orderSummary.appendChild(orderItemsDiv);

        // Создаем блок для скидки (если есть)
        
         var caption_h1="Discount"
         this.discountId = "discountId"
            const discountDiv = document.createElement('div');
            discountDiv.className = 'order-items';
            discountDiv.innerHTML = '<span>'+caption_h1+': </span><span id="' + this.discountId + '">' + discount.toFixed(0)+'</span>'
            orderSummary.appendChild(discountDiv);
   

     
 





      


        var inputName = "discountGeneral"
        var caption_h1 = "Discount (%)"
        var initValue = discountGeneral
        var discountaction = "discountChanged"
        var discount = createNewInput(inputName, caption_h1, initValue, discountaction, 'order-summary');
        this.discountGeneralId=inputName
        this[inputName] = discountGeneral
        orderSummary.appendChild(discount);



        var choiceName
        var choiceLabel
        var choiceCaption_h1
        var choiceList




        choiceCaption_h1 = "Payment method"
        var pmChoice = CONFIG.paymentMethodChoice || "Cash,Terminal,Transfer";
        var choiceList = pmChoice.split(',').map(s => s.trim());
        this.paymentmethodId="paymentmethod"
        var choiceField = createNewChoice(choiceList, this.paymentmethodId,"" ,null ,orderSummary.id);
        choiceField.setAttribute("onchange", 'cartUI.valueChanged(this)')
        choiceField.setclass = 'text-field__input'
        var h1Element = document.createElement('label');
        h1Element.innerHTML = '<label class="text-field__label" for="search">' + choiceCaption_h1 + '</label>'
        orderSummary.appendChild(h1Element);
        orderSummary.appendChild(choiceField);
        this[this.paymentmethodId] = choiceField.value;





        choiceCaption_h1 = "Currency"
        var currencyChoice = CONFIG.currencyChoice || "VND";
        var choiceList = currencyChoice.split(',').map(s => s.trim());
        this.currencyId="currency"
        var choiceField = createNewChoice(choiceList, this.currencyId,"" ,null ,orderSummary.id);
        choiceField.setclass = 'text-field__input'
        choiceField.setAttribute("onchange", 'cartUI.valueChanged(this)')
        var h1Element = document.createElement('label');
        h1Element.innerHTML = '<label class="text-field__label" for="search">' + choiceCaption_h1 + '</label>'
        orderSummary.appendChild(h1Element);
        orderSummary.appendChild(choiceField);
        this[this.currencyId] = choiceField.value;



       
        // Создание элемента <i>
        const tooltipIcon = document.createElement('i');
        tooltipIcon.className = 'tooltip-icon';
	           tooltipIcon.id = 'tooltip-currency-icon';
	           tooltipIcon.setAttribute("style","visibility: hidden");
	          var tooltipText =
                typeof window.localizeUiText === "function"
                  ? window.localizeUiText("Это пример подсказки", "Это пример подсказки")
                  : "Это пример подсказки";
        tooltipIcon.innerText = 'ℹ'; // Используем символ информации
        // Создание элемента подсказки
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip-text';
        tooltip.innerText = tooltipText;
        tooltip.id = 'tooltip-currency';
        // Добавляем подсказку к иконке
        tooltipIcon.appendChild(tooltip);
        orderSummary.appendChild(tooltipIcon);



        // Создаем кнопку
        const orderButton = document.createElement('button');
        orderButton.textContent = 'Register a sale';
        orderButton.setAttribute("onClick", 'makeOrder()')
        orderSummary.appendChild(orderButton);

        // Добавляем форму в контейнер




    }


    update() {
       if (typeof window !== "undefined" && typeof window.updateSale === "function") {
           window.updateSale();
           return;
       }
       if (typeof updateSale === "function") {
           updateSale();
           return;
       }
       console.error("updateSale is not defined");

    }

    discountChanged(el) {

        if (el.value > 100) {
            el.value = 100; // Если значение больше 100, устанавливаем 100
        }

      
        this[el.name] = el.value
        this.update()
    }


setTooltipCurrency(value){
    var icon = document.getElementById('tooltip-currency-icon')
       var tooltip = document.getElementById('tooltip-currency')
  if(value!="") {
  icon.setAttribute("style","visibility: visible");
   tooltip.innerText = value;
  } else {
  icon.setAttribute("style","visibility: hidden");
   tooltip.innerText = "" ;
  }
}




setCurrency(value) {
   const a = document.getElementById(this.finalTotalId +'-' + "currency")
   console.log('value1',value)
        a.innerText=' '+value
}

setCurrencyChoiceToDefault(value) {
   const a = document.getElementById( this.currencyId)
   a.selectedIndex = 0; // Сбросить выбор к первому значению
   
}

setSelectValue(selectId, desiredValue) {
  const select = document.getElementById(selectId);
  if (!select) return false;
  const idx = Array.from(select.options).findIndex((opt) => opt.value === desiredValue);
  if (idx >= 0) {
    select.selectedIndex = idx;
    return true;
  }
  return false;
}

    valueChanged(el) {
        cartUI[el.name] = el.value;
         this.update()
    }

    setDiscountGeneral(value) {
     var a = document.getElementById(this.discountGeneralId)
     if (typeof value != "undefined") {
          a.textContent = value
         a.value = value // Форматирование по русскому региону
   }else {a.textContent=0}
    }
    


    getDiscountManual() {
        var a = document.getElementById(this.discountId)
        return a.value
    }

    getTotalPrice() {
        var a = document.getElementById(this.totalCoastId)
        return a.value
    }



    getFinalPrice() {
        var a = document.getElementById(this.finalTotalId)
        return a.value
    }

    setDiscount(value) {
              var a = document.getElementById(this.discountId)
           if (typeof value != "undefined") {

        a.textContent = toLocaleStringCorrect(value); // Форматирование по русскому региону
}else {a.textContent=0}
    }

    setTotalCoast(value) {
              var a = document.getElementById(this.totalCoastId)
     if (typeof value != "undefined") {
        a.textContent = toLocaleStringCorrect(value); // Форматирование по русскому региону
   }else {a.textContent=0}
    }


    setFinalPrice(value) {
              var a = document.getElementById(this.finalTotalId)
           if (typeof value != "undefined" && (!isNaN(value))) {

        a.textContent = toLocaleStringCorrect(value); // Форматирование по русскому региону
   }else {a.textContent=0}
    }


    
    setPaymentMethodToDefault(value)
    {
            const a = document.getElementById(this.paymentmethodId)
            if (!a) return;
            if (!this.setSelectValue(this.paymentmethodId, this.DEFAULT_PAYMENT_METHOD)) {
              a.selectedIndex = 0; // fallback
            }


    }


    clear(){

            this.discountGeneral=this.DEFAULT_DISCOUNT_GENERAL
            this.setDiscountGeneral(this.DEFAULT_DISCOUNT_GENERAL)
 
            this.totalCoastGross = 0
            this.totalDiscount = 0
            this.totalCoast=0
            this.totalCoastClean = 0
            this.finalPrice = 0
            this.setPaymentMethodToDefault()
            this.paymentmethod=document.getElementById(this.paymentmethodId).value
            this.setTooltipCurrency("")
            this.setFinalPrice(cartUI.finalPrice);

            this.currency=this.DEFAULT_CURRENCY_AFTER_SUBMIT
            const currencySet = this.setSelectValue(this.currencyId, this.DEFAULT_CURRENCY_AFTER_SUBMIT);
            if (!currencySet) this.setCurrencyChoiceToDefault()
            this.currency=document.getElementById(this.currencyId).value
            this.setCurrency(this.currency)
            
       //   productTable.calculateTotalColumns()

    }


}




//------------------------------------------------------------------------------------------------------------------------------------------
class SalesTableUI {
    constructor(header) {
        try {
            this.header = [];
            this.allFieldNames = [];
            this.len = 0;
            this.price = 0;
            this.finalPrice = 0;
            this.rawData = [];
            this.editableFieldNames = [];
            this.tbody = null;
        } catch (error) {
            systemError("Error initializing SalesTableUI", error);
        }
    }

    findInResponse(raw, predicate, depth = 0) {
      if (depth > 7 || raw === undefined || raw === null) return null;
      let parsed = raw;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch (_) { return null; }
        return this.findInResponse(parsed, predicate, depth + 1);
      }
      if (predicate(parsed)) return parsed;

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const found = this.findInResponse(item, predicate, depth + 1);
          if (found) return found;
        }
        return null;
      }

      if (typeof parsed === "object") {
        const preferredKeys = ["data", "result", "payload", "values"];
        for (const key of preferredKeys) {
          if (parsed[key] !== undefined) {
            const found = this.findInResponse(parsed[key], predicate, depth + 1);
            if (found) return found;
          }
        }
        for (const v of Object.values(parsed)) {
          const found = this.findInResponse(v, predicate, depth + 1);
          if (found) return found;
        }
      }
      return null;
    }

    isContextRow(row) {
      if (!Array.isArray(row)) return false;
      let filled = 0;
      let contextLike = 0;
      row.forEach((cell) => {
        if (cell === undefined || cell === null) return;
        const s = String(cell).trim();
        if (!s) return;
        filled += 1;
        if (s === "0" || s === "1") contextLike += 1;
      });
      if (filled === 0) return false;
      return contextLike / filled >= 0.8;
    }

    header(data) {
        try {
            data = this.getHeader();
            return data;
        } catch (error) {
            systemError("Error retrieving header", error);
        }
    }

    addArticle(articleName) {
        try {
            let request = {
                googleFuncName: "getItemByArticleName",
                callbackJSfunctionName: "createNewCatalogItem",
                params: articleName
            };
            runGSfunction(request);
        } catch (error) {
            systemError("Error adding article", error);
            return false;
        }
    }
    

    createNewCatalogItem(data) {
        try {
            // Обработка ошибки вида [{ error: "articlenotfound" }]
            const maybeError = this.detectError(data);
            if (maybeError) {
              const msg = CONFIG[maybeError] || maybeError;
              showErrorPopup(msg);
              return false;
            }

            const normalized = this.normalizeItemData(data);
            if (!normalized || normalized.length < 2) {
              showErrorPopup(CONFIG.articlenotfound);
              return false;
            }
            const headers = normalized[0];
            const values = normalized[1];

            const quantityIndex = headers.indexOf("quantity");
            let quantity;
            if (quantityIndex !== -1) {
              quantity = values[quantityIndex];
            } else {
              showErrorPopup(CONFIG.noquantitycolumn);
              return false;
            }

            // Проверка на наличие остатка на складе
            if (quantity == null || quantity.toString() === "0") {
              showErrorPopup(CONFIG.outofstock);
              return false;
            } else if (quantity.toString() === "-1") {
              showErrorPopup("SYSTEM ERROR EXCEL ERROR");
              return false;
            }

            const priceIndex = headers.indexOf(CONFIG.FIELDNAME_PRICE);
            if (priceIndex !== -1) {
              values[priceIndex] = toLocaleStringCorrect(values[priceIndex]);
            }
            const discountFixIndex = headers.indexOf(CONFIG.FIELDNAME_DISCOUNTFIX);
            if (discountFixIndex !== -1) {
              values[discountFixIndex] = toLocaleStringCorrect(values[discountFixIndex]);
            }

            const mapped = [headers, values];
            const visible_article = mapFields(productTable.header, mapped);
            this.createRow(visible_article, productTable.len);
            productTable.len += 1;
            productTable.calculateTotalColumns();
            productTable.update();

            const dataObject = this.buildCatalogItemObject(headers, values);
            dataObject.id = (productTable.len - 1).toString();
            productTable.rawData.push(dataObject);
          } catch (error) {
            systemError("Error creating new catalog item", error);
          }
  }

	    normalizeItemData(raw) {
	      if (raw === undefined || raw === null) return null;

	      // Ищем матрицу данных где-то внутри возможных оберток n8n/GS/mocks
	      const matrix = this.findInResponse(raw, (val) => {
	        if (!Array.isArray(val) || val.length < 2) return false;
	        if (!Array.isArray(val[0]) || !Array.isArray(val[1])) return false;
	        // Отсекаем формат заголовка [header, visibleContext, editableContext]
	        if (this.isContextRow(val[1]) && Array.isArray(val[2]) && this.isContextRow(val[2])) return false;
	        return true;
	      });
	      if (matrix) return matrix;

	      const looksLikeItemObject = (val) => {
	        if (!val || typeof val !== "object" || Array.isArray(val)) return false;
	        if (val.quantity !== undefined) return true;
	        if (val.article !== undefined) return true;
	        if (CONFIG?.FIELDNAME_PRICE && val[CONFIG.FIELDNAME_PRICE] !== undefined) return true;
	        return false;
	      };

	      const objectArray = this.findInResponse(raw, (val) => {
	        if (!Array.isArray(val) || val.length < 1) return false;
	        return looksLikeItemObject(val[0]);
	      });
	      if (objectArray) {
	        const obj = objectArray[0];
	        const headers = Object.keys(obj);
	        const values = headers.map((h) => obj[h]);
	        return [headers, values];
	      }

	      const objectRow = this.findInResponse(raw, looksLikeItemObject);
	      if (objectRow) {
	        const headers = Object.keys(objectRow);
	        const values = headers.map((h) => objectRow[h]);
	        return [headers, values];
	      }

	      let parsed = raw;
	      if (typeof raw === "string") {
	        try { parsed = JSON.parse(raw); } catch (e) { return null; }
	      }
	      // Если уже в формате [headers, values]
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return null;
        if (Array.isArray(parsed[0])) return parsed;
        // Если массив объектов -> берем первый
        if (typeof parsed[0] === "object" && parsed[0] !== null) {
          const obj = parsed[0];
          const headers = Object.keys(obj);
          const values = headers.map((h) => obj[h]);
          return [headers, values];
        }
      }
      if (typeof parsed === "object") {
        const headers = Object.keys(parsed);
        const values = headers.map((h) => parsed[h]);
        return [headers, values];
      }
      return null;
    }

    detectError(raw) {
      const holder = this.findInResponse(raw, (val) => {
        if (!val || typeof val !== "object" || Array.isArray(val)) return false;
        return val.error !== undefined && val.error !== null && String(val.error).trim() !== "";
      });
      return holder ? holder.error : null;
    }

    buildCatalogItemObject(headers, values) {
      const normalizedHeaders = Array.isArray(headers) ? headers : [];
      const normalizedValues = Array.isArray(values) ? values : [];
      const fieldOrder =
        Array.isArray(this.allFieldNames) && this.allFieldNames.length > 0
          ? this.allFieldNames
          : normalizedHeaders;
      const item = {};

      fieldOrder.forEach((fieldName) => {
        if (!fieldName) return;
        item[fieldName] = "";
      });

      normalizedHeaders.forEach((fieldName, index) => {
        if (!fieldName) return;
        item[fieldName] = normalizedValues[index] ?? "";
      });

      return item;
    }



	    getHeader(data) {
	        try {
	            let payload = this.findInResponse(data, (val) => {
	              if (!Array.isArray(val) || val.length < 3) return false;
	              if (!Array.isArray(val[0]) || !Array.isArray(val[1]) || !Array.isArray(val[2])) return false;
	              return this.isContextRow(val[1]) || this.isContextRow(val[2]);
	            });

	            if (!payload) {
	              const obj = this.findInResponse(data, (val) => {
	                if (!val || typeof val !== "object" || Array.isArray(val)) return false;
	                const headerRow = val.header || val.headers;
	                const visibleRow = val.visibleContext || val.visible || val.contextVisible || val.context;
	                const editableRow = val.editableContext || val.editable || val.contextEditable;
	                if (!Array.isArray(headerRow) || !Array.isArray(visibleRow) || !Array.isArray(editableRow)) return false;
	                return this.isContextRow(visibleRow) || this.isContextRow(editableRow);
	              });
	              if (obj) {
	                payload = [
	                  obj.header || obj.headers,
	                  obj.visibleContext || obj.visible || obj.contextVisible || obj.context,
	                  obj.editableContext || obj.editable || obj.contextEditable,
	                ];
	              }
	            }

	            if (!payload) {
	                systemError("Error getting header", "Неверный формат данных заголовка");
	                console.error("getHeader raw ->", data);
	                return;
	            }

            productTable.editableFieldNames = [];
            productTable.allFieldNames = Array.isArray(payload[0]) ? payload[0].slice() : [];
            productTable.editableContextRaw = payload[2];
            var header = updateHeader(payload);
            productTable.header = header[0];
            productTable.visibleContext = header[1];
            productTable.editableContext = header[2];

            productTable.editableContext.forEach((v, i) => {
                if (v !== 0 && v !== "") {
                    productTable.editableFieldNames.push(productTable.header[i]);
                }
            });

            const created = createTable(productTable.header);
            productTable.tbody = created?.tbody || null;
        } catch (error) {
            systemError("Error getting header", error);
        }
    }

    async createTable() {
        try {
            const payload = {
                token: window.token,
                store: window.USER_STORE?.storeId,
                storeName: window.USER_STORE?.storeName
            };

            console.log("getHeader request ->", payload);
            const res = await API.getHeader(payload, { method: "GET", source: "n8n", webhook: "prod" });
            if (!res) {
                systemError("Error creating table", "Пустой ответ getHeader (проверь токен/формат запроса)");
                return;
            }
            this.getHeader(res);
        } catch (error) {
            systemError("Error creating table", error);
        }
    }

    clear() {
        try {
            const table = document.getElementById("flowTable");
            const tbodyEl = this.tbody || table?.querySelector("tbody");
            if (tbodyEl) {
              tbodyEl.innerHTML = "";
            }
            this.rawData = [];
            this.len = 0;
            this.totalPrice = 0;
            this.totalDiscount = 0;
            if (table) this.update();
        } catch (error) {
            systemError("Error clearing table", error);
        }
    }

    removeArticle(button) {
        try {
            const row = button.closest("tr");
            var id = row.id;
            const index = this.rawData.findIndex(obj => obj.id === id);

            if (index !== -1) {
                this.rawData.splice(index, 1);
            }

            if (row && row.parentNode) {
                row.parentNode.removeChild(row);
            }

            const rows = document.querySelectorAll("#flowTable tbody tr");
            this.len = rows.length;

            this.update();
        } catch (error) {
            systemError("Error removing article", error);
        }
    }

    update() {
        try {


            this.calculateTotalColumns();
            cartUI.update();
        } catch (error) {
            systemError("Error updating table", error);
        }
    }

    calculateTotalColumns() {
        try {
            var table = document.getElementById("flowTable");
            var rows = table.getElementsByTagName("tr");
            var headerCells = rows[0].getElementsByTagName("th");

            const priceColumnIndex = Array.from(headerCells).findIndex(cell => cell.textContent.trim() === CONFIG.FIELDNAME_PRICE);
            var discountPersColumnIndex = -1;
            var discountFixColumnIndex = -1;

            for (var i = 0; i < headerCells.length; i++) {
                if (headerCells[i].textContent.trim() === CONFIG.FIELDNAME_DISCOUNTPERS) {
                    discountPersColumnIndex = i;
                    break;
                }
            }
                   for (var i = 0; i < headerCells.length; i++) {
                if (headerCells[i].textContent.trim() === CONFIG.FIELDNAME_DISCOUNTFIX) {
                    discountFixColumnIndex = i;
                    break;
                }
            }


            if (priceColumnIndex === -1) {
                console.error("Столбец price не найден!");
            }
            if (discountPersColumnIndex === -1) {
                console.error("Столбец "+CONFIG.FIELDNAME_DISCOUNTPERS+" не найден!");
            }

            if (discountFixColumnIndex === -1) {
                console.error("Столбец "+CONFIG.FIELDNAME_DISCOUNTFIX+" не найден!");
            }

            var totalDiscount = 0;
            var totalPrice = 0;

            for (var i = 1; i < rows.length; i++) {
                var cells = rows[i].getElementsByTagName("td");
                var priceText = cells[priceColumnIndex]?.textContent.replace(/&nbsp;/g, " ").replace(/\s/g, "").replace(",", ".") || "0";
                var priceValue = parseFloatCorrect(priceText);

                var discountPersText =  cells[discountPersColumnIndex]?.textContent.replace(/&nbsp;/g, " ").replace(/\s/g, "").replace(",", ".") || "0";
                var discountPersValue = parseFloatCorrect(discountPersText);
                
                var discountFixText = cells[discountFixColumnIndex]?.textContent.replace(/&nbsp;/g, " ").replace(/\s/g, "").replace(",", ".") || "0";
                var discountFixValue = parseFloatCorrect(discountFixText);

                totalPrice += !isNaN(priceValue) ? priceValue : 0;
                totalDiscount += !isNaN(discountPersValue) ? (priceValue * discountPersValue) / 100 : 0;
                totalDiscount += !isNaN(discountFixValue) ? discountFixValue : 0

                console.log('totalPrice',totalPrice)
                console.log('totalDiscount',totalDiscount)
            }

            productTable.totalPrice = totalPrice;
            productTable.totalDiscount = totalDiscount;
        } catch (error) {
            systemError("Error calculating total columns", error);
        }
    }

    updateValueOfCell(cell) {
        try {
    
            if (cell.querySelector("input")) return;

            const currentPrice = cell.textContent.trim();
            const input = document.createElement("input");
            input.type = "text";
            input.value = currentPrice;
            input.style.width = "150px";

            cell.appendChild(input);

            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);

            input.addEventListener("blur", function() {
                cell.textContent = input.value.trim() || "";

            let value = parseFloatCorrect(cell.textContent); // Преобразуем текст в число
            if (!isNaN(value)) { // Проверяем, получилось ли число
                cell.textContent = toLocaleStringCorrect(value);
            }

                productTable.update();
            });

            input.addEventListener("keydown", function(event) {
                if (event.key === "Enter") input.blur();
            });
        } catch (error) {
            systemError("Error updating cell value", error);
        }
    }

    createRow(rowData, index) {
        try {
            var row = document.createElement('tr');
            row.className = 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600';
            row.id = index;

            for (let k in rowData) {
                var td = document.createElement('td');
                td.id = "td_" + k;
                td.className = 'px-6 py-4';
                 var cellValue=rowData[k]
                td.innerText = cellValue;
                if (isEditable(k)) {
                    td.setAttribute('onclick', 'productTable.updateValueOfCell(this)');    
                  //   td.setAttribute("style", 'width: 100%;    height: 30px;    border: 1px black solid;    float: left;')
                }
                row.appendChild(td);
            }

            var actionTd = document.createElement('td');
            actionTd.className = 'flex items-center px-6 py-4';

            var removeLink = document.createElement('button');
            removeLink.id = "remove_" + index;
            removeLink.className = 'font-medium text-red-600 dark:text-red-500 hover:underline ms-3';
            removeLink.setAttribute('onclick', 'productTable.removeArticle(this)');
            removeLink.innerHTML = '<img src="../vendor/icons/remove.png" title="Remove" style="width: 20px; ">'

            actionTd.appendChild(removeLink);
            row.appendChild(actionTd);
            const tbodyEl = this.tbody || document.querySelector("#flowTable tbody");
            if (!tbodyEl) {
              console.error("tbody для flowTable не найден");
              return;
            }
            tbodyEl.appendChild(row);
        } catch (error) {
            systemError("Error creating row", error);
        }
    }
}


//--------------------------------------------------------------------------------------------------------------------------

function isEditable(columnNumber) {
  return (productTable.editableContext[columnNumber] == 1)
}

function createTable(header) {


  // Создаем основной контейнер div
var container = document.createElement('div');
container.className = 'relative overflow-x-auto shadow-md sm:rounded-lg';

// Создаем таблицу
var table = document.createElement('table');
table.id="flowTable"
table.className = 'w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400';

// Создаем thead элемент
var thead = document.createElement('thead');
thead.id="thead"
thead.className = 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400';

// Создаем строку заголовков
var headerRow = document.createElement('tr');


for (var k=0; k < header.length;k++) {
    var th = document.createElement('th');
    th.scope = 'col';
    th.className = 'px-6 py-3';
    th.textContent = header[k];
    headerRow.appendChild(th);
};

thead.appendChild(headerRow);
table.appendChild(thead);

// Создаем tbody (важно: НЕ хранить глобально, иначе строки "живут" между переходами по вкладкам)
var tbody = document.createElement('tbody');
table.appendChild(tbody);
container.appendChild(table);
var productlist=document.getElementById('product-list')
if (!productlist) {
  console.error("Не найден контейнер #product-list для таблицы продаж");
  return { table, tbody, container };
}
productlist.textContent = "";
productlist.appendChild(container);
return { table, tbody, container };

}

//------------------------------------------------------------------------------------------------------------------------------------------


class Basket {
	constructor() {

	}


	addData(name, value) {
	this[name]=value
	}



}









//------------------------------------------------------------------------------------------------------------------------------------


class SalesManager {
    constructor() {
        try {
            this.values = this.getCartItems(); // Корзина
          //  console.log("getCartItems",this.values )
        

                function parseFloatCorrect(str) {
                  return parseFloat(String(str).replace(/\s+/g, ''));
                }
                        function getValidNumber(value) {
                  // Проверяет значение и возвращает 0, если оно null, undefined или пустая строка
                  return parseFloatCorrect(value == null || value.trim() === "" ? "0" : value);
                }


                   function calculatefinalPrice(priceVND, currency, exchangeRate) {
                    if (priceVND !== "") { // Проверяем, если значение в колонке W (finalPrice) не пустое
                        if (currency !== "VND") { // Проверяем, если валюта не "VND"
                            return priceVND * exchangeRate; // Возвращаем результат деления finalPrice на exchangeRate
                        } else {
                            return priceVND; // Если валюта "VND", возвращаем finalPrice
                        }
                    }
                    return 0; // Если значение в колонке W пустое, возвращаем пустую строку
                }


              this.values.forEach(s => {
                // Проверяем и получаем корректные значения скидок и цены
                const price = parseFloatCorrect(s.price);
                
                const discountPercent = getValidNumber(s[CONFIG.FIELDNAME_DISCOUNTPERS]);
                const discountFix = getValidNumber(s[CONFIG.FIELDNAME_DISCOUNTFIX]);
                


                // Вычисляем финальную цену с учетом скидок и добавляем нужные поля в объект `s`
                console.log("finalPriceVND -1",s['finalPriceVND'])
                s['finalPriceVND'] = parseFloatCorrect(minusPercent(price, discountPercent)) - discountFix;
              //  console.log("1",s['finalPriceVND'])
               console.log("finalPriceVND 0",s['finalPriceVND'])
               console.log("discountGeneral",parseFloatCorrect(cartUI.discountGeneral))
                s['finalPriceVND']=parseFloatCorrect(minusPercent(s['finalPriceVND'], parseFloatCorrect(cartUI.discountGeneral))) 
                console.log("finalPriceVND 1",s['finalPriceVND'])

                s['finalPrice']=calculatefinalPrice( s['finalPriceVND'], cartUI.currency, cartUI.curs)
             //   console.log(" s['finalPrice']",s['finalPrice'])
                console.log("finalPriceVND 2",s['finalPriceVND'])

                Object.assign(s, {
                  curs: cartUI.curs,
                  currency: cartUI.currency,
                  paymentmethod: cartUI.paymentmethod,
                  username: cartUI.username
                });
              });

        } catch (error) {
            systemError("Error initializing SalesManager", error);
        }
    }

    getCartItems() {
        try {
            const rows = document.querySelectorAll('#flowTable tbody tr'); // Получаем все строки товаров, которые находятся на странице
            var items = [];

            rows.forEach(row => {
                if (document.contains(row)) { // Проверяем, что элемент все еще находится в DOM
                    const cells = row.querySelectorAll('td'); // Получаем все ячейки в строке
                    var article = {};
                    for (var k = 0; k < productTable.header.length; k++) {
                        if (cells[k]) { // Проверяем, что ячейка существует
                            article[productTable.header[k]] = cells[k].textContent.trim();
                        }
                    }

                    items.push(article);
                }
            });

            return items; // Возвращаем массив объектов
        } catch (error) {
            systemError("Error retrieving cart items", error);
            return []; // Возвращаем пустой массив в случае ошибки
        }
    }

    updateProductData(rawData, values) {
        try {
            const updatedData = rawData.map((product, index) => {
                const s = values[index]; // Берем соответствующий объект из sales

                if (s) {
                    // Обновляем поля только если они присутствуют в sale
                    for (const key in s) {
                        product[key] = s[key];
                    }
                }

                return product; // Возвращаем обновленный продукт
            });

            const normalizedData = this.normalizeSaleItems(updatedData);
            this.values = normalizedData; // Обновляем свойство sales
            return normalizedData; // Возвращаем обновленные данные
        } catch (error) {
            systemError("Error updating product data", error);
            return rawData; // Возвращаем исходные данные в случае ошибки
        }
    }

    appendUniqueKeys(target, seen, keys) {
        if (!Array.isArray(target) || !(seen instanceof Set) || !Array.isArray(keys)) return;
        keys.forEach((key) => {
            if (key === undefined || key === null) return;
            const normalizedKey = String(key).trim();
            if (!normalizedKey || seen.has(normalizedKey)) return;
            seen.add(normalizedKey);
            target.push(normalizedKey);
        });
    }

    getSaleSchema(items) {
        const schema = [];
        const seen = new Set();
        const baseFields = [
            ...(Array.isArray(productTable?.allFieldNames) ? productTable.allFieldNames : []),
            ...(Array.isArray(productTable?.header) ? productTable.header : []),
            "id",
            "finalPriceVND",
            "finalPrice",
            "curs",
            "currency",
            "paymentmethod",
            "username",
            "date",
            "time",
            "basketid",
            "store",
            "storeId",
            "sheetName_sklad",
            "sheetName_accounting"
        ];

        this.appendUniqueKeys(schema, seen, baseFields);

        if (Array.isArray(items)) {
            items.forEach((item) => {
                if (!item || typeof item !== "object" || Array.isArray(item)) return;
                this.appendUniqueKeys(schema, seen, Object.keys(item));
            });
        }

        return schema;
    }

    normalizeSaleItems(items) {
        if (!Array.isArray(items)) return [];
        const schema = this.getSaleSchema(items);
        return items.map((item) => {
            const source = item && typeof item === "object" && !Array.isArray(item) ? item : {};
            const normalizedItem = {};

            schema.forEach((fieldName) => {
                normalizedItem[fieldName] = source[fieldName] ?? "";
            });

            return normalizedItem;
        });
    }

    createBasket(basket) {
        try {
            this.basket = [];
            this.basket.push(basket);
        } catch (error) {
            systemError("Error creating basket", error);
        }
    }

    async submitSales() {
        try {
            var sendData = {};

            var date = getCurrentDate();
            var time = getCurrentTime();
            const basketId = this.generateBasketId();

            // Подтягиваем stores (нужно для названия склада/бюджета и доп. контекста)
            let stores = Array.isArray(window.STORES_CACHE) ? window.STORES_CACHE : null;
            if (!Array.isArray(stores) || stores.length === 0) {
              try {
                if (window.API && typeof window.API.getStores === "function") {
                  stores = await window.API.getStores({ token: window.token }, { source: "n8n", webhook: "prod" });
                }
              } catch (e) {
                console.warn("getStores failed while submitting sale", e);
              }
            }
            if (!Array.isArray(stores)) stores = [];

            const userStoreId = window.USER_STORE?.storeId ?? window.USER_STORE?.id ?? window.USER_STORE?.store;
            const userStoreName = window.USER_STORE?.storeName ?? window.USER_STORE?.name;

            let selectedStore = null;
            const numericId = Number(userStoreId);
            if (Number.isFinite(numericId)) {
              selectedStore = stores.find((s) => Number(s?.storeId ?? s?.id ?? s?.[0]) === numericId) || null;
            }
            if (!selectedStore && userStoreName) {
              const nameLower = String(userStoreName).trim().toLowerCase();
              selectedStore =
                stores.find((s) => String(s?.storeName || "").trim().toLowerCase() === nameLower) || null;
            }
            if (!selectedStore && stores.length === 1) {
              selectedStore = stores[0];
            }

            const storeNameToSend = selectedStore?.storeName || userStoreName;
            const storeIdToSend = selectedStore?.storeId || userStoreId;
            const sheetNameSklad = selectedStore?.sheetName_sklad || window.USER_STORE?.sheetName_sklad;
            const sheetNameAccounting = selectedStore?.sheetName_accounting || window.USER_STORE?.sheetName_accounting;

            this.values.forEach(item => {
                item.date = date;
                item.time = time;
                item.basketid = basketId;
                if (storeNameToSend) item.store = storeNameToSend;
                if (storeIdToSend) item.storeId = storeIdToSend;
                if (sheetNameSklad) item.sheetName_sklad = sheetNameSklad;
                if (sheetNameAccounting) item.sheetName_accounting = sheetNameAccounting;
            });

            // Подготовим basket локально (не отправляем в n8n, но сохраняем контекст)
            if (this.basket && this.basket[0]) {
              this.basket[0].date = date;
              this.basket[0].time = time;
              this.basket[0].basketid = basketId;
              if (storeNameToSend) this.basket[0].store = storeNameToSend;
              if (storeIdToSend) this.basket[0].storeId = storeIdToSend;
              if (sheetNameSklad) this.basket[0].sheetName_sklad = sheetNameSklad;
              if (sheetNameAccounting) this.basket[0].sheetName_accounting = sheetNameAccounting;
            }

            this.values = this.normalizeSaleItems(this.values);
            this.values = convertValuesToString(this.values);
            if (this.basket) {
              this.basket = convertValuesToString(this.basket);
            }

            // В каждый sale добавляем полный результат getStores (объектами, не строкой)
            if (Array.isArray(stores) && stores.length > 0) {
              this.values.forEach((sale) => {
                sale.stores = stores;
              });
            }

            sendData.sales = this.values;
            if (storeNameToSend) {
              sendData.store = storeNameToSend;
            }
            sendData.basketid = basketId;

            console.log("Sending data:", sendData);
            let request = {
                googleFuncName: "sendSalesToSheet",
                callbackJSfunctionName: "sendSalesToSheet_done",
                params: sendData
            };
            runGSfunction(request);
        } catch (error) {
            systemError("Error submitting sales data", error);
        }
    }

    generateBasketId() {
        // UUID v4
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}




// Глобальные обработчики
window.discountChanged = function(el) {
    if (window.cartUI && typeof window.cartUI.discountChanged === "function") {
        window.cartUI.discountChanged(el);
    }
};

window.removeRow = function(element) {
  const row = element.closest('tr');
  if (row && row.parentNode) {
    row.parentNode.removeChild(row);
  }
};

// Экспорт классов (создаются один раз)
window.CartUI = window.CartUI || CartUI;
window.SalesTableUI = window.SalesTableUI || SalesTableUI;
window.Basket = window.Basket || Basket;
window.SalesManager = window.SalesManager || SalesManager;

})();
    
