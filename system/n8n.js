
var WEBHOOK;

function getRuntimeEnv() {
  return window.APP_ENV || window.RUNTIME_ENV || window.APP_CONFIG || {};
}

function getRuntimeQueryParam(name) {
  try {
    const params = new URLSearchParams(window.location.search || "");
    return params.get(name) || "";
  } catch (_) {
    return "";
  } 
}

function normalizeN8nBaseUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.replace(/\/+(webhook(?:-test)?\/?)?$/i, "").replace(/\/+$/, "");
}

function resolveN8nBaseUrl() {
  const env = getRuntimeEnv();
  const configured =
    env.n8nBaseUrl ||
    env.N8N_BASE_URL ||
    env.n8nHost ||
    env.N8N_HOST ||
    env.webhookBaseUrl ||
    env.WEBHOOK_BASE_URL ||
    getRuntimeQueryParam("n8nBaseUrl") ||
    getRuntimeQueryParam("n8nHost");

  const normalizedConfigured = normalizeN8nBaseUrl(configured);
  if (normalizedConfigured) return normalizedConfigured;

 // if (window.location && window.location.origin) {
 //   return `${window.location.origin}/n8n`;
 // }

  return "https://n8n.buttonrouge.org";
}

function normalizeWebhookMode(value) {
  if (value === undefined || value === null) return "";
  const mode = String(value).trim().toLowerCase();
  return mode;
}

function resolveWebhookMode(explicitMode) {
  const env = getRuntimeEnv();
  const envMode = normalizeWebhookMode(
    env.webhookMode || env.WEBHOOK_MODE || env.mode || env.MODE
  );
  const forceRaw =
    env.forceWebhookMode !== undefined ? env.forceWebhookMode :
    env.FORCE_WEBHOOK_MODE !== undefined ? env.FORCE_WEBHOOK_MODE :
    env.webhookForce !== undefined ? env.webhookForce :
    env.WEBHOOK_FORCE !== undefined ? env.WEBHOOK_FORCE :
    false;
  const force =
    forceRaw === true ||
    forceRaw === "true" ||
    forceRaw === 1 ||
    forceRaw === "1";
  if (force && envMode) return envMode;
  const explicit = normalizeWebhookMode(explicitMode);
  if (explicit) return explicit;
  if (envMode) return envMode;
  return "prod";
}

function getWebHook(mode) {
  const resolvedMode = resolveWebhookMode(mode);
  const n8nBaseUrl = resolveN8nBaseUrl();
  if (resolvedMode === "test") {
    WEBHOOK = `${n8nBaseUrl}/webhook-test/`;
  } else {
    WEBHOOK = `${n8nBaseUrl}/webhook/`;
  }
  window.N8N_WEBHOOK_BASE = WEBHOOK;
  window.N8N_BASE_URL = n8nBaseUrl;
  return WEBHOOK;
}


function postDataToN8n(action, opts={}, timeout=700000, mode) {
//console.log(action,opts)
WEBHOOK=getWebHook(mode)
  return Promise.race([
    fetch(WEBHOOK+ action, opts),
    new Promise((_, rej) =>
      setTimeout(()=> rej(new Error('Превышено время ожидания')), timeout)
    )
  ]);
}




async function getDataFromN8n(action, paramsObj = {}, mode){
  hidePage(action)
  const webhookMode = mode !== undefined ? mode : paramsObj?.data?.query?.mode;
  WEBHOOK=getWebHook(webhookMode)


  try {
    const queryString = Object.entries(paramsObj)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`)
        .join('&');
    const url = WEBHOOK + action + '?' + queryString;
    const response = await fetch(url);
    const text = await response.text();
      showPage(action)
    return JSON.parse(text);
    //return text
        } catch (error) {
        console.error('Ошибка при GET-запросе:', error);
        const msg =
          typeof window.localizeUiText === "function"
            ? window.localizeUiText("ERROR. НЕ УДАЛОСЬ ПОЛУЧИТЬ ДАННЫЕ С СЕРВЕРА", "ERROR. НЕ УДАЛОСЬ ПОЛУЧИТЬ ДАННЫЕ С СЕРВЕРА")
            : "ERROR. НЕ УДАЛОСЬ ПОЛУЧИТЬ ДАННЫЕ С СЕРВЕРА";
        showErrorPopup(msg)
        showPage(action)
    }
}
/*
async function postDataToN8n(point, paramsObj) {
    const queryString = Object.entries(paramsObj)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`)
        .join('&');
    const url = WEBHOOK + point + '?' + queryString;
    const response = await fetch(url, {
        method: 'POST'
    });
    const text = await response.text();
    return JSON.parse(text);
}
*/





  
