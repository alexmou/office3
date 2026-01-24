//system.js
var username;
//  var token
var currentPageName;
var CONFIG = window.CONFIG || {};
var GLOBAL_EXECUTION_TESTING = CONFIG.GLOBAL_EXECUTION_TESTING || 0;
var USE_MOCK_DATA = CONFIG.USE_MOCK_DATA !== undefined ? CONFIG.USE_MOCK_DATA : true;

// Stub google.script when not available (static hosting)
if (typeof google === "undefined") {
  window.google = {
    script: {
      run: {
        withSuccessHandler: function() { return this; },
        withFailureHandler: function() { return this; }
      }
    }
  };
}

var openedPages = [];
//openedPages.push["login"]

//token=getToken()

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = message;
  container.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// Retrieve data

function setToken(token, globalUrl) {
  // Сохраняем токен глобально и обновляем URL в адресной строке (без localStorage)
  if (!token) return;
  window.token = token;

  const targetUrl = `${globalUrl || window.location.href.split('?')[0] + '?'}token=${token}`;
  try {
    const url = new URL(targetUrl, window.location.href);
    history.replaceState({}, "", url.toString());
  } catch (e) {
    console.warn("Не удалось обновить URL с токеном", e);
  }
}

function getToken() {
  // Получаем токен из текущего URL
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

function deleteToken(globalUrl) {
  window.top.location.href = "./";
}

async function openPage(pageName) {
  let request = {};

  if (openedPages.includes(pageName)) {
    request = {
      googleFuncName: "renderOnlyHTMLPage",
      callbackJSfunctionName: "renderHtml",
      params: pageName
    };
  } else {
    request = {
      googleFuncName: "renderPage",
      callbackJSfunctionName: "renderPage",
      params: pageName
    };
  }
  openedPages.push(pageName);

  runGSfunction(request);
  var p = {};
  p["currentPageName_" + username] = pageName;
  //google.script.run.withSuccessHandler().setScriptProperty(p);

  // Update config (best-effort)
  try {
    if (window.API && typeof window.API.updateConfig === "function") {
      await window.API.updateConfig(p, { timeout: 8000, overlayId: "config" });
    }
  } catch (e) {
    console.warn("Не удалось обновить конфиг (updateConfig)", e);
  }
}

function openLogin(pageName = "login") {
  let request = {
    googleFuncName: "doGet",
    callbackJSfunctionName: "",
    params: pageName
  };
  runGSfunction(request);
}

function renderHtml(daHTML) {
  document.getElementById("global").outerHTML = daHTML.html;

  for (var i = 0; i < daHTML.jsNames.length; i++) {
    var existingScript = document.getElementById(`script-${daHTML.jsNames[i]}`);
    eval(existingScript.textContent);
  }
  document.getElementById("pageName").textContent = daHTML.pageTitle;
}

function renderPage(daHTML) {
  if (daHTML.html) {
    document.getElementById("global").outerHTML = daHTML.html;
  }

  if (daHTML.src) {
    injectSrc(daHTML.src, daHTML.pageName);
  }

  if (daHTML.css) {
    for (var i = 0; i < daHTML.cssNames.length; i++) {
      injectStyle(daHTML.css[i], daHTML.cssNames[i]);
    }
  }

  if (daHTML.link) {
    injectLink(daHTML.link, daHTML.pageName);
  }

  if (daHTML.javascript) {
    for (var i = 0; i < daHTML.jsNames.length; i++) {
      injectScript(daHTML.javascript[i], daHTML.jsNames[i], i == daHTML.jsNames.length - 1);
    }
  }

  document.getElementById("pageName").textContent = daHTML.pageTitle;

  function injectScript(scriptContent, identifier, runScript) {
    const existingScript = document.getElementById(`script-${identifier}`);
    if (!existingScript) {
      const cleanedContent = scriptContent.replace(/<\/?script>/gi, '');
      const script = document.createElement("script");
      script.textContent = cleanedContent;
      script.id = `script-${identifier}`;
      document.head.appendChild(script);
      if (runScript) {
        //   bodyOnLoad()
      }
    } else {
      eval(existingScript.textContent);
    }
  }

  function injectSrc(scriptUrls, pageName, loadInOrder = false) {
    if (!loadInOrder) {
      return Promise.all(scriptUrls.map((url, index) => {
        return new Promise((resolve, reject) => {
          const identifier = `external-script-${pageName}-${index}`;
          if (document.getElementById(identifier)) {
            console.log(`Script ${identifier} already loaded`);
            return resolve();
          }

          const script = document.createElement('script');
          script.src = url;
          script.id = identifier;
          script.async = true;

          script.onload = () => {
            resolve();
          };

          script.onerror = () => {
            console.error(`Failed to load: ${url}`);
            reject(new Error(`Failed to load script: ${url}`));
          };

          document.head.appendChild(script);
        });
      })).then(() => {
        console.log('All scripts loaded successfully');
      }).catch(error => {
        console.error('Error loading scripts:', error);
        throw error;
      });
    } else {
      return scriptUrls.reduce((promiseChain, url, index) => {
        return promiseChain.then(() => {
          return new Promise((resolve, reject) => {
            const identifier = `external-script-${pageName}-${index}`;

            if (document.getElementById(identifier)) {
              console.log(`Script ${identifier} already loaded`);
              return resolve();
            }

            const script = document.createElement('script');
            script.src = url;
            script.id = identifier;
            script.async = false;

            script.onload = () => {
              console.log(`Loaded in order: ${url}`);
              resolve();
            };

            script.onerror = () => {
              console.error(`Failed to load: ${url}`);
              reject(new Error(`Failed to load script: ${url}`));
            };

            document.head.appendChild(script);
          });
        });
      }, Promise.resolve()).then(() => {
        console.log('All scripts loaded in order');
      });
    }
  }

  function injectLink(cssUrls, pageName) {
    cssUrls.forEach((url, index) => {
      const identifier = `external-link-${pageName + index}`;
      if (document.getElementById(identifier)) {
        return;
      }
      const script = document.createElement("link");
      script.href = url;
      script.rel = "stylesheet";
      script.id = identifier;
      script.async = true;
      document.head.appendChild(script);
    });
  }

  function injectStyle(styleContent, identifier) {
    const existingScript = document.getElementById(`style-${identifier}`);
    if (!existingScript) {
      const style = document.createElement('style');
      const cleanedContent = styleContent.replace(/<\/?style>/gi, '');
      style.textContent = cleanedContent;
      style.id = `style-${identifier}`;
      document.head.appendChild(style);
    }
  }
}

async function getServerData(googleFuncName, params) {
  try {
    let request = { googleFuncName: googleFuncName, params: params };
    const response = await getDataFromServer(request);
    return response;
  } catch (error) {
    console.error("Error fetching  data:", error);
    return null;
  }
}

// Save the original console.error
const originalConsoleError = console.error;

// Override console.error
console.error = function (...args) {
  originalConsoleError.apply(console, args);
  logError(args);
};

const GLOBAL_ERROR_POPUP_TEXT = "Произошла ошибка. Перезагрузите страницу";
let lastGlobalErrorPopupAt = 0;
let lastGlobalErrorPopupMessage = "";
let pendingGlobalErrorPopupMessage = null;
let globalErrorDomReadyHooked = false;

function sanitizeErrorPopupMessage(message) {
  const s = String(message || "").trim();
  if (!s) return GLOBAL_ERROR_POPUP_TEXT;
  if (s.length > 220) return s.slice(0, 220) + "...";
  return s;
}

function showGlobalErrorPopupSafely(message) {
  const safeMessage = sanitizeErrorPopupMessage(message);
  const now = Date.now();

  // If an explicit popup was already shown (e.g. via systemError), don't duplicate it.
  try {
    if (window.__lastErrorPopupAt && now - window.__lastErrorPopupAt < 500) return;
  } catch (_) {}

  // Throttle any popups to avoid storms (e.g. loops).
  if (now - lastGlobalErrorPopupAt < 1500) return;

  // Throttle duplicates to avoid popup spam
  if (safeMessage === lastGlobalErrorPopupMessage && now - lastGlobalErrorPopupAt < 3000) return;
  lastGlobalErrorPopupMessage = safeMessage;
  lastGlobalErrorPopupAt = now;

  // If DOM isn't ready yet, defer until DOMContentLoaded
  if (!document?.body) {
    pendingGlobalErrorPopupMessage = safeMessage;
    if (!globalErrorDomReadyHooked) {
      globalErrorDomReadyHooked = true;
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          if (pendingGlobalErrorPopupMessage) {
            try {
              showErrorPopup(pendingGlobalErrorPopupMessage);
            } catch (_) {}
            pendingGlobalErrorPopupMessage = null;
          }
        },
        { once: true }
      );
    }
    return;
  }

  try {
    showErrorPopup(safeMessage);
  } catch (_) {
    // Ignore popup rendering errors to avoid recursion loops.
  }
}

