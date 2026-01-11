
var WEBHOOK


function getWebHook(mode) {
 // let WEBHOOK;
  if (mode !== undefined && mode === "test") {
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





  
