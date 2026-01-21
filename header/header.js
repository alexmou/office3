
// Новый header: работает без Apps Script, использует navigateTo для SPA.

let headerHeightObserver = null;
let headerHeightResizeListenerAdded = false;

function updateAppHeaderHeight() {
  const header = document.getElementById("appHeader");
  if (!header) return;

  const next = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--app-header-height", `${next}px`);
}

function initHeaderHeightTracking() {
  const header = document.getElementById("appHeader");
  if (!header) return;

  updateAppHeaderHeight();

  if (window.ResizeObserver) {
    if (headerHeightObserver) headerHeightObserver.disconnect();
    headerHeightObserver = new ResizeObserver(() => {
      updateAppHeaderHeight();
    });
    headerHeightObserver.observe(header);
    return;
  }

  if (!headerHeightResizeListenerAdded) {
    headerHeightResizeListenerAdded = true;
    window.addEventListener("resize", () => {
      requestAnimationFrame(updateAppHeaderHeight);
    });
  }
}

window.updateAppHeaderHeight = updateAppHeaderHeight;

function initHeader(navItems = []) {
  buildMenu(navItems);
  wireHamburger();
  wireClose();
  wireLogout();
  if (typeof window.applyUserStore === "function") {
    window.applyUserStore(window.USER_STORE);
  } else {
    const storeEl = document.getElementById("store");
    if (storeEl && window.USER_STORE && typeof window.USER_STORE === "object" && window.USER_STORE.storeName) {
      storeEl.textContent = window.USER_STORE.storeName;
    }
  }
  initHeaderHeightTracking();
}

function buildMenu(navItems) {
  const ulMenu = document.getElementById("hamburgerMenu");
  if (!ulMenu) return;
  ulMenu.innerHTML = "";
  navItems.forEach((item) => {
    const li = document.createElement("li");
    li.classList.add("nav-item");
    const a = document.createElement("a");
    a.classList.add("nav-link");
    a.textContent = item.label;
    a.href = "#";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      closeNav();
      if (typeof navigateTo === "function") {
        navigateTo(item.id);
      }
    });
    li.appendChild(a);
    ulMenu.appendChild(li);
  });
}

function wireHamburger() {
  const hamburger = document.querySelector(".hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", openNav);
  }
}

function wireClose() {
  const closeBtn = document.querySelector(".closebtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeNav);
  }
}

function wireLogout() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // Удаляем токен из URL и перезагружаем
      if (typeof clearTokenAndReload === "function") {
        clearTokenAndReload();
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        history.replaceState({}, "", url.toString());
        localStorage.removeItem("lastPage");
        window.location.reload();
      }
    });
  }
}

function openNav() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.width = "160px";
}

function closeNav() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.style.width = "0";
}
    
 



  function getUserStoreByToken(storeName) {
    document.getElementById('store').textContent = storeName;
    
  }


  function userLogout(html) {
   // console.log(html)
document.body.innerHTML=html
//document.getElementById("global").outerHTML=html
document.getElementById("global").display="block"
//console.log(openedPages)
//openedPages=[]
//openedPages = openedPages.filter(item => item !== "header");
      showLogin() 
  }




function appendMenuItem(text,pageName){
       var a = document.createElement('a');
        a.classList.add('nav-link');
        a.setAttribute('aria-current', 'page');
        a.textContent = text;
        a.addEventListener("click", function (e) {

                  openPage(pageName)
                   closeNav()
        })
        return a
}








     const ICONS={
      'VESHALKA':
       '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="圖層_1" x="0" y="0" viewBox="0 0 100 100" xml:space="preserve"><path d="M50 46.6V34.8c-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8 9.8 4.4 9.8 9.8" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#333" stroke-width="3" stroke-miterlimit="10"/><path fill="#f8b26a" stroke="#333" stroke-width="3" stroke-miterlimit="10" d="M15.2 65.5h69.7v6.1H15.2z"/><path d="M89.5 64.6L52.7 42h0c-1.7-.7-3.6-.7-5.4 0h0L10.5 64.6c-1.9.9-3.2 3.1-3 5.5.3 3.4 3.2 5.5 5.9 4.5L50 54.9l36.6 19.7c2.7 1 5.6-1.1 5.9-4.5.2-2.4-1.1-4.6-3-5.5z" fill="#f8b26a" stroke="#333" stroke-width="3" stroke-miterlimit="10"/>'
}





















 

  