function logError(error) {
  console.log("Произошла ошибка. Перезагрузите страницу", error);

  // Show global red popup for all pages (avoid using systemError here to prevent recursion).
  try {
    const args = Array.isArray(error) ? error : [error];
    const firstText = args.find((v) => typeof v === "string" && v.trim());
    const msg = firstText ? `${GLOBAL_ERROR_POPUP_TEXT}: ${firstText}` : GLOBAL_ERROR_POPUP_TEXT;
    showGlobalErrorPopupSafely(msg);
  } catch (_) {}
}

// Also catch uncaught errors that may not go through console.error
window.addEventListener("error", (event) => {
  try {
    const msg = event?.message ? `${GLOBAL_ERROR_POPUP_TEXT}: ${event.message}` : GLOBAL_ERROR_POPUP_TEXT;
    showGlobalErrorPopupSafely(msg);
  } catch (_) {}
});

window.addEventListener("unhandledrejection", (event) => {
  try {
    const reason = event?.reason;
    const msg = reason?.message
      ? `${GLOBAL_ERROR_POPUP_TEXT}: ${reason.message}`
      : GLOBAL_ERROR_POPUP_TEXT;
    showGlobalErrorPopupSafely(msg);
  } catch (_) {}
});

function createTabs(tabButtons) {
  const container = document.createElement("div");
  container.className = "tabs-container";
  const tabs = document.createElement("div");
  tabs.className = "tabs";
  const tabContent = document.createElement("div");
  tabContent.className = "tab-content";

  tabButtons.forEach((tab) => {
    const button = document.createElement("button");
    button.className = `tab-button${tab.active ? " active" : ""}`;
    button.setAttribute("data-tab", tab.id);
    button.textContent = tab.text;
    tabs.appendChild(button);
    const tabPane = document.createElement("div");
    tabPane.id = tab.id;
    tabPane.className = `tab-pane${tab.active ? " active" : ""}`;
    tabPane.innerHTML = tab.content;
    tabContent.appendChild(tabPane);
  });

  container.appendChild(tabs);
  container.appendChild(tabContent);
  document.getElementById("content").appendChild(container);

  const buttons = document.querySelectorAll(".tab-button");
  const panes = document.querySelectorAll(".tab-pane");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      panes.forEach(pane => pane.classList.remove("active"));
      button.classList.add("active");
      const tabId = button.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });
}

