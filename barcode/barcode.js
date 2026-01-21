
  var printSRC = "../vendor/icons/print.png";
//WEBHOOK = 'https://buttonrouge.org/n8n/webhook/';
const endP = 'tags';

// Глобальная конфигурация типов ценников
let LABEL_TYPES = {}




function getProductData(productPrint, config) {
  if (!productPrint) return null;
const barcodeEl = productPrint.querySelector('.barcode-box');
  const productInfo = productPrint.querySelector('.product-info');
  if (!productInfo) return null;
  const result = {};

for (const field of config.fields) {
    const child=productInfo.querySelector('.product-'+field.key)
    result[field.key] = child.textContent;
}


        result["barcodeValue"]= barcodeEl.textContent.trim()
  return result;
}

    
let selectedProductId = null;
let selectedProduct = null;


async function init() {
  try {
    const elName = "articleName";
    const caption_h1 = "Article:";
    const initValue = "";
    const action = "addArticle";
    const target = "content";

    const query = { action: "getConfig", visible: true, TESTING: CONFIG.GLOBAL_EXECUTION_TESTING };
    const params = { data: { query } };
    const data = await getDataFromN8n(endP, params);
    LABEL_TYPES = typeof data === "string" ? JSON.parse(data) : (data || {});

    createNewInputWithButton(elName, caption_h1, initValue, action, target);
    makeFocus(elName);
  } catch (error) {
    console.error("Barcode init error:", error);
    showErrorPopup("Произошла ошибка. Перезагрузите страницу");
    return;
  }



//addArticle();


  document.addEventListener('click', (event) => {
    const productPrint = event.target.closest('#products .product-print');
    if (!productPrint) return;
    document.getElementById("edit").setAttribute("style","visibility: visible;")
    if (selectedProductId) {
      const prevSelected = document.getElementById(selectedProductId);
      
      if (prevSelected) {
        prevSelected.style.border = '';
        prevSelected.removeAttribute('id');
      }
    }
    const newId = 'product-print-' + Date.now();
    productPrint.id = newId;
    productPrint.style.border = '3px solid red';

    selectedProductId = newId;
    selectedProduct = productPrint;
  });

  const editBtn = document.getElementById('edit');
  if(editBtn){
    editBtn.addEventListener('click', () => {
      if(!selectedProduct){
        alert('Сначала выделите ценник!');
        return;
      }
      const labelKey = selectedProduct.getAttribute("data-label");
      if(!labelKey || !LABEL_TYPES[labelKey]){
        alert('Тип ценника не найден');
        return;
      }
      const labelType = LABEL_TYPES[labelKey];
     // const productData1 = getProductData(selectedProduct, labelType);

      let productData=JSON.parse(selectedProduct.getAttribute('product-data'))
      productData.barcodeValue=productData.article


      const demoRoot = document.getElementById('edit-root');

      openLabelEditor(labelType, {
        data: productData,
        onSave(updated){

          LABEL_TYPES[updated.id] = updated;
            if (selectedProduct) {
               updateLabelForElement(selectedProduct, updated);
               document.getElementById("save").setAttribute("style", "visibility: visible;")
              }
        },
        onCancel(){
          console.log('Редактирование отменено'); 
        }
      });
    });
  }

  const saveBtn = document.getElementById('save');
 if(saveBtn){
    saveBtn.addEventListener('click', async () => {  
     // const labelType = LABEL_TYPES; 
    try {

    
      const resp = await postDataToN8n(
        `${endP}?action=saveChanges`,
        { 
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(LABEL_TYPES)
        }, 
        8000
      );
        if (!resp.ok) throw new Error(await resp.text());
        showToast('Изменения успешно сохранены!','success');
        document.getElementById("save").setAttribute("style", "visibility: hidden;")
    } catch(err) {
      showToast(`Ошибка: ${err.message}`,'error');
    }


      })       
        }
      
 }


function updateLabelForElement(element, updatedConfig) {
  // Попробуйте сначала взять актуальное product-data:
  let productData = null;
 productData = JSON.parse(element.getAttribute('product-data'));

console.log("productData",productData)
  // Актуализируем productData, если появились новые поля
  updatedConfig.fields.forEach(field => {
    if (field.key && !(field.key in productData)) {
      productData[field.key] = '';
    }

  });

  // Сохраняем новые product-data
  element.setAttribute('product-data', JSON.stringify(productData));

  // Полностью пересоберите DOM-содержимое
  element.innerHTML = generateLabelContent(productData, updatedConfig);

  // Верните кнопки, barcode и другие динамические части
  addPrintButton(element, productData, updatedConfig);
  addBarcode(element, productData.article, updatedConfig);

  // (Если надо — восстановите рамку выделения)
  element.style.border = '3px solid red';
}




/**
 * Универсальная функция генерации ценника
 */
function generateLabel(article, container, labelType) {
  try {
    const config = LABEL_TYPES[labelType];
    if (!config) {
      console.error(`Unknown label type: ${labelType}`);
      return;
    }

    const art = returnArticleAsObject(article[0], article);
    const brand = createLabelElement(config, art);
    brand.setAttribute('product-data', JSON.stringify(art))
    brand.innerHTML = generateLabelContent(art, config);
    
    container.appendChild(brand);

    addPrintButton(brand, art, config);
    addBarcode(brand, art.article, config);

    return brand;
  } catch (error) {
    systemError(`Ошибка генерации ценника (${labelType})`, error);
  }
}


function updateLabel(labelType) {
  try {
    const config = LABEL_TYPES[labelType];
    if (!config) {
      console.error(`Unknown label type: ${labelType}`);
      return;
    }
  const brand = document.querySelector(`div[data-label="${labelType}"]`);

  const data=brand.getAttribute('product-data')
  
    brand.innerHTML = generateLabelContent(JSON.parse(data), config);
  } catch (error) {
    systemError(`Ошибка обновления ценника (${labelType})`, error);
  }
}



/**
 * Создает HTML-элемент ценника
 */
