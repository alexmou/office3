//system.js
var username;
//  var token
var currentPageName;
var CONFIG = window.CONFIG || {};
var GLOBAL_EXECUTION_TESTING = CONFIG.GLOBAL_EXECUTION_TESTING || 0;
var I18N_DICTIONARY =
  window.I18N_DICTIONARY && typeof window.I18N_DICTIONARY === "object" && !Array.isArray(window.I18N_DICTIONARY)
    ? window.I18N_DICTIONARY
    : {};
const I18N_MISSING = Symbol("i18n_missing");
const LOCALIZABLE_ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];
const I18N_TEXT_NODE_SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);
let i18nDomObserver = null;

window.I18N_DICTIONARY = I18N_DICTIONARY;

function getLocalizationRawValue(key) {
  if (!key) return I18N_MISSING;
  if (Object.prototype.hasOwnProperty.call(I18N_DICTIONARY, key)) {
    return I18N_DICTIONARY[key];
  }
  const parts = String(key).split(".");
  let cur = I18N_DICTIONARY;
  for (const part of parts) {
    if (!cur || typeof cur !== "object" || !Object.prototype.hasOwnProperty.call(cur, part)) {
      return I18N_MISSING;
    }
    cur = cur[part];
  }
  return cur;
}

function setLocalizationDictionary(dictionary = {}) {
  if (!dictionary || typeof dictionary !== "object" || Array.isArray(dictionary)) return I18N_DICTIONARY;
  I18N_DICTIONARY = { ...I18N_DICTIONARY, ...dictionary };
  window.I18N_DICTIONARY = I18N_DICTIONARY;
  try {
    if (typeof document !== "undefined") {
      localizeDomTree(document);
      ensureI18nDomObserver();
    }
  } catch (_) {}
  return I18N_DICTIONARY;
}

function getLocalizationValue(key, fallback = "") {
  const value = getLocalizationRawValue(key);
  return value === I18N_MISSING ? fallback : value;
}

function getLocalizationList(key, fallback = []) {
  const value = getLocalizationValue(key, fallback);
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  return fallback;
}

function localizeUiText(input, fallback = input) {
  if (input === null || input === undefined) return fallback;
  const raw = String(input);
  const trimmed = raw.trim();
  if (!trimmed) return raw;

  const leadingWhitespace = raw.match(/^\s*/)?.[0] || "";
  const trailingWhitespace = raw.match(/\s*$/)?.[0] || "";
  const collapsed = trimmed.replace(/\s+/g, " ");
  const candidates = [trimmed];
  if (collapsed !== trimmed) candidates.push(collapsed);

  for (const candidate of candidates) {
    const translated = getLocalizationRawValue(candidate);
    if (translated === I18N_MISSING || translated === null || translated === undefined) continue;
    const translatedText =
      typeof translated === "string"
        ? translated
        : (typeof translated === "number" || typeof translated === "boolean")
          ? String(translated)
          : "";
    if (!translatedText) continue;
    return `${leadingWhitespace}${translatedText}${trailingWhitespace}`;
  }

  return fallback;
}

function localizeElementAttributes(el) {
  if (!el || el.nodeType !== 1) return;

  const key = el.getAttribute("data-i18n");
  if (key) {
    const fallbackText = (el.textContent || "").trim();
    const translatedByKey = getLocalizationValue(key, fallbackText);
    if (translatedByKey !== undefined && translatedByKey !== null) {
      el.textContent = String(translatedByKey);
    }
  }

  const attrsSpec = el.getAttribute("data-i18n-attrs");
  if (attrsSpec) {
    attrsSpec
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((chunk) => {
        const parts = chunk.split(":");
        const attrName = (parts[0] || "").trim();
        const attrKey = (parts[1] || "").trim();
        if (!attrName || !attrKey) return;
        const fallbackValue = el.getAttribute(attrName) || "";
        const translated = getLocalizationValue(attrKey, fallbackValue);
        if (translated !== undefined && translated !== null) {
          el.setAttribute(attrName, String(translated));
        }
      });
  }

  LOCALIZABLE_ATTRIBUTES.forEach((attrName) => {
    const attrValue = el.getAttribute(attrName);
    if (!attrValue) return;
    const translated = localizeUiText(attrValue, attrValue);
    if (translated !== attrValue) el.setAttribute(attrName, translated);
  });

  if (
    el.tagName === "INPUT" &&
    /^(button|submit|reset)$/i.test(el.getAttribute("type") || "") &&
    typeof el.value === "string"
  ) {
    const translatedValue = localizeUiText(el.value, el.value);
    if (translatedValue !== el.value) el.value = translatedValue;
  }
}