function convertValuesToString(data) {
  return data.map(obj => {
    const updatedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        updatedObj[key] = String(obj[key]);
      }
    }
    return updatedObj;
  });
}

function changePointsToComma(data) {
  return data.map(obj => {
    const updatedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        updatedObj[key] = String(obj[key].replace(",", "."));
      }
    }
    return updatedObj;
  });
}

function systemError(text, error) {
  console.error(text, error);
  showErrorPopup(text + ": " + error);
}

function getOverlay() {
  let overlay = document.getElementById("overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "overlay";
    overlay.setAttribute("data-blockedBy", "");
    overlay.style.display = "none";
    overlay.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(overlay);
  }
  if (!overlay.querySelector('.loader')) {
    const loader = document.createElement('div');
    loader.className = 'loader';
    overlay.appendChild(loader);
  }
  return overlay;
}

function forceHideOverlay() {
  const overlay = getOverlay();
  overlay.setAttribute("data-blockedBy", "");
  overlay.style.display = "none";
  const myDiv = document.getElementById("myDiv");
  if (myDiv) myDiv.style.display = "grid";
}

function showPage(funcName) {
  if (currentPageName === "header") return;
  const overlay = getOverlay();
  if (overlay.getAttribute("data-blockedBy") === funcName) {
    const myDiv = document.getElementById("myDiv");
    if (myDiv) myDiv.style.display = "grid";
    overlay.style.display = "none";
  }
}

function hidePage(funcName) {
  if (currentPageName === "header") return;
  const overlay = getOverlay();
  overlay.setAttribute("data-blockedBy", funcName || "");
  overlay.style.display = "block";
}