function createLabelElement(config, product) {
  const brand = document.createElement('div');
  brand.className = "product-print";
  brand.setAttribute('data-label', config.id)
  
  // Устанавливаем размеры
  Object.assign(brand.style, {
    width: config.dimensions.width,
    height: config.dimensions.height,
    minWidth: config.dimensions.width,
    minHeight: config.dimensions.height,
    maxWidth: config.dimensions.width,
    maxHeight: config.dimensions.height,
    position: 'relative'
  });

  // Генерируем и добавляем содержимое
  brand.innerHTML = generateLabelContent(product, config);
  return brand;
}

/**
 * Генерирует HTML-содержимое ценника
 */
function generateLabelContent(product, config) {
  const fieldsContent = config.fields.map(field => {
    if (field.type === 'spacer') {
      return `<div class="spacer" style="height:${field.height}"></div>`;
    }

        if (field.type === 'custom') {
      return `<div class="${field.key ? 'product-' + field.key : ''}" style="${field.style || ''}">${field.text}</div>`;
    }

    let content = '';
    if (field.key) {
      const rawValue = product[field.key];
      content = (field.process && window[field.process] && typeof window[field.process] === 'function')
        ? window[field.process](rawValue)
        : rawValue;

      if (content === null || content === undefined) {
        content = ''; // если поле отсутствует в продукте - делаем пустой контент
      }

      // Добавляем prefix/postfix
      if (field.prefix) content = field.prefix + content;
      if (field.postfix) content = content + field.postfix;




    }

    // Всегда возвращаем элемент, даже если content пустой строкой
    return `<${field.tag || 'div'} style="${field.style || ''}" class="${field.key ? 'product-' + field.key : ''}">${content}</${field.tag || 'div'}>`;
  }).join('');
  

  return `<div class="product-info label-${config.pdfSize.join('x')}">${fieldsContent}</div>`;
}



/**
 * Добавляет кнопку печати на ценник
 */
function addPrintButton(element, product, config) {
  const btn = document.createElement('div');
  btn.innerHTML = `<button class="print-btn"><img src="${printSRC}" alt="Print Icon"></button>`;
  Object.assign(btn.style, {
    position: 'absolute',
    top: '5px',
    right: '5px',
    zIndex: '10'
  });
  element.appendChild(btn);

  btn.onclick = () => printLabel(element, product, config);
}

/**
 * Добавляет штрих-код на ценник
 */

/**
 * Рисуем штрих-код в пределах контейнера ценника
 * @param {HTMLElement} element  - куда добавляем контейнер и svg
 * @param {Object} product       - объект товара (берём article или barcode)
 * @param {Object} config        - ваша структура (ожидает config.barcode)
 * @param {string} [valueField='article'] - из какого поля брать значение
 * @returns {SVGSVGElement|null}
 */
function addBarcode(element, value, config) {

  if (!config || !config.barcode || !element) return null;

  const bc = config.barcode;


  // Пример использования
const styleStr =bc.style

const parsedStyle=parseStyleString(styleStr);

  const barContainer = document.createElement("div");

  barContainer.style=bc.style


  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  barContainer.appendChild(svg);
barContainer.setAttribute("data-field-index","barcode" )
barContainer.className="barcode-box"
barContainer.setAttribute("data-field-value",value )
  element.appendChild(barContainer);

  // Высота JsBarcode — в px
  let jsbHeight = parsedStyle.height || '0.5cm';
  if (typeof jsbHeight === 'string' && jsbHeight.endsWith('cm')) {
    jsbHeight = cmToPx(jsbHeight.replace('cm', ''));
  } else {
    jsbHeight = parseInt(jsbHeight, 10) || 50;
  }

/*
let jsbWidth = parsedStyle.width || '3.5cm';
if (typeof jsbWidth === 'string' && jsbWidth.endsWith('cm')) {
  jsbWidth = cmToPx(jsbWidth.replace('cm', ''));
} else {
  jsbWidth = parseInt(jsbWidth, 10) || 200; // или другое значение по умолчанию
}
*/




  if (!value) {
    console.warn('Barcode value is empty');
  }

  // <-- КЛЮЧЕВАЯ РАЗНИЦА: передаём сам svg-элемент, а не селектор!
  JsBarcode(svg, value, {
    className:"barcode-text",
    format: bc.format || "CODE128",
    lineColor: bc.lineColor || "#000",
    displayValue: bc.displayValue !== false,
    textPadding: bc.textPadding ?? -10,
    fontSize: parsedStyle["font-size"] ?? 20,
    font: bc.font || "monospace",
    height: jsbHeight,
     // width: jsbWidth,
    margin: bc.margin ?? 0,
  });

  return barContainer;
}



function printLabel(element, product, config) {
  const btn = element.querySelector('.print-btn');
  btn.style.visibility = 'hidden';

       console.log("element",element)
        element.style.border = '';

  // Размеры PDF в мм (из config)
  const pdfWidthMm = config.pdfSize[1]; // 40mm
  const pdfHeightMm = config.pdfSize[0]; // 80mm
  
  // Конвертируем мм в пиксели (96 DPI: 1mm ≈ 3.78px)
  const pdfWidthPx = pdfWidthMm * 3.78;
  const pdfHeightPx = pdfHeightMm * 3.78;
  
  // Получаем текущие размеры элемента
  const elementWidth = element.clientWidth;
  const elementHeight = element.clientHeight;
  
  // Вычисляем масштаб для вписывания в PDF
  const widthScale = pdfWidthPx / elementWidth;
  const heightScale = pdfHeightPx / elementHeight;
  const scale = Math.min(widthScale, heightScale);
  
  // Вычисляем новые размеры с сохранением пропорций
  const newWidth = elementWidth * scale;
  const newHeight = elementHeight * scale;
  
  // Координаты для центрирования
  const xOffset = (pdfWidthPx - newWidth) / 2;
  const yOffset = (pdfHeightPx - newHeight) / 2;

  // Увеличиваем качество (рендерим в 4 раза больше, затем уменьшаем)
  const qualityScale = 4;
  
  domtoimage.toBlob(element, {
    width: elementWidth * qualityScale,
    height: elementHeight * qualityScale,
    style: {
      transform: `scale(${qualityScale})`,
      transformOrigin: 'top left',
      width: `${elementWidth}px`,
      height: `${elementHeight}px`
    }
  }).then(blob => {
    const reader = new FileReader();
    reader.onloadend = function() {
      window.jsPDF = window.jspdf.jsPDF;
      const orientation = pdfHeightMm > pdfWidthMm ? 'p' : 'l';
      const pdf = new jsPDF(orientation, 'mm', [pdfHeightMm, pdfWidthMm]);
      
      const base64String = reader.result.split(',')[1];
      
      // Добавляем изображение с правильным масштабированием
      pdf.addImage(
        base64String, 
        'PNG',
        xOffset / 3.78, // конвертируем обратно в мм
        yOffset / 3.78,
        newWidth / 3.78,
        newHeight / 3.78
      );
      
     // pdf.save(`${product.Name}_${product.article}_${pdfWidthMm}x${pdfHeightMm}.pdf`);


      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const printWindow = window.open(pdfUrl);
      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
      };





    };
    reader.readAsDataURL(blob);
  }).catch(error => {
    systemError("Ошибка формирования изображения для печати", error);
  }).finally(() => {
    btn.style.visibility = 'visible';
  });
}
/**
 * Обработчик добавления статьи
 */