function shouldSkipTextNode(node) {
  if (!node || node.nodeType !== 3) return true;
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.closest?.("[data-no-i18n='1']")) return true;
  if (I18N_TEXT_NODE_SKIP_TAGS.has(parent.tagName)) return true;
  return false;
}

function localizeTextNode(node) {
  if (shouldSkipTextNode(node)) return;
  const original = node.nodeValue;
  if (!original || !original.trim()) return;
  const translated = localizeUiText(original, original);
  if (translated !== original) {
    node.nodeValue = translated;
  }
}

function localizeDomTree(root = document) {
  if (typeof document === "undefined" || !root) return;
  const base = root.nodeType === 9 ? root.documentElement : root;
  if (!base) return;

  try {
    if (base.nodeType === 1) {
      localizeElementAttributes(base);
    }
    if (base.querySelectorAll) {
      base.querySelectorAll("*").forEach(localizeElementAttributes);
    }
  } catch (_) {}

  if (!document.createTreeWalker || typeof NodeFilter === "undefined") return;
  try {
    const walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    textNodes.forEach(localizeTextNode);
  } catch (_) {}
}

function ensureI18nDomObserver() {
  if (typeof document === "undefined" || !document.body) return;
  if (typeof MutationObserver === "undefined") return;
  if (i18nDomObserver) return;

  i18nDomObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (!mutation.addedNodes || mutation.addedNodes.length === 0) return;
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 || node.nodeType === 9) {
          localizeDomTree(node);
          return;
        }
        if (node.nodeType === 3) {
          localizeTextNode(node);
        }
      });
    });
  });

  i18nDomObserver.observe(document.body, { childList: true, subtree: true });
}

async function loadLocalizationFromN8n(params = {}, opts = {}) {
  if (!window.API || typeof window.API.getLocalizationDictionary !== "function") return I18N_DICTIONARY;
  try {
    const dictionary = await window.API.getLocalizationDictionary(params, opts);
    if (dictionary && typeof dictionary === "object" && !Array.isArray(dictionary)) {
      setLocalizationDictionary(dictionary);
    }
    return I18N_DICTIONARY;
  } catch (error) {
    console.warn("Не удалось загрузить локализацию из n8n", error);
    return I18N_DICTIONARY;
  }
}

window.setLocalizationDictionary = setLocalizationDictionary;
window.getLocalizationValue = getLocalizationValue;
window.getLocalizationList = getLocalizationList;
window.loadLocalizationFromN8n = loadLocalizationFromN8n;
window.localizeUiText = localizeUiText;
window.localizeDomTree = localizeDomTree;
window.ensureI18nDomObserver = ensureI18nDomObserver;
window.translate = localizeUiText;
window.i18n = getLocalizationValue;
window.i18nList = getLocalizationList;
window.tr = localizeUiText;

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

const GLOBAL_ERROR_POPUP_TEXT_FALLBACK = "Произошла ошибка. Перезагрузите страницу";
function getGlobalErrorPopupText() {
  return getLocalizationValue("global.error.reload", GLOBAL_ERROR_POPUP_TEXT_FALLBACK);
}
let lastGlobalErrorPopupAt = 0;
let lastGlobalErrorPopupMessage = "";
let pendingGlobalErrorPopupMessage = null;
let globalErrorDomReadyHooked = false;

function sanitizeErrorPopupMessage(message) {
  const s = String(message || "").trim();
  if (!s) return getGlobalErrorPopupText();
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
    const baseText = getGlobalErrorPopupText();
    const msg = firstText ? `${baseText}: ${firstText}` : baseText;
    showGlobalErrorPopupSafely(msg);
  } catch (_) {}
}

// Also catch uncaught errors that may not go through console.error
window.addEventListener("error", (event) => {
  try {
    const baseText = getGlobalErrorPopupText();
    const msg = event?.message ? `${baseText}: ${event.message}` : baseText;
    showGlobalErrorPopupSafely(msg);
  } catch (_) {}
});