function getCurrentDate() {
  return new Date().toLocaleDateString();
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: "numeric",
    minute: "numeric"
  });
}

async function runGSfunctionPromise(request) {
  if (!request.callbackJSfunctionName) { request.callbackJSfunctionName = guidGenerator(); }
  hidePage(request.callbackJSfunctionName);
  const returnToJsFuncName = "globalJSCallbackFunction";
  try {
    const processedParams = processRequestParams(request.params);
    const paramsWithToken = {
      ...processedParams,
      token: window.token
    };
    const response = await requestViaN8nOrMock(request.googleFuncName, paramsWithToken);
    if (typeof window[returnToJsFuncName] === 'function') {
      window[returnToJsFuncName](request.callbackJSfunctionName, response);
    }
    return response;
  } catch (error) {
    console.error("runGSfunctionPromise failed:", request?.googleFuncName, error);
    throw error;
  } finally {
    // Гарантированно снимаем блокировку UI (даже если overlay был перезаписан вложенным запросом)
    forceHideOverlay();
  }
}

async function getDataFromServer(request) {
  const data = await runGSfunctionPromise(request);
  return data;
}

async function runGSfunction(request) {
  if (!request.callbackJSfunctionName) { request.callbackJSfunctionName = guidGenerator(); }
  hidePage(request.callbackJSfunctionName);
  const returnToJsFuncName = "globalJSCallbackFunction";
  try {
    const processedParams = processRequestParams(request.params);
    const paramsWithToken = {
      ...processedParams,
      token: window.token
    };
    const response = await requestViaN8nOrMock(request.googleFuncName, paramsWithToken);
    if (typeof window[returnToJsFuncName] === 'function') {
      window[returnToJsFuncName](request.callbackJSfunctionName, response);
    }
  } catch (error) {
    console.error("runGSfunction failed:", request?.googleFuncName, error);
    showErrorPopup(error?.message || String(error));
  } finally {
    // Гарантированно снимаем блокировку UI
    forceHideOverlay();
  }
}

function processRequestParams(params) {
  if (params && Object.keys(params).some(key => !isNaN(key))) {
    const stringValue = Object.keys(params)
      .filter(key => !isNaN(key))
      .sort((a, b) => a - b)
      .map(key => params[key])
      .join('');
    const otherProps = {};
    Object.keys(params).forEach(key => {
      if (isNaN(key) && key !== 'token') {
        otherProps[key] = params[key];
      }
    });
    return {
      value: stringValue,
      ...otherProps
    };
  }
  return params || {};
}

function globalJSCallbackFunction(funcName, response) {
  try {
    if (typeof window[funcName] === 'function') {
      window[funcName](response);
    }
  } catch (error) {
    console.error(`globalJSCallbackFunction handler failed: ${funcName}`, error);
    showErrorPopup(error?.message || String(error));
  } finally {
    // На всякий случай: убираем overlay даже при ошибке обработчика
    forceHideOverlay();
  }
}