function addArticle() {
  const inp = document.getElementById("articleName");
  if (!inp || inp.value === "") {
    showErrorPopup(CONFIG.articlenotfound);
    return;
  }

  const articleName = inp.value;
  const request = {
    googleFuncName: "getItemByArticleName",
    params: articleName
  };

  getDataFromServer(request)
    .then((data) => {
      console.log(data)
      const article = data[0];
      if (!article || article.length <= 1) {
        showErrorPopup(CONFIG.articlenotfound);
        return false;
      }

      const container = document.createElement('div');
      container.id = "tags";
      container.className = "tags";
      document.getElementById("products").prepend(container);

      setTimeout(() => container.classList.add('visible'), 50);

      // Генерация всех типов ценников
      Object.keys(LABEL_TYPES).forEach(type => {
        generateLabel(article, container, type);

      });
    })
    .catch((error) => {
      systemError("Ошибка получения данных с сервера", error);
    });
}

/**
 * Форматирует текст с переносами строк
 */
function formatMultilineText(text) {
  return text && text.includes(',') ? text.split(',').join('<br>') : text;
}




/*************************************************
 * Utility: deep clone (structuredClone polyfill)
 *************************************************/
function deepClone(obj){
  if (window.structuredClone) return window.structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

/*************************************************
 * Example data to populate fields when rendering
 *************************************************/


/*************************************************
 * Processors (formatters) referenced by structure
 *************************************************/


/*************************************************
 * Base template structure (you can have multiple)
 * NOTE: pdfSize intentionally width/height reversed due
 * to PDF libraries expecting [w,h] in some orientation; adjust as needed.
 *************************************************/

/*************************************************
 * Render a label instance into a container
 * @param {Object} template - label structure object
 * @param {Object} data - product data values
 * @param {HTMLElement} mountEl - container element to receive label
 * @param {Boolean} forEditor - if true we add data-field-index etc
 *************************************************/
function renderLabel(template, data, mountEl, forEditor=true){
  mountEl.innerHTML = '';
  const {width, height} = template.dimensions;
  const labelEl = document.createElement('div');
  labelEl.className = 'product-print';
  // В editor режиме `.product-print` должен быть containing block для абсолютных полей.
  // Ставим инлайном, чтобы не зависеть от каскада/кэша CSS.
  labelEl.style.position = 'relative';
  labelEl.style.width = width;
  labelEl.style.height = height;
  labelEl.style.minWidth = width;
  labelEl.style.minHeight = height;
  labelEl.style.maxWidth = width;
  labelEl.style.maxHeight = height;

  const infoEl = document.createElement('div');
  infoEl.className = 'product-info label-'+template.id + (forEditor?' edit-mode':'');

  // field elements
  template.fields.forEach((fld,idx)=>{
    const el = document.createElement(fld.tag || 'div');
    el.className = (fld.className||'') + ' field-el';
    el.setAttribute("data-prefix",fld.prefix )
    el.setAttribute("data-postfix",fld.postfix )
    //if (fld.type === 'spacer') el.classList.add('spacer');
  

    if (fld.type !== 'spacer') {

      
      let val = (data && data[fld.key] != null) ? data[fld.key] : '';
        if (typeof fld.process === 'string' && typeof window[fld.process] === 'function') {
          el.innerHTML = window[fld.process](val);
        } else {
          el.textContent = val;
        }

    if (fld.prefix) el.textContent = fld.prefix + el.textContent;
    if(fld.postfix) el.textContent = el.textContent + fld.postfix;
      

 /*    
      let rawVal = el.textContent
      let displayVal = rawVal;


       
      let originalVal = stripPrefixPostfix(rawVal, fld.prefix, fld.postfix);
      console.log("+++content++++",rawVal )

      


  // Формируем новое значение
  let displayVal = originalVal;

  // Добавляем prefix/postfix с экранированием пробелов
  if (fld.prefix || fld.postfix) {
    displayVal = fld.prefix + displayVal;
    displayVal = displayVal + fld.postfix;
  }


*/
  
     // el.setAttribute("style", fld.style)
/*
      if (fld.prefix) val = fld.prefix + val;

              if (fld.postfix) val = val + fld.postfix;
        if (typeof fld.process === 'string' && typeof window[fld.process] === 'function') {
          el.innerHTML = window[fld.process](val);
        } else {
          el.textContent = val;
        }


*/
    } else {
      el.innerHTML = '&nbsp;';
    }

    if (forEditor){
      el.dataset.fieldIndex = idx;
    }
    infoEl.appendChild(el);

// Ждём браузерный рендер
requestAnimationFrame(() => {
    applyStyleString(el, fld.style);
});




  });

  /* barcode placeholder
  const bcEl = document.createElement('div');
  bcEl.className = 'barcode-box' + (forEditor? ' edit-mode':'');
  applyStyleString(bcEl, template.barcode?.style || '');
  if (forEditor) bcEl.dataset.barcode = '1';

  // simple fake barcode rendering for demo; integrate JsBarcode or other later
*/

/*
  //  const bcEl=labelEl.querySelector('.barcode-box');
    if(bcEl){
      const pctObj=pxToPercentStyles(bcEl);
      const computed=window.getComputedStyle(bcEl);
      pctObj['font-size']=computed.fontSize;
      working.barcode.style=styleObjectToString(pctObj);
      working.barcode.fontSize=extractPx(computed.fontSize);
    }
*/
    mountEl.appendChild(labelEl);

   // addBarcode(brand, art, config);
   console.log("data",data)
addBarcode(labelEl, data.barcodeValue, template); // или другой ключ шаблона



/*
  const bcText = document.createElement('div');
  bcText.className = 'barcode-text';
  bcText.textContent = data?.barcodeValue || '';
  bcEl.appendChild(bcText);
*/

  labelEl.appendChild(infoEl);
 // labelEl.appendChild(bcEl);







  // print button (only when not in editor)
  if(!forEditor){
    const btnWrap = document.createElement('div');
    btnWrap.style.cssText='position:absolute;top:5px;right:5px;z-index:10;';
    const btn = document.createElement('button');
    btn.className='print-btn';
    btn.innerHTML = '<img src="' + printSRC + '" alt="Print Icon">';
    btn.addEventListener('click',()=>{
        labelEl.style.border = '';
          window.print()
        }
    );
    btnWrap.appendChild(btn);
    labelEl.appendChild(btnWrap);
  }


  return labelEl;
}

/*************************************************
 * Style helpers: parse & apply style string
 *************************************************/
function parseStyleString(str){
  const out={};
  if(!str) return out;
  str.split(';').forEach(part=>{
    const [k,v]=part.split(':').map(s=>s&&s.trim());
    if(k&&v!=null) out[k]=v;
  });
  return out;
}
function styleObjectToString(obj){
  return Object.entries(obj).map(([k,v])=>`${k}:${v}`).join(';');
}

function applyStyleString(el, str) {
  const obj = parseStyleString(str);
   for (const [k, v] of Object.entries(obj)) {
    el.style.setProperty(k, v);
  }
  if (!('position' in obj)) el.style.position = 'absolute';
}


/*************************************************
 * Constrain element to parent bounds (px) & optionally grid snap
 *************************************************/
function constrainToParent(el, grid=true){
  const parent=el.parentElement?.closest('.product-print')||el.parentElement;
  if(!parent) return;
  const r=parent.getBoundingClientRect();
  const er=el.getBoundingClientRect();
  let left=er.left-r.left;
  let top=er.top-r.top;
  let w=er.width;
  let h=er.height;
  // clamp
  if(left<0) left=0;
  if(top<0) top=0;
  if(left+w>r.width) left=r.width-w;
  if(top+h>r.height) top=r.height-h;
  if(grid){
    const g=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-gap'))||1;
    left=Math.round(left/g)*g;
    top=Math.round(top/g)*g;
    w=Math.round(w/g)*g;
    h=Math.round(h/g)*g;
  }
  el.style.left=left+'px';
  el.style.top=top+'px';
  el.style.width=w+'px';
  el.style.height=h+'px';
}

/*************************************************
 * Convert absolute px -> % so template portable across DPI
 *************************************************/
function pxToPercentStyles(el){
  const parent=el.parentElement?.closest('.product-print')||el.parentElement;
  const pr=parent.getBoundingClientRect();
  const er=el.getBoundingClientRect();
  const leftPct=(er.left - pr.left)/pr.width*100;
  const topPct=(er.top - pr.top)/pr.height*100;
  const wPct=er.width/pr.width*100;
  const hPct=er.height/pr.height*100;
  const styleObj=parseStyleString(el.getAttribute('style')||'');
  styleObj.left=leftPct.toFixed(2)+'%';
  styleObj.top=topPct.toFixed(2)+'%';
  styleObj.width=wPct.toFixed(2)+'%';
  styleObj.height=hPct.toFixed(2)+'%';
  styleObj.position='absolute';
  return styleObj;
}

/*************************************************
 * px <-> numeric extraction helpers
 *************************************************/
function extractPx(v){ if(!v) return 0; const m=/([\d.]+)/.exec(v); return m?parseFloat(m[1]):0; }

/*************************************************
 * Editor main entry
 * @param {Object} structure - the label structure object (will be cloned)
 * @param {Object} opts - { data, onSave(updatedStruct), onCancel() }
 *************************************************/
function openLabelEditor(structure, opts={}){
  const {data={}, onSave=()=>{}, onCancel=()=>{}} = opts;
  const working = structure;


console.log("data",data)
  // Build overlay DOM
  const overlay=document.createElement('div');
  overlay.className='label-editor-overlay';
  const dialog=document.createElement('div');
  dialog.className='label-editor-dialog';
  overlay.appendChild(dialog);

  const title=document.createElement('div');
  title.className='label-editor-title';
  title.textContent='Редактор ценника';
  dialog.appendChild(title);

  const canvasWrap=document.createElement('div');
  canvasWrap.className='label-editor-canvas-wrapper';
  dialog.appendChild(canvasWrap);

  const panel=document.createElement('div');
  panel.className='label-editor-panel';
  dialog.appendChild(panel);

  const footer=document.createElement('div');
  footer.className='label-editor-footer';
  dialog.appendChild(footer);

  // mount label for editing
  const mount=document.createElement('div');
  canvasWrap.appendChild(mount);
   const labelEl=renderLabel(working, data, mount, true);

  // convert percent styles to px so drag/resizes are stable with current on-screen size
  // (We store px inline; will convert back to % on save.)
  const printRect=labelEl.getBoundingClientRect();
  [...labelEl.querySelectorAll('.field-el')].forEach(el=>{
    const styleObj=parseStyleString(el.getAttribute('style')||'');
    // compute px from % if needed
    if((styleObj.left||'').includes('%')){
      styleObj.left=(printRect.width*parseFloat(styleObj.left)/100)+'px';
    }
    if((styleObj.top||'').includes('%')){
      styleObj.top=(printRect.height*parseFloat(styleObj.top)/100)+'px';
    }
    if((styleObj.width||'').includes('%')){
      styleObj.width=(printRect.width*parseFloat(styleObj.width)/100)+'px';
    }
    if((styleObj.height||'').includes('%')){
      styleObj.height=(printRect.height*parseFloat(styleObj.height)/100)+'px';
    }
    el.setAttribute('style', styleObjectToString(styleObj));
  });

  [...labelEl.querySelectorAll('.barcode-box')].forEach(el=>{
    const styleObj=parseStyleString(el.getAttribute('style')||'');

 
      styleObj["margin-top"]=(parseFloat(styleObj.top)/100)+'px';
    styleObj["margin-left"]=(parseFloat(styleObj.left)/100)+'px';






    el.setAttribute('style', styleObjectToString(styleObj));

 });

  /* ---------------- Panel UI ---------------- */
  const listHdr=document.createElement('h3');
  listHdr.textContent='Поля';
  panel.appendChild(listHdr);
  const fieldList=document.createElement('ul');
  fieldList.className='panel-field-list';
  panel.appendChild(fieldList);

  const fieldConfig=document.createElement('div');
  fieldConfig.className='panel-field-config';
  panel.appendChild(fieldConfig);

  /* field list build */
  function rebuildFieldList(){
    fieldList.innerHTML='';
    working.fields.forEach((fld,idx)=>{
      const li=document.createElement('li');
      const up=document.createElement('button'); up.textContent='↑';
      const down=document.createElement('button'); down.textContent='↓';
      const span=document.createElement('span');
      span.textContent=(fld.type==='spacer'?'(spacer)':(fld.key||'no-key'));
      li.appendChild(up); li.appendChild(down); li.appendChild(span);
      fieldList.appendChild(li);

      up.addEventListener('click',()=>{ if(idx>0){ const t=working.fields[idx-1]; working.fields[idx-1]=working.fields[idx]; working.fields[idx]=t; syncDomOrder(); rebuildFieldList(); }});
      down.addEventListener('click',()=>{ if(idx<working.fields.length-1){ const t=working.fields[idx+1]; working.fields[idx+1]=working.fields[idx]; working.fields[idx]=t; syncDomOrder(); rebuildFieldList(); }});
      span.addEventListener('click',()=>selectFieldByIndex(idx));
    });
  }
  rebuildFieldList();

  /* Sync DOM order to working.fields */
  function syncDomOrder(){
    const infoEl = labelEl.querySelector('.product-info');
    // detach nodes & reappend in order
    const nodes=[...infoEl.querySelectorAll('.field-el')];
    const map=new Map(nodes.map(n=>[Number(n.dataset.fieldIndex),n]));
    infoEl.innerHTML='';
    working.fields.forEach((_,i)=>{
      const n=map.get(i);
      if(n){ infoEl.appendChild(n); }
    });
  }

  /* Selected field state */
  let selectedEl=null; let selectedIdx=null;
  function clearSelection(){
    if(selectedEl) selectedEl.classList.remove('field-selected');
    selectedEl=null; selectedIdx=null; fieldConfig.innerHTML='';
  }
  function selectFieldByIndex(idx){
    clearSelection();
    const el=labelEl.querySelector(`.field-el[data-field-index="${idx}"]`);
    if(!el) return;
    selectedEl=el; selectedIdx=idx;
    el.classList.add('field-selected');
    buildFieldConfig();
  }

  function selectBarcode(){
    clearSelection();
    const el=labelEl.querySelector('.barcode-box');
    if(!el) return;
    selectedEl=el; selectedIdx='barcode';
    el.classList.add('field-selected');
    buildFieldConfig();
  }

  /* Build config form for current selection */
  function buildFieldConfig(){
    fieldConfig.innerHTML='';
    if(selectedIdx==null){
      fieldConfig.innerHTML='<em class="small-note">Выберите поле для настройки.</em>';
      return;
    }
    let fldObj;
    if(selectedIdx==='barcode'){
      fldObj=working.barcode;
    }else{
      fldObj=working.fields[selectedIdx];
    }
    const heading=document.createElement('h3');
    heading.textContent = (selectedIdx==='barcode') ? 'Barcode' : `Поле: ${fldObj.key||'(spacer)'}`;
    fieldConfig.appendChild(heading);

    if(selectedIdx!=='barcode' && fldObj.type!=='spacer'){
      // key (read-only)
      const lblKey=document.createElement('label');
      lblKey.textContent='Key:';
      const inpKey=document.createElement('input'); inpKey.type='text'; inpKey.value=fldObj.key||''; inpKey.disabled=true;
      lblKey.appendChild(inpKey); fieldConfig.appendChild(lblKey);

      // prefix
      const lblPre=document.createElement('label');
      lblPre.textContent='Prefix:';
      const inpPre=document.createElement('input'); inpPre.type='text'; inpPre.value=fldObj.prefix||'';
      inpPre.addEventListener('input',()=>{ fldObj.prefix=inpPre.value; refreshFieldContent(selectedIdx); });
      lblPre.appendChild(inpPre); fieldConfig.appendChild(lblPre);

      // postfix
      const lblPost=document.createElement('label');
      lblPost.textContent='Postfix:';
      const inpPost=document.createElement('input'); inpPost.type='text'; inpPost.value=fldObj.postfix||'';
      inpPost.addEventListener('input',()=>{ fldObj.postfix=inpPost.value; refreshFieldContent(selectedIdx); });
      lblPost.appendChild(inpPost); fieldConfig.appendChild(lblPost);

      

      // tag
      const lblTag=document.createElement('label'); lblTag.textContent='HTML tag:';
      const selTag=document.createElement('select');
      ['div','p','span','h1','h2','h3'].forEach(t=>{
        const opt=document.createElement('option'); opt.value=t; opt.textContent=t; if((fldObj.tag||'p')===t) opt.selected=true; selTag.appendChild(opt);
      });
      selTag.addEventListener('change',()=>{ fldObj.tag=selTag.value; replaceFieldTag(selectedIdx, selTag.value); });
     // lblTag.appendChild(selTag); fieldConfig.appendChild(lblTag);

      // className
      const lblCls=document.createElement('label'); lblCls.textContent='CSS className:';
      const inpCls=document.createElement('input'); inpCls.type='text'; inpCls.value=fldObj.className||'';
      inpCls.addEventListener('input',()=>{ fldObj.className=inpCls.value; selectedEl.className=inpCls.value+' field-el'; });
      //lblCls.appendChild(inpCls); fieldConfig.appendChild(lblCls);

    // Font Weight (Bold/Normal)-------------------------------------------------------------
    const lblFontWeight = document.createElement('label');    lblFontWeight.textContent = 'Тип шрифта:';    const selFontWeight = document.createElement('select');

    // Определяем опции для жирного и обычного шрифта
    const fontWeightOptions = {        'normal': 'Normal',        'bold': 'Bold'    };
    for (const value in fontWeightOptions) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = fontWeightOptions[value];
        // Проверяем текущее значение и устанавливаем selected
        if (getComputedStyle(selectedEl).fontWeight === value) {
            opt.selected = true;
        }
        selFontWeight.appendChild(opt);
    }

    selFontWeight.addEventListener('change', () => {        selectedEl.style.fontWeight = selFontWeight.value;    });

    lblFontWeight.appendChild(selFontWeight);
    fieldConfig.appendChild(lblFontWeight);
// Font Weight (Bold/Normal)-------------------------------------------------------------




      // font-size
      const lblFont=document.createElement('label'); lblFont.textContent='Font size (px):';
      const inpFont=document.createElement('input'); inpFont.type='number'; inpFont.min=1; inpFont.value=extractPx(getComputedStyle(selectedEl).fontSize)||12;
      inpFont.addEventListener('input',()=>{ selectedEl.style.fontSize=inpFont.value+'px'; });
      lblFont.appendChild(inpFont); fieldConfig.appendChild(lblFont);

            // font-size
      const lblWidth=document.createElement('label'); lblWidth.textContent='Длина (px):';
      const inpWidth=document.createElement('input'); inpWidth.type='number'; inpWidth.min=1; inpWidth.value=extractPx(getComputedStyle(selectedEl).width)||12;
      inpWidth.addEventListener('input',()=>{ selectedEl.style.width=inpWidth.value+'px'; });
      lblWidth.appendChild(inpWidth); fieldConfig.appendChild(lblWidth);

      // text-align
      const lblAlign=document.createElement('label'); lblAlign.textContent='Text align:';
      const selAlign=document.createElement('select');
      ['left','center','right'].forEach(a=>{ const opt=document.createElement('option'); opt.value=a; opt.textContent=a; if(getComputedStyle(selectedEl).textAlign===a) opt.selected=true; selAlign.appendChild(opt); });
      selAlign.addEventListener('change',()=>{ selectedEl.style.textAlign=selAlign.value; });
      lblAlign.appendChild(selAlign); fieldConfig.appendChild(lblAlign);
    }

    if(selectedIdx==='barcode'){
      // fontSize
      const svg= selectedEl.querySelector('svg')
      const lblBcHeight=document.createElement('label'); lblBcHeight.textContent='Ширина (px):';
      const inpBcHeight=document.createElement('input'); inpBcHeight.type='number'; inpBcHeight.min=1; inpBcHeight.value=parseInt(selectedEl.style.height) ||12;
      inpBcHeight.addEventListener('input',()=>{ 
    //    let config={}
      //  config.barcode = {}; // создаём объект
        //const container=selectedEl.parentElement
        //config.barcode.style=selectedEl.getAttribute("style")
        
        //addBarcode(container, "0730206198", config)
//selectedEl.remove()
        selectedEl.style.height=inpBcHeight.value+'px'
        //.height=inpBcHeight.value+'px';
       // svg.setAttribute('width', '400'); // новая ширина
        //svg.setAttribute('height', inpBcHeight.value+'px'); // новая высота, если нужно
        // при необходимости изменяем viewBox, чтобы сохранить пропорции
        //svg.setAttribute('viewBox', '0 0 '+ inpBcWidth.value+' ' +inpBcHeight.value);
        
        });
      lblBcHeight.appendChild(inpBcHeight); fieldConfig.appendChild(lblBcHeight);

          const lblBcWidght=document.createElement('label'); lblBcWidght.textContent='Длина (px):';
      const inpBcWidth=document.createElement('input'); inpBcWidth.type='number'; inpBcWidth.min=1; inpBcWidth.value=parseInt(selectedEl.style.width) ||12;
      inpBcWidth.addEventListener('input',()=>{ 
        selectedEl.style.width=inpBcWidth.value+'px'
        });

      lblBcWidght.appendChild(inpBcWidth); fieldConfig.appendChild(lblBcWidght);

      // display value checkbox
      const lblBcVal=document.createElement('label');
      const chkVal=document.createElement('input'); chkVal.type='checkbox'; chkVal.checked = (fldObj.displayValue!==false); // default true


      lblBcVal.appendChild(chkVal); lblBcVal.appendChild(document.createTextNode(' Показывать текстовое значение')); fieldConfig.appendChild(lblBcVal);

              const barFontlabel=document.createElement('label'); barFontlabel.textContent='Размер (px):';
              const inpBcFont=document.createElement('input'); inpBcFont.type='number'; inpBcFont.min=1; inpBcFont.value=parseInt(selectedEl.style["font-size"]) ||12;
              inpBcFont.addEventListener('input',()=>{ 
                selectedEl.style["font-size"]=inpBcFont.value+'px'
                const textEl = selectedEl.querySelector('svg text');
                const fontStyle = textEl.getAttribute('style'); // или 
                textEl.setAttribute('style', fontStyle.replace(/font:\s*[\d.]+px/, `font: ${inpBcFont.value}`));
                });
              barFontlabel.appendChild(inpBcFont); fieldConfig.appendChild(barFontlabel);

            chkVal.addEventListener('change',()=>{ 
        fldObj.displayValue = chkVal.checked; 
        const txt = selectedEl.querySelector('text'); 
        txt.style.display=chkVal.checked?'block':'none'; 
        barFontlabel.style.display=chkVal.checked?'block':'none'; 
        });        
            

    }

    // raw style textarea (all fields)
    const lblStyle=document.createElement('label'); lblStyle.textContent='Raw CSS style (inline):';
    const ta=document.createElement('textarea');
    ta.value=selectedEl.getAttribute('style')||'';
    ta.addEventListener('change',()=>{ applyStyleString(selectedEl, ta.value); constrainToParent(selectedEl,false); });
    //lblStyle.appendChild(ta); fieldConfig.appendChild(lblStyle);

    // position & size readouts
    const posLbl=document.createElement('label'); posLbl.textContent='Позиция и размер:';
    const posBox=document.createElement('div'); posBox.className='small-note';
    const updatePosBox=()=>{
      const r=selectedEl.getBoundingClientRect();
      const pr=labelEl.getBoundingClientRect();
      posBox.textContent=`left:${((r.left-pr.left)/pr.width*100).toFixed(1)}% top:${((r.top-pr.top)/pr.height*100).toFixed(1)}% w:${(r.width/pr.width*100).toFixed(1)}% h:${(r.height/pr.height*100).toFixed(1)}%`;
    };
    updatePosBox();
    //posLbl.appendChild(posBox); fieldConfig.appendChild(posLbl);

    // nudge controls
    const nudgeWrap=document.createElement('div');
    nudgeWrap.style.marginTop='6px';
    ['←','→','↑','↓'].forEach(sym=>{
      const b=document.createElement('button'); b.textContent=sym; b.addEventListener('click',()=>{ nudgeSelected(sym); updatePosBox(); }); nudgeWrap.appendChild(b);
    });
    //fieldConfig.appendChild(nudgeWrap);

    function nudgeSelected(sym){
      const step=1; // px
      const st=selectedEl.style;
      const l=extractPx(st.left); const t=extractPx(st.top);
      if(sym==='←') st.left=(l-step)+'px';
      if(sym==='→') st.left=(l+step)+'px';
      if(sym==='↑') st.top=(t-step)+'px';
      if(sym==='↓') st.top=(t+step)+'px';
      constrainToParent(selectedEl,true);
    }
  }

  /* Replace field tag in DOM when user changes tag */
  function replaceFieldTag(idx,newTag){
    const oldEl=labelEl.querySelector(`.field-el[data-field-index="${idx}"]`);
    if(!oldEl) return;
    const newEl=document.createElement(newTag);
    newEl.dataset.fieldIndex=idx;
    newEl.className=oldEl.className; // will be updated by input
    newEl.innerHTML=oldEl.innerHTML;
    newEl.setAttribute('style', oldEl.getAttribute('style'));
    oldEl.replaceWith(newEl);
    attachDragResize(newEl);
    selectedEl=newEl;
  }



function refreshFieldContent(idx) {
  const fld = working.fields[idx];
  const el = labelEl.querySelector(`.field-el[data-field-index="${idx}"]`);
  if (!el) return;

  if (fld.type === 'spacer') {
    el.innerHTML = '&nbsp;';
    return;
  }



  // Берём "чистое" значение без префикса/постфикса
  let rawVal = (data && data[fld.key] != null) ? data[fld.key].toString() : '';


  // Используем innerHTML, если есть функция обработки, или plain text с пробелами
  if (typeof fld.process === 'string' && typeof window[fld.process] === 'function') {
    elrawVal = window[fld.process](rawVal);
}



 // let originalVal = stripPrefixPostfix(rawVal, fld.prefix, fld.postfix);
 let originalVal = stripPrefixPostfix(rawVal, el.getAttribute("data-prefix"), el.getAttribute("data-postfix"));


  // Формируем новое значение
  let displayVal = originalVal;

    if (fld.prefix) displayVal = escapeSpaces(fld.prefix) + displayVal;
    console.log("с префиксом " ,displayVal)
    if(fld.postfix) displayVal = displayVal + escapeSpaces(fld.postfix);
    console.log("с постфиксом " ,displayVal)

        el.innerHTML = displayVal;


}









  function attachDragResize(el){
    // drag
    let dragOffX, dragOffY, dragging=false;
    el.addEventListener('pointerdown',ev=>{
      if(ev.target.classList.contains('resize-handle')) return; // handled separately
      dragging=true; el.setPointerCapture(ev.pointerId);
      dragOffX=ev.clientX - el.getBoundingClientRect().left;
      dragOffY=ev.clientY - el.getBoundingClientRect().top;
      ev.preventDefault();
      selectElement(el);
    });
    el.addEventListener('pointermove',ev=>{
      console.log("ccc")
      if(!dragging) return;
      const pr=labelEl.getBoundingClientRect();
      let newLeft=ev.clientX-pr.left-dragOffX;
      let newTop=ev.clientY-pr.top-dragOffY;
      el.style.left=newLeft+'px';
      el.style.top=newTop+'px';
      constrainToParent(el,true);
      if(selectedEl===el) buildFieldConfig();
    });
    el.addEventListener('pointerup',ev=>{ dragging=false; el.releasePointerCapture(ev.pointerId); });


/*
    // resize handles
    ['nw','ne','sw','se'].forEach(dir=>{
      const h=document.createElement('div'); h.className='resize-handle '+dir;
      el.appendChild(h);
      let rStart, pStartX, pStartY; let resizing=false;
      h.addEventListener('pointerdown',ev=>{
        resizing=true; h.setPointerCapture(ev.pointerId);
        rStart=el.getBoundingClientRect();
        pStartX=ev.clientX; pStartY=ev.clientY;
        ev.stopPropagation(); ev.preventDefault();
        selectElement(el);
      });
      
      h.addEventListener('pointermove',ev=>{
        if(!resizing) return;
        let dx=ev.clientX-pStartX; let dy=ev.clientY-pStartY;
        let left=rStart.left, top=rStart.top, w=rStart.width, hgt=rStart.height;
        const pr=labelEl.getBoundingClientRect();
        if(dir.includes('n')){ top=rStart.top+dy; hgt=rStart.height-dy; }
        if(dir.includes('w')){ left=rStart.left+dx; w=rStart.width-dx; }
        if(dir.includes('s')){ hgt=rStart.height+dy; }
        if(dir.includes('e')){ w=rStart.width+dx; }
        if(w<5) w=5; if(hgt<5) hgt=5;
        el.style.left=(left-pr.left)+'px';
        el.style.top=(top-pr.top)+'px';
        el.style.width=w+'px';
        el.style.height=hgt+'px';
        constrainToParent(el,true);
        if(selectedEl===el) buildFieldConfig();
      });
      h.addEventListener('pointerup',ev=>{ resizing=false; h.releasePointerCapture(ev.pointerId); });
    });
*/

  }



  function selectElement(el){
    const idx=el.dataset.fieldIndex;
    console.log("idx",idx)
    if(idx==='barcode') selectBarcode(); else selectFieldByIndex(Number(idx));
  }

  // attach to all fields & barcode
  [...labelEl.querySelectorAll('.field-el, .barcode-box')].forEach(attachDragResize);
  [...labelEl.querySelectorAll('.field-el, .barcode-box')].forEach(el=>{
    el.addEventListener('click',()=>selectElement(el));
  });

  // keyboard delete? (we'll not allow remove; user can convert to spacer manually outside scope)

  // Panel bottom: select barcode button
  //const bcBtn=document.createElement('button'); bcBtn.textContent='Настроить штрихкод'; bcBtn.style.marginTop='8px';
  //bcBtn.addEventListener('click',selectBarcode); panel.appendChild(bcBtn);

/* Footer buttons */
  const btnCancel=document.createElement('button'); btnCancel.textContent='Отмена'; btnCancel.className="enabled-button"
  const btnSave=document.createElement('button'); btnSave.textContent='Сохранить'; btnSave.style.marginLeft='8px'; btnSave.style.fontWeight='bold'; btnSave.className="enabled-button"
  
    const zoomInBtn= document.createElement('button'); zoomInBtn.textContent='zoomInBtn'; zoomInBtn.className="enabled-button"
        const zoomOutBtn= document.createElement('button'); zoomOutBtn.textContent='zoomOutBtn'; zoomOutBtn.className="enabled-button"
  let currentZoom = 1; // Start with 100% zoompanel-field-list

  zoomInBtn.addEventListener('click', () => {
        const zoomAPI = typeof browser !== 'undefined' ? browser : chrome;

        // Zoom the current tab to 150%
        zoomAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            zoomAPI.tabs.setZoom(tabs[0].id, 1.5); // 1.5 = 150%
          }
        });
  });

  zoomOutBtn.addEventListener('click', () => {
    currentZoom -= 0.1; // Decrease zoom by 10%
    // Ensure zoom doesn't go below a certain threshold (e.g., 10%)
    if (currentZoom < 0.1) {
      currentZoom = 0.1;
    }
    document.body.style.zoom = currentZoom;
  });





  //  footer.appendChild(zoomInBtn);  
  // footer.appendChild(zoomOutBtn);
  footer.appendChild(btnCancel); footer.appendChild(btnSave);




  btnCancel.addEventListener('click',()=>{ document.body.removeChild(overlay); onCancel(); });
  btnSave.addEventListener('click',()=>{
    // gather final styles from DOM -> % based strings
    const infoEls=[...labelEl.querySelectorAll('.field-el')];
    infoEls.forEach(el=>{
      const idx=Number(el.dataset.fieldIndex);
      const pctObj=pxToPercentStyles(el);
      // capture computed inline font-size + align etc
      const computed=window.getComputedStyle(el);
      pctObj['font-size']=computed.fontSize;
      pctObj['text-align']=computed.textAlign;
      working.fields[idx].style=styleObjectToString(pctObj);
    });
    // barcode
    const bcEl=labelEl.querySelector('.barcode-box');
    if(bcEl){
     // const pctObj=pxToPercentStyles(bcEl);


      const computed=window.getComputedStyle(bcEl);

  const styleObj=parseStyleString(bcEl.getAttribute('style')||'');

console.log("styleObj",styleObj)
console.log("bcEl.getAttribute('style')",bcEl.getAttribute('style'))
console.log("computed",styleObjectToString(computed))

     // pctObj['font-size']=computed.fontSize;
      working.barcode.style=styleObjectToString(styleObj);
//working.barcode.style=computed;
      
      working.barcode.fontSize=extractPx(computed.fontSize);
      console.log("working",working)
    }
    document.body.removeChild(overlay);
    onSave(working);
  });

  // mount overlay
  document.body.appendChild(overlay);
  clearSelection(); // initial blank message
}


