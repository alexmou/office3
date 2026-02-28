
var WEBHOOK;

function getRuntimeEnv() {
  return window.APP_ENV || window.RUNTIME_ENV || window.APP_CONFIG || {};
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
  if (resolvedMode === "test") {
    WEBHOOK = 'https://buttonrouge.org/n8n/webhook-test/';
  } else {
    WEBHOOK = 'https://buttonrouge.org/n8n/webhook/';
  }
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
        showErrorPopup("ERROR. НЕ УДАЛОСЬ ПОЛУЧИТЬ ДАННЫЕ С СЕРВЕРА")
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





  