function guidGenerator() {
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function createElement_old() {
  var element = document.createElement(arguments[0]),
    text = arguments[1],
    attr = arguments[2],
    append = arguments[3],
    appendTo = arguments[4];

  for (var key = 0; key < Object.keys(attr).length; key++) {
    var name = Object.keys(attr)[key],
      value = attr[name],
      tempAttr = document.createAttribute(name);
    tempAttr.value = value;
    element.setAttributeNode(tempAttr);
  }

  if (append) {
    for (var _key = 0; _key < append.length; _key++) {
      element.appendChild(append[_key]);
    }
  }

  if (text) element.appendChild(document.createTextNode(text));

  if (appendTo) {
    var target = appendTo === 'body' ? document.body : document.getElementById(appendTo);
    target.appendChild(element);
  }

  return element;
}

function createElement(tag, innerText, attributes, parent) {
  var element = document.createElement(tag);
  if (innerText) {
    element.innerText = innerText;
  }
  if (attributes) {
    for (var key in attributes) {
      element.setAttribute(key, attributes[key]);
    }
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
}

function createNewChoice(list, elName, caption_h1, action, parentID) {
  var parent = document.getElementById(parentID);
  var container = document.createElement('div');
  container.className = 'text-field';
  container.setAttribute('style', 'padding-right: 10px;');

  var label = document.createElement('label');
  label.className = 'text-field__label';
  label.setAttribute('for', elName);
  label.textContent = caption_h1;

  var selectElement = document.createElement('select');
  selectElement.setAttribute('style', 'width:200px;');
  selectElement.className = 'text-field__input';
  selectElement.setAttribute('id', elName);
  selectElement.setAttribute('name', elName);

  container.appendChild(label);
  container.appendChild(selectElement);
  parent.appendChild(container);

  list.forEach(function(item) {
    var optionElement = createElement('option', item, {
      value: item
    });
    selectElement.appendChild(optionElement);
  });

  if (action) {
    selectElement.addEventListener('change', (e) => {
      try {
        if (typeof window[action] !== 'function') {
          throw new Error(`Function "${action}" is not defined.`);
        }
        window[action](e.target);
        e.preventDefault();
        return false;
      } catch (err) {
        console.error(`Error in action handler for "${action}":`, err);
      }
    });
  }
  return selectElement;
}

function createNewInputWithButton(inputName, caption_h1, initValue, action, target) {
  try {
    var container = document.createElement('div');
    container.className = 'text-field';
    var label = document.createElement('label');
    label.className = 'text-field__label';
    label.setAttribute('for', inputName);
    label.textContent = caption_h1;
    container.appendChild(label);
    var groupDiv = document.createElement('div');
    groupDiv.className = 'text-field__group';
    var input = document.createElement('input');
    input.className = 'text-field__input';
    input.setAttribute('type', 'search');
    input.setAttribute('id', inputName);
    input.setAttribute('name', inputName);
    input.setAttribute('placeholder', "Article number");
    input.value = initValue;
    var button = document.createElement('button');
    button.className = 'text-field__btn';
    button.setAttribute('name', inputName);
    button.setAttribute('type', 'button');
    button.setAttribute('onclick', action + "(this)");
    button.textContent = '+';
    groupDiv.appendChild(input);
    groupDiv.appendChild(button);
    container.appendChild(groupDiv);
    var targetEl = document.getElementById(target);
    if (!targetEl) {
      throw new Error(`Target element with id "${target}" not found.`);
    }
    targetEl.appendChild(container);
    const inputField = document.getElementById(inputName);
    if (!inputField) {
      throw new Error(`Input element with id "${inputName}" not found.`);
    }
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        try {
          if (typeof window[action] !== 'function') {
            throw new Error(`Function "${action}" is not defined.`);
          }
          window[action](e.target);
          inputField.inputValue = "";
          inputField.value = "";
          if (e.preventDefault) e.preventDefault();
          return false;
        } catch (err) {
          console.error(`Error in action handler for "${action}":`, err);
        }
      }
    });
    return container;
  } catch (err) {
    console.error(`Error in createNewInputWithButton:`, err);
    return null;
  }
}

function createNewInput(inputName, caption_h1, initValue, action, target) {
  var container = document.createElement('div');
  container.className = 'text-field';
  var label = document.createElement('label');
  label.className = 'text-field__label';
  label.setAttribute('for', inputName);
  label.textContent = caption_h1;
  container.appendChild(label);
  var groupDiv = document.createElement('div');
  groupDiv.className = 'text-field__group';
  var input = document.createElement('input');
  input.className = 'text-field__input';
  input.setAttribute('type', 'search');
  input.setAttribute('id', inputName);
  input.setAttribute('name', inputName);
  input.setAttribute('placeholder', "");
  input.value = initValue;
  groupDiv.appendChild(input);
  container.appendChild(groupDiv);
  var targetEl = document.getElementById(target);
  targetEl.appendChild(container);
  const a = document.getElementById(inputName);
  a.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      window[action](e.target);
    }
  });
  a.addEventListener('input', (e) => {
    window[action](e.target);
  });
  return container;
}

function guidGenerator() {
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function toLocaleStringCorrect(value) {
  if (value == null || value === "") {
    return "";
  }
  if (typeof value === "string") {
    if (/^0\d+/.test(value)) {
      return value;
    }
    let cleanedValue = value.replace(/\s+/g, "");
    let numberValue = parseFloat(cleanedValue);
    if (!isNaN(numberValue)) {
      return numberValue.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true
      });
    }
    return value;
  }
  if (typeof value === "number") {
    return value.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true
    });
  }
  return value;
}