registerPageInit("barcode", init);


function cmToPx(cm) {
  return Math.round(parseFloat(cm) * 37.7952755906); // ~96dpi
}

function parseStyleString(styleString) {
  const result = {};
  
  // Убираем возможные лишние кавычки и пробелы, если нужно
  styleString = styleString.trim();

  // Разбиваем по точке с запятой
  const declarations = styleString.split(';');

  declarations.forEach(decl => {
    if (decl.trim()) { // пропускаем пустые элементы
      const [property, value] = decl.split(':');
      if (property && value) {
        result[property.trim()] = value.trim();
      }
    }
  });

  return result;
}

function stripPrefixPostfix(text, prefix, postfix) {
  if (!text) return '';

  // Обрезаем prefix с учётом пробелов
  if (prefix) {
    // Экранируем регэкспом специальные символы
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rePrefix = new RegExp(`^\\s*${escapedPrefix}`, 'i');
    text = text.replace(rePrefix, '');
   
  }

  if (postfix) {
    const escapedPostfix = postfix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rePostfix = new RegExp(`${escapedPostfix}\\s*$`, 'i');
    text = text.replace(rePostfix, '');
  }

  return text.trim();
}
function escapeSpaces(str) {
  // Заменяем пробелы в начале и конце на &nbsp;
  // Можно и все пробелы заменить, если нужно
  if (!str) return '';
  
  // Пример: заменяем каждый пробел в начале и конце на неразрывный пробел
  let startSpaces = str.match(/^\s+/) || [];
  let endSpaces = str.match(/\s+$/) || [];
  let middle = str.trim();

  let escaped = '';

  if (startSpaces.length) {
    escaped += '&nbsp;'.repeat(startSpaces[0].length);
  }

  escaped += middle.replace(/ /g, ' '); // Можно оставить пробелы внутри как есть

  if (endSpaces.length) {
    escaped += '&nbsp;'.repeat(endSpaces[0].length);
  }

  return escaped;
}