window.addEventListener("unhandledrejection", (event) => {
  try {
    const reason = event?.reason;
    const baseText = getGlobalErrorPopupText();
    const msg = reason?.message
      ? `${baseText}: ${reason.message}`
      : baseText;
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

function isNavigationContextActive(context) {
  if (!context || context.scope === "global") return true;
  const navigation = window.__NAVIGATION;
  return !!navigation &&
    navigation.pageId === context.pageId &&
    navigation.version === context.navVersion &&
    !context.signal?.aborted;
}

function captureLegacyRequestContext(request) {
  const navigation = window.__NAVIGATION;
  const scope = request?.scope || (navigation?.pageId ? "page" : "global");
  const context = {
    scope,
    pageId: navigation?.pageId ?? null,
    navVersion: navigation?.version ?? 0,
    signal: scope === "page" ? navigation?.controller?.signal : undefined,
  };
  context.isActive = () => isNavigationContextActive(context);
  return context;
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
  const requestContext = captureLegacyRequestContext(request);
  const returnToJsFuncName = "globalJSCallbackFunction";
  try {
    const processedParams = processRequestParams(request.params);
    const paramsWithToken = {
      ...processedParams,
      token: window.token
    };
    const response = await requestViaN8nOrMock(request.googleFuncName, paramsWithToken, {
      scope: requestContext.scope,
      signal: requestContext.signal,
    });
    console.debug("[API RESPONSE]", {
      action: request.googleFuncName,
      requestPage: requestContext.pageId,
      requestVersion: requestContext.navVersion,
      currentPage: window.__NAVIGATION?.pageId,
      currentVersion: window.__NAVIGATION?.version,
    });
    if (!isNavigationContextActive(requestContext)) {
      console.debug("[STALE API RESPONSE BLOCKED]", {
        action: request.googleFuncName,
        requestPage: requestContext.pageId,
        requestVersion: requestContext.navVersion,
        currentPage: window.__NAVIGATION?.pageId,
        currentVersion: window.__NAVIGATION?.version,
      });
      const error = new Error("Page request belongs to an inactive navigation");
      error.name = "AbortError";
      throw error;
    }
    if (typeof window[returnToJsFuncName] === 'function') {
      window[returnToJsFuncName](request.callbackJSfunctionName, response, requestContext, request.googleFuncName);
    }
    return response;
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    console.error("runGSfunctionPromise failed:", request?.googleFuncName, error);
    throw error;
  }
}

async function getDataFromServer(request) {
  const data = await runGSfunctionPromise(request);
  return data;
}

async function runGSfunction(request) {
  if (!request.callbackJSfunctionName) { request.callbackJSfunctionName = guidGenerator(); }
  const requestContext = captureLegacyRequestContext(request);
  const returnToJsFuncName = "globalJSCallbackFunction";
  try {
    const processedParams = processRequestParams(request.params);
    const paramsWithToken = {
      ...processedParams,
      token: window.token
    };
    const response = await requestViaN8nOrMock(request.googleFuncName, paramsWithToken, {
      scope: requestContext.scope,
      signal: requestContext.signal,
    });
    console.debug("[API RESPONSE]", {
      action: request.googleFuncName,
      requestPage: requestContext.pageId,
      requestVersion: requestContext.navVersion,
      currentPage: window.__NAVIGATION?.pageId,
      currentVersion: window.__NAVIGATION?.version,
    });
    if (typeof window[returnToJsFuncName] === 'function') {
      console.debug("[API CALLBACK]", {
        funcName: request.callbackJSfunctionName,
        requestPage: requestContext.pageId,
        requestVersion: requestContext.navVersion,
        currentPage: window.__NAVIGATION?.pageId,
        currentVersion: window.__NAVIGATION?.version,
      });
      window[returnToJsFuncName](request.callbackJSfunctionName, response, requestContext, request.googleFuncName);
    }
  } catch (error) {
    if (error?.name === "AbortError" || !isNavigationContextActive(requestContext)) return;
    console.error("runGSfunction failed:", request?.googleFuncName, error);
    showErrorPopup(error?.message || String(error));
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

function globalJSCallbackFunction(funcName, response, requestContext, action) {
  if (!isNavigationContextActive(requestContext)) {
    console.debug("[STALE API CALLBACK BLOCKED]", {
      functionName: funcName,
      action,
      requestPage: requestContext?.pageId,
      requestVersion: requestContext?.navVersion,
      currentPage: window.__NAVIGATION?.pageId,
      currentVersion: window.__NAVIGATION?.version,
    });
    return;
  }
  try {
    if (typeof window[funcName] === 'function') {
      window[funcName](response, requestContext);
    }
  } catch (error) {
    console.error(`globalJSCallbackFunction handler failed: ${funcName}`, error);
    showErrorPopup(error?.message || String(error));
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
