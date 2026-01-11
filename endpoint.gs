const IMAGEID = "17YKY8eub7RXZjy2IFXooFtOolaMCXBvt"

function validateToken(token) {
			return getUserNameByToken(token)
}


/*
function redirect(response) {
  try {
    const outerObj = typeof response === 'string' ? JSON.parse(response) : response;
    const innerValue = JSON.parse(outerObj.value);
    
    // Логирование для отладки
    console.log('Received pageName:', innerValue.pageName);
    console.log('Received token:', innerValue.token);

const  params= {
    value: innerValue.pageName,
    token: innerValue.token
  }


const res= renderPage(params)
logError(res.html)
return res

//doGet(e);
    
  } catch (e) {
    
    logError(e.message + " " + e.stack);
   }
}
*/


var request = {}
function doGet(e) {
    const token = e.parameter.token; // Получаем токен из URL
  try {
    if(e=="logout"){


	 return HtmlService.createTemplateFromFile('system/overlay').getRawContent() + HtmlService.createTemplateFromFile('login/login').getRawContent() 

    }else if(token && validateToken(token)){
    

          var html = '<script>var token = "' + token + '";</script>' 
          + HtmlService.createTemplateFromFile('system/system.js').getRawContent()
          + HtmlService.createTemplateFromFile('system/n8n.js').getRawContent()
          + HtmlService.createTemplateFromFile('system/system.css').getRawContent()
          + HtmlService.createTemplateFromFile('header/header').getRawContent() 
          + HtmlService.createTemplateFromFile('header/header.css').getRawContent()
          + HtmlService.createTemplateFromFile('header/header.js').getRawContent()
          + HtmlService.createTemplateFromFile('system/overlay').getRawContent()

          var res = HtmlService.createHtmlOutput(html);
          res.addMetaTag('viewport', 'width=device-width, initial-scale=1')
            .setFaviconUrl(`https://drive.google.com/uc?id=${IMAGEID}&export=download&format=png`)
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
          return res;
        

  }else{


			res = HtmlService.createTemplateFromFile('login/login').evaluate();
    res
    //    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    //.setFaviconUrl(`https://drive.google.com/uc?id=${IMAGEID}&export=download&format=png`)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

			return res

  
    }
	} catch (e) {
		logError(e.message + " " + e.stack);
		return HtmlService.createHtmlOutput('<b> ERROR: ' + e.message + " " + e.stack + " " + arguments.callee.name + '</b>');
	}
}