function arraysToObject(keys, values) {
  const result = {};
  keys.forEach((key, index) => {
    if (key) {
      result[key] = values[index];
    }
  });
  return result;
}

function valueChanged(el) {
  alert(el.name + " " + el.value);
}

function makeFocus(textFieldId) {
  document.getElementById(textFieldId).focus();
}

function minusPercent(val, percent) {
  return val - (val * percent / 100);
}

function plusPercent(val, percent) {
  return val + (val * percent / 100);
}

function updateHeader(data) {
  var newData = [];
  var newVisibleContext = [];
  var newEditableContext = [];
  var newHeader_ = [];
  var newVisibleContext_ = [];
  var newEditableContext_ = [];
  for (let i = 0; i < data[0].length; i++) {
    let st;
    if (!data[1][i]) { st = ""; }
    st = data[1][i].toString();
    if (st != "0" && st != "") {
      newHeader_.push(data[0][i]);
      newVisibleContext_.push(data[1][i]);
      newEditableContext_.push(data[2][i]);
    }
  }
  newData.push(newHeader_);
  newData.push(newVisibleContext_);
  newData.push(newEditableContext_);
  return newData;
}

function mapFields(header, article) {
  var newArticle = [];
  for (var k = 0; k < header.length; k++) {
    for (var i = 0; i < article[0].length; i++) {
      if (header[k] == article[0][i]) {
        newArticle.push(article[1][i]);
      }
    }
  }
  return newArticle;
}

function returnArticleAsObject(header, article) {
  // Поддерживаем несколько форматов:
  // 1) header: string[], article: [headers[], values[]]
  // 2) header: string[], article: object (уже в виде {key: value})
  // 3) header: undefined/null, article: object -> возвращаем как есть (копию)
  // 4) header: undefined/null, article: [headers[], values[]] -> строим объект из article[0]/article[1]
  try {
    if (article && typeof article === "object" && !Array.isArray(article)) {
      if (!Array.isArray(header)) {
        return { ...article };
      }
      const picked = {};
      for (let k = 0; k < header.length; k++) {
        const key = header[k];
        if (key != null && key !== "") {
          picked[key] = article[key];
        }
      }
      return picked;
    }

    const matrix = Array.isArray(article) ? article : null;
    const headers = Array.isArray(header) ? header : (Array.isArray(matrix?.[0]) ? matrix[0] : []);
    const cols = Array.isArray(matrix?.[0]) ? matrix[0] : [];
    const vals = Array.isArray(matrix?.[1]) ? matrix[1] : [];
    if (!Array.isArray(headers) || headers.length === 0) return {};

    const newArticle = {};
    for (let k = 0; k < headers.length; k++) {
      const key = headers[k];
      if (key == null || key === "") continue;
      const idx = cols.indexOf(key);
      if (idx !== -1) newArticle[key] = vals[idx];
    }
    return newArticle;
  } catch (e) {
    console.error("returnArticleAsObject failed", e);
    return {};
  }
}

let errorPopupTimer = null;
let infoPopupTimer = null;

