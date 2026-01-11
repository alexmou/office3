
  function bodyOnLoad() {



}
 

function createNewInput(elName,caption_h1){
var myDiv=document.getElementById("myDiv")
var el=document.createElement('div')
el.innerHTML ='<div class="text-field"><label class="text-field__label" for="search">'+caption_h1+'</label>  <div class="text-field__group">    <input class="text-field__input" type="search" id="'+elName+'"name="'+elName+'">    <button class="text-field__btn" name="'+elName+'" type="button" onclick="process_button(this)">Найти</button>  </div></div>'

myDiv.appendChild(el)

    const input = document.getElementById(elName);
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
         process_button(e.target);
    }
});




}



function process_button(el){
hidePage()

var el= document.getElementById(el.name)
const request = {
  googleFuncName: "getItemByArticle",
  callbackJSfunctionName: "returnCatalogItem",
  params: { article: el.value }
};

// google.script.run.withSuccessHandler(returnCatalogItem).getItemByArticle(el.value);
runGSfunctionPromise(request).catch((error) => {
  console.error("Не удалось получить данные товара через n8n:", error);
  showPage();
});
}
function returnCatalogItem(article){
var brand=document.createElement('div')
brand.id='product-container'
var art=article[0]
brand.innerHTML = generateProductInfo(art);

var qcode=document.createElement('div')
qcode.innerHTML='<div id="qrcode"></div>'


brand.appendChild(qcode)
myDiv.appendChild(brand)
var btn = document.createElement('div')
btn.innerHTML='<button id="foo">Распечатать</button><br></br>'
myDiv.appendChild(btn)
btn.onclick = function() {
  domtoimage.toBlob(brand)
    .then(function(blob) {
      window.saveAs(blob, art.name_eng + '_'+ art.article);
    });
}

var qrcode = new QRCode(
  "qrcode",
  {
    text: "https://www.khodai-studio.com/media/AR_Look/Textur_Indos_Spirit_01.usdz", // fallback
    width: 300,
    height: 300,
    colorDark : "#000000",
    colorLight : "#FFFFFF",
    correctLevel : QRCode.CorrectLevel.M
  }
);
qrcode.makeCode(art.article);


showPage()
}




    function generateProductInfo(product) {
        return `
            <div class="product-info">
                <h2>${product.name_eng}</h2>
                <p><strong>Art:</strong> ${product.article}</p>
                <p><strong>Color:</strong> ${product.color}</p>
                <p><strong>Size:</strong> ${product.size}</p>
                <p class="price">${product.price}</p>
                <p><strong>Material:</strong> ${product.material}</p>
                <p><strong>BUTTON : ROUGE</strong></p>
                <p><strong>brand</strong></p>
            </div>
        `;
    }

    // Получаем контейнер и добавляем сгенерированный HTML



