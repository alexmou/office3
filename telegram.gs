function setWebhook() {
  var webAppUrl = ScriptApp.getService().getUrl().replace("/dev","") 
  var response = UrlFetchApp.fetch(telegramUrl + "/setWebhook?url=" + webAppUrl);
  Logger.log(webAppUrl)
  Logger.log(response.getContentText());
  
}
function deleteWebhook() {
   var webAppUrl = ScriptApp.getService().getUrl().replace("/dev","") 
  var response = UrlFetchApp.fetch(telegramUrl  + "/deleteWebhook?url=" + webAppUrl);
  Logger.log(response.getContentText());
  
}

 

function sendToTelegram(){

sendDataToAllChats({Name:"dddd", price:"vvvvvvv"}) 
}


function sendDataToAllChats(sale) {
  try{
    for (var i = 0; i < telegramChatIds.length; i++) {
  if (sale.price) {
    sendMessageToTelegram(telegramChatIds[i],"","Новая продажа! "+ sale.Brand +" "+sale.Name + " "+sale.description+ ": "+ toLocaleStringCorrect(sale.finalPriceVND) + " Оплата в " + sale.currency)
  }else{
    sendMessageToTelegram(telegramChatIds[i],"",sale.store + ": Итого: "+ toLocaleStringCorrect(sale.finalPrice) +" Оплата в "+ sale.currency + " Через "+ sale.paymentmethod)
  }
}
}catch (e) {
        logError(e.message + " " + arguments.callee.name)
    }
  }



function sendMessageToTelegram(chatid, title, description,actions) {
 try{

  var keyboard = {}
   keyboard.inline_keyboard = actions;

/*
   var keyboard2 = {
            "inline_keyboard": [
                [
                    {"text": "Да", "callback_data": "yes"},
                    {"text": "Нет", "callback_data": "no"}
                ]
            ]
   }

keyboard.inline_keyboard= [
                [
                    {"text": "Да", "callback_data": "yes"},
                    {"text": "Нет", "callback_data": "no"}
                ]
            ]
*/


   let caption = '<b>'+title+'</b>';
  let data = {
    method: "post",
    payload: {
    reply_markup: JSON.stringify(keyboard),
   //  inline_keyboard: JSON.stringify(keyboard2),
       caption:caption,
      method: "sendMessage",
      chat_id: chatid,
      text: description,
      disable_web_page_preview:false,
      parse_mode: "HTML"
    }
  };
 var resp= UrlFetchApp.fetch(telegramUrl +'/', data);
}catch (e) {

        logError(e.message + " " + arguments.callee.name)
    }

}