function ensureGlobalPopups() {
  // Гарантируем наличие базовых стилей для попапов даже если CSS не подключен
  if (!document.getElementById("popupStyles")) {
    const style = document.createElement("style");
    style.id = "popupStyles";
    style.textContent = `
      .error-popup, .informational-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        padding: 20px;
        width: 300px;
        max-width: 80%;
        font-family: Arial, sans-serif;
        text-align: center;
        display: none;
      }
      .error-popup { background-color: rgba(255, 0, 0, 0.9); }
      .informational-popup { background-color: rgba(114, 191, 114, 0.9); }
      .error-popup-content, .informational-popup-content { position: relative; }
      .close-btn {
        position: absolute;
        top: 5px;
        right: 10px;
        font-size: 18px;
        cursor: pointer;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .error-popup.show, .informational-popup.show { display: block; animation: fadeIn 0.3s ease-in-out; }
      .hidden { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  if (!document.getElementById("errorPopup")) {
    const popup = document.createElement("div");
    popup.id = "errorPopup";
    popup.className = "error-popup hidden";
    popup.innerHTML = `
      <div class="error-popup-content">
        <span class="close-btn" onclick="hideErrorPopup()">&times;</span>
        <p id="errorMessage">Произошла ошибка. Пожалуйста, попробуйте снова.</p>
      </div>
    `;
    document.body.appendChild(popup);
  }

  if (!document.getElementById("informationalPopup")) {
    const popup = document.createElement("div");
    popup.id = "informationalPopup";
    popup.className = "informational-popup hidden";
    popup.innerHTML = `
      <div class="informational-popup-content">
        <span class="close-btn" onclick="hideInformationalPopup()">&times;</span>
        <p id="informationalMessage"></p>
      </div>
    `;
    document.body.appendChild(popup);
  }
}

function showErrorPopup(message) {
  ensureGlobalPopups();
  const popup = document.getElementById("errorPopup");
  const errorMessage = document.getElementById("errorMessage");
  if (!popup || !errorMessage) return;

  forceHideOverlay();

  try {
    window.__lastErrorPopupAt = Date.now();
    window.__lastErrorPopupMessage = String(message || "");
  } catch (_) {}

  errorMessage.textContent = message;
  popup.classList.remove("hidden");
  popup.style.display = "block";
  // Force reflow to restart animation
  // eslint-disable-next-line no-unused-expressions
  popup.offsetWidth;
  popup.classList.add("show");

  if (errorPopupTimer) clearTimeout(errorPopupTimer);
  errorPopupTimer = setTimeout(hideErrorPopup, 4000);
}

function hideErrorPopup() {
  const popup = document.getElementById("errorPopup");
  if (!popup) return;
  popup.classList.remove("show");
  popup.classList.add("hidden");
  popup.style.display = "none";
}

function showInformationalPopup(message) {
  ensureGlobalPopups();
  const popup = document.getElementById("informationalPopup");
  const infoMessage = document.getElementById("informationalMessage");
  if (!popup || !infoMessage) return;

  infoMessage.textContent = message;
  popup.classList.remove("hidden");
  popup.style.display = "block";
  // eslint-disable-next-line no-unused-expressions
  popup.offsetWidth;
  popup.classList.add("show");

  if (infoPopupTimer) clearTimeout(infoPopupTimer);
  infoPopupTimer = setTimeout(hideInformationalPopup, 5000);
}

function hideInformationalPopup() {
  const popup = document.getElementById("informationalPopup");
  if (!popup) return;
  popup.classList.remove("show");
  popup.classList.add("hidden");
  popup.style.display = "none";
}

function parseFloatCorrect(str) {
  str = String(str).replace(/\s+/g, '');
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return parseFloat(str);
  }
  return str;
}

function createDatePicker(calendarId) {
  const daysContainer = document.getElementById("daysContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const monthYear = document.getElementById("monthYear");
  const dateInput = document.getElementById("dateInput");
  const calendar = document.getElementById(calendarId);

  let currentDate = new Date();
  dateInput.value = currentDate.toLocaleDateString("ru-RU");
  let selectedDate = null;

  function handleDayClick(day) {
    selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    dateInput.value = selectedDate.toLocaleDateString("ru-RU");
    calendar.style.display = "none";
    renderCalendar(currentDate);
  }

  function createDayElement(day) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayElement = document.createElement("div");
    dayElement.classList.add("day");
    if (date.toDateString() === new Date().toDateString()) {
      dayElement.classList.add("current");
    }
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      dayElement.classList.add("selected");
    }
    dayElement.textContent = day;
    dayElement.addEventListener("click", () => {
      handleDayClick(day);
    });
    daysContainer.appendChild(dayElement);
  }

  function renderCalendar() {
    daysContainer.innerHTML = "";
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    monthYear.textContent = `${currentDate.toLocaleString("default", {
      month: "long"
    })} ${currentDate.getFullYear()}`;

    for (let day = 1; day <= lastDay.getDate(); day++) {
      createDayElement(day);
    }
  }

  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  dateInput.addEventListener("click", () => {
    calendar.style.display = "block";
    positionCalendar();
  });

  document.addEventListener("click", (event) => {
    if (!dateInput.contains(event.target) && !calendar.contains(event.target)) {
      calendar.style.display = "none";
    }
  });

  function positionCalendar() {
    const inputRect = dateInput.getBoundingClientRect();
    calendar.style.top = inputRect.bottom + "px";
  }

  window.addEventListener("resize", positionCalendar);
  renderCalendar();
}
