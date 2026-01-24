
// Новый header: работает без Apps Script, использует navigateTo для SPA.

let headerHeightObserver = null;
let headerHeightResizeListenerAdded = false;
let headerWiredOnce = false;

function setMenuEnabled(enabled) {
  const hamburger = document.querySelector(".hamburger");
  const sidebar = document.getElementById("sidebar");
  const menu = document.getElementById("hamburgerMenu");

  if (hamburger) {
    hamburger.style.display = enabled ? "" : "none";
  }
  if (!enabled) {
    if (sidebar) sidebar.style.width = "0";
    if (menu) menu.innerHTML = "";
  }
}

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
  if (!headerWiredOnce) {
    headerWiredOnce = true;
    wireHamburger();
    wireClose();
    wireLogout();
  }
  setMenuEnabled(Array.isArray(navItems) && navItems.length > 0);
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

  const shouldRenderHierarchy = (navItems || []).some((item) => {
    if (!item) return false;
    if (item.isSection || item.type === "section") return true;
    const pos = item.pos;
    if (typeof pos === "string" && pos.includes(".")) return true;
    if (Array.isArray(item.posPath) && item.posPath.length > 1) return true;
    return false;
  });

  if (shouldRenderHierarchy) {
    buildMenuHierarchy(ulMenu, navItems || []);
    return;
  }

  navItems.forEach((item) => {
    const type = (item?.type || "page").toString();
    const level = Number(item?.level ?? item?.pos ?? 0) || 0;
    const li = document.createElement("li");
    li.dataset.level = String(level);

    if (type === "separator") {
      li.classList.add("nav-separator");
      const hr = document.createElement("hr");
      li.appendChild(hr);
      ulMenu.appendChild(li);
      return;
    }

    if (type === "group") {
      li.classList.add("nav-group");
      const span = document.createElement("span");
      span.classList.add("nav-group-label");
      span.textContent = item.label || item.text || "";
      span.style.paddingLeft = `${8 + level * 14}px`;
      li.appendChild(span);
      ulMenu.appendChild(li);
      return;
    }

    li.classList.add("nav-item");
    const a = document.createElement("a");
    a.classList.add("nav-link");
    a.textContent = item.label;
    a.href = "#";
    a.style.paddingLeft = `${8 + level * 14}px`;
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

function buildMenuHierarchy(ulMenu, navItems) {
  const nodes = (navItems || []).map((item, index) => {
    const posPath = Array.isArray(item?.posPath) ? item.posPath : null;
    const isSection = !!(item?.isSection || item?.type === "section");
    return {
      item: item || {},
      index,
      posPath,
      isSection,
      children: [],
    };
  });

  const mapByPath = new Map();
  const pathKey = (posPath) => (Array.isArray(posPath) && posPath.length ? posPath.join(".") : "");
  nodes.forEach((node) => {
    if (node.posPath && node.posPath.length > 0) {
      mapByPath.set(pathKey(node.posPath), node);
    }
  });

  const root = [];
  nodes.forEach((node) => {
    if (!node.posPath || node.posPath.length === 0) {
      root.push(node);
      return;
    }
    const parentPath = node.posPath.slice(0, -1);
    if (parentPath.length === 0) {
      root.push(node);
      return;
    }
    const parent = mapByPath.get(pathKey(parentPath));
    if (!parent) {
      root.push(node);
      return;
    }
    parent.children.push(node);
  });

  const sortChildren = (node) => {
    if (!node.children || node.children.length === 0) return;
    node.children.sort((a, b) => {
      const aPos = Array.isArray(a.posPath) && a.posPath.length ? a.posPath[a.posPath.length - 1] : Number.MAX_SAFE_INTEGER;
      const bPos = Array.isArray(b.posPath) && b.posPath.length ? b.posPath[b.posPath.length - 1] : Number.MAX_SAFE_INTEGER;
      if (aPos !== bPos) return aPos - bPos;
      return a.index - b.index;
    });
    node.children.forEach(sortChildren);
  };

  root.sort((a, b) => a.index - b.index);
  root.forEach(sortChildren);

  ulMenu.innerHTML = "";
  renderHierarchyList(ulMenu, root, 0);
}

function renderHierarchyList(containerUl, nodes, depth) {
  (nodes || []).forEach((node) => {
    const item = node?.item || {};
    const type = (item?.type || (node.isSection ? "section" : "page")).toString();
    const label = (item?.label ?? item?.text ?? item?.name ?? "").toString();
    const id = (item?.id ?? item?.pageName ?? "").toString();

    if (type === "separator") {
      const li = document.createElement("li");
      li.classList.add("nav-separator");
      const hr = document.createElement("hr");
      li.appendChild(hr);
      containerUl.appendChild(li);
      return;
    }

    if (type === "group") {
      const li = document.createElement("li");
      li.classList.add("nav-group");
      const span = document.createElement("span");
      span.classList.add("nav-group-label");
      span.textContent = item.label || item.text || "";
      span.style.paddingLeft = `${8 + depth * 14}px`;
      li.appendChild(span);
      containerUl.appendChild(li);
      return;
    }

    if (node.isSection) {
      const li = document.createElement("li");
      li.classList.add("nav-section", "collapsed");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.add("nav-section-toggle");
      btn.style.paddingLeft = `${8 + depth * 14}px`;
      btn.setAttribute("aria-expanded", "false");

      const icon = document.createElement("span");
      icon.classList.add("nav-section-icon");
      icon.textContent = "›";
      btn.appendChild(icon);

      const text = document.createElement("span");
      text.classList.add("nav-section-label");
      text.textContent = label;
      btn.appendChild(text);

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const collapsed = li.classList.toggle("collapsed");
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        if (typeof window.updateAppHeaderHeight === "function") {
          window.updateAppHeaderHeight();
        }
      });

      li.appendChild(btn);

      const sub = document.createElement("ul");
      sub.classList.add("nav-submenu");
      li.appendChild(sub);
      containerUl.appendChild(li);

      renderHierarchyList(sub, node.children || [], depth + 1);
      return;
    }

    const li = document.createElement("li");
    li.classList.add("nav-item");
    const a = document.createElement("a");
    a.classList.add("nav-link");
    a.textContent = label;
    a.href = "#";
    a.style.paddingLeft = `${8 + depth * 14}px`;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      closeNav();
      if (typeof navigateTo === "function") {
        navigateTo(id);
      }
    });
    li.appendChild(a);
    containerUl.appendChild(li);
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

window.updateMenu = function(navItems = []) {
  buildMenu(navItems);
  setMenuEnabled(Array.isArray(navItems) && navItems.length > 0);
  if (typeof window.updateAppHeaderHeight === "function") {
    window.updateAppHeaderHeight();
  }
};

window.setMenuEnabled = setMenuEnabled;
    
 



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





















 

  
