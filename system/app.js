const NAV_ITEMS = [
  { id: "newsale", label: "New sale" },
  { id: "barcode", label: "Tag print" },
  { id: "catalog", label: "Catalog" },
  { id: "sales", label: "Sales" },
  { id: "salary", label: "Salary" },
  { id: "cashregister", label: "Cash Register" },
  { id: "budget", label: "Budget" },
  { id: "statistic", label: "Statistic" },
  { id: "settings", label: "Settings" },
];

const HEADER_FALLBACK_HTML = `
  <header class="app-header" id="appHeader">
    <div class="app-topbar">
      <div class="app-topbar-left">
        <button class="hamburger" type="button" aria-label="Open menu">&#9776;</button>
      </div>
      <div class="app-topbar-center">
        <div class="brand" aria-label="Button Rouge">Button Rouge</div>
      </div>
      <div class="app-topbar-right user-info">
        <span id="store"></span>
        <span id="username"></span>
        <button id="logoutButton" type="button">Logout</button>
      </div>
    </div>

    <div class="app-titlebar" aria-label="Page title">
      <h1 id="pageName"></h1>
    </div>

    <nav class="sidebar" id="sidebar" aria-label="Menu">
      <button class="closebtn" type="button" aria-label="Close menu">&times;</button>
      <ul id="hamburgerMenu"></ul>
    </nav>
  </header>
`;

const loadedAssets = {
  css: new Map(),
  js: new Map(),
};

const pageInitializers = {};
let storeCache = null;

window.registerPageInit = function(pageId, fn) {
  if (pageId && typeof fn === "function") {
    pageInitializers[pageId] = fn;
  }
};

async function runPageInit(pageId) {
  const fn = pageInitializers[pageId];
  if (typeof fn === "function") {
    try {
      const res = fn();
      if (res && typeof res.then === "function") {
        await res;
      }
    } catch (err) {
      console.error(`Failed to init page ${pageId}`, err);
    }
  }
}

let currentPageScripts = [];
let currentPageStyles = [];
const CORE_SCRIPTS = [
  "../system/n8n.js",
  "../system/api.js",
  "../shared/class_TableUI.js",
];

function extractBodyHtml(htmlText) {
  const parsed = new DOMParser().parseFromString(htmlText, "text/html");
  if (!parsed?.body) return htmlText;

  // Strip scripts and comments so JS code is not rendered as text.
  parsed.body.querySelectorAll("script").forEach((el) => el.remove());
  if (parsed.createTreeWalker && window.NodeFilter) {
    const walker = parsed.createTreeWalker(parsed.body, NodeFilter.SHOW_COMMENT);
    const toRemove = [];
    while (walker.nextNode()) {
      toRemove.push(walker.currentNode);
    }
    toRemove.forEach((node) => node.parentNode?.removeChild(node));
  }

  return parsed.body.innerHTML || htmlText;
}

async function loadCoreScripts() {
  await ensureScripts(CORE_SCRIPTS, { persistent: true });
}

async function loadHeader() {
  const headerRoot = document.getElementById("header-root");
  if (!headerRoot) return;
  const cfg = window.PAGE_CONFIG?.header;
  if (!cfg) return;

  ensureCss(cfg.css);
  await ensureScripts(cfg.js, { persistent: true });

  let htmlText = null;
  // `fetch()` for local files is blocked in most browsers; fall back to an inline template.
  if (window.location.protocol !== "file:") {
    try {
      const res = await fetch(cfg.html, { cache: "no-store" });
      if (!res.ok) throw new Error(`Header HTML fetch failed: ${res.status} ${res.statusText}`);
      htmlText = await res.text();
    } catch (err) {
      console.error("Failed to load header HTML", err);
    }
  }

  headerRoot.innerHTML = htmlText ? extractBodyHtml(htmlText) : HEADER_FALLBACK_HTML;

  if (!htmlText && window.location.protocol === "file:" && typeof showErrorPopup === "function") {
    showErrorPopup("Откройте приложение через HTTP-сервер (не file://), иначе загрузка страниц и header через fetch будет заблокирована.");
  }
  if (typeof initHeader === "function") {
    initHeader(NAV_ITEMS);
  }
}

function ensureCss(cssList = []) {
  const head = document.head;
  const cacheBust = Date.now();
  return cssList.map((href) => {
    if (loadedAssets.css.has(href)) {
      const el = loadedAssets.css.get(href);
      el.disabled = false;
      return el;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${href}?v=${cacheBust}`;
    head.appendChild(link);
    loadedAssets.css.set(href, link);
    return link;
  });
}

function ensureScripts(scriptList = [], opts = {}) {
  // Загружаем последовательно, чтобы сохранить порядок зависимостей
  return scriptList.reduce((prev, src) => {
    return prev.then(
      () =>
        new Promise((resolve, reject) => {
          // Если уже загружали этот скрипт, просто резолвим.
          if (loadedAssets.js.has(src)) {
            return resolve(loadedAssets.js.get(src));
          }

          const url = `${src}?v=${Date.now()}`;
          const script = document.createElement("script");
          script.src = url;
          script.onload = () => {
            loadedAssets.js.set(src, script);
            resolve(script);
          };
          script.onerror = (err) => reject(err);
          document.body.appendChild(script);
          currentPageScripts.push(script);
        })
    );
  }, Promise.resolve());
}

function cleanupPageAssets() {
  currentPageScripts.forEach((s) => s.remove());
  currentPageScripts = [];
  currentPageStyles.forEach((s) => s.remove());
  currentPageStyles = [];
}

async function loadPage(pageId) {
  const cfg = window.PAGE_CONFIG?.[pageId];
  if (!cfg) return;

  cleanupPageAssets();
  // always ensure overlay exists before toggling
  getOverlay();
  currentPageName = pageId;
  hidePage(pageId);

  const cacheBustCss = (href) => {
    const url = String(href || "");
    if (!url) return url;
    // Не трогаем внешние URL (CDN) и уже закеш-бастнутые.
    if (/^https?:\/\//i.test(url)) return url;
    if (/[?&]v=/.test(url)) return url;
    return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
  };

  if (cfg.externalCss) {
    cfg.externalCss.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      currentPageStyles.push(link);
    });
  }
  if (cfg.css) {
    cfg.css.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cacheBustCss(href);
      document.head.appendChild(link);
      currentPageStyles.push(link);
    });
  }

  if (window.location.protocol === "file:") {
    const pageRoot = document.getElementById("page-root");
    if (pageRoot) {
      pageRoot.innerHTML =
        '<div style="padding:1rem;max-width:60ch">' +
        "<h2>Нужен HTTP-сервер</h2>" +
        "<p>Страницы загружаются через <code>fetch()</code>, а в режиме <code>file://</code> браузер обычно блокирует такие запросы.</p>" +
        "<p>Пример: <code>python3 -m http.server 8123</code> (в корне проекта) и открыть <code>http://127.0.0.1:8123/index/index.html</code>.</p>" +
        "</div>";
    }
    showPage(pageId);
    return;
  }

  const res = await fetch(cfg.html, { cache: "no-store" });
  const htmlText = await res.text();
  const pageRoot = document.getElementById("page-root");
  pageRoot.innerHTML = extractBodyHtml(htmlText);

  const scriptsToLoad = [];
  if (cfg.externalJs) {
    scriptsToLoad.push(...cfg.externalJs);
  }
  if (cfg.js) {
    scriptsToLoad.push(...cfg.js);
  }
  await ensureScripts(scriptsToLoad);
  await runPageInit(pageId);
  showPage(pageId);
  const titleEl = document.getElementById("pageName");
  if (titleEl) titleEl.textContent = cfg.title || pageId;
  if (typeof window.updateAppHeaderHeight === "function") {
    window.updateAppHeaderHeight();
  }
}

function navigateTo(pageId) {
  ensureValidToken(pageId).then((ok) => {
    if (!ok) return;
    return loadPage(pageId);
  }).then(() => {
    if (pageId && pageId !== "login") {
      localStorage.setItem("lastPage", pageId);
    }
  }).catch((err) => {
    console.error("Failed to load page", pageId, err);
    showPage(pageId);
  });
}

window.navigateTo = navigateTo;

document.addEventListener("DOMContentLoaded", () => {
  const url = new URL(window.location.href);
  const urlToken = url.searchParams.get("token");
  if (urlToken) {
    window.token = urlToken;
  }

  loadCoreScripts()
    .then(() => fetchConfigFromN8n())
    .then(() => fetchUserStoreFromToken())
    .then(() => loadHeader())
    .then(() => applyUserStore(window.USER_STORE))
    .then(() => {
      const initial = (window.token ? (localStorage.getItem("lastPage") || NAV_ITEMS[0]?.id) : "login") || "login";
      navigateTo(initial);
    });
});

async function ensureValidToken(pageId) {
  if (pageId === "login") return true;
  if (!window.token) {
    redirectToLogin();
    return false;
  }
  try {
    const res = await API.getAuthData({ token: window.token });
    const parsed = typeof res === "string" ? JSON.parse(res) : res;
    const respToken = parsed?.token;
    if (respToken && respToken === window.token) {
      await updateHeaderUserInfo(parsed);
      return true;
    }
  } catch (e) {
    console.error("Auth check failed", e);
  }
  clearTokenAndReload();
  return false;
}

async function updateHeaderUserInfo(parsedAuth) {
  const usernameEl = document.getElementById("username");
  const storeEl = document.getElementById("store");

  const username =
    parsedAuth?.username ||
    parsedAuth?.login ||
    parsedAuth?.user ||
    parsedAuth?.email ||
    parsedAuth?.Name ||
    window.currentLoginName ||
    "";
  if (username) {
    window.currentLoginName = username;
  }
  if (usernameEl && username) {
    usernameEl.textContent = username;
  }

  let storeName = parsedAuth?.storeName;
  const storeId = parsedAuth?.storeId || parsedAuth?.store;
  if (!storeName && storeId) {
    storeName = await getStoreNameById(storeId);
  }
  if (storeName) {
    applyUserStore({ storeName });
  } else if (storeEl && storeId) {
    storeEl.textContent = storeId;
  }

  if (typeof window.updateAppHeaderHeight === "function") {
    window.updateAppHeaderHeight();
  }
}

async function getStoreNameById(storeId) {
  if (!storeId) return null;
  const numericId = Number(storeId);
  if (Number.isNaN(numericId)) return null;

  if (!storeCache) {
    try {
      const resp = await API.getStores({ token: window.token });
      const parsed = typeof resp === "string" ? JSON.parse(resp) : resp;
      storeCache = parsed?.data || parsed || [];
    } catch (e) {
      console.error("Failed to load stores for header", e);
      return null;
    }
  }

  const entry = (storeCache || []).find((s) => {
    const id = Number(s?.storeId ?? s?.id ?? s?.[0]);
    return id === numericId;
  });
  return entry?.storeName || entry?.name || entry?.[1] || null;
}

function clearTokenAndReload() {
  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  history.replaceState({}, "", url.toString());
  window.location.reload();
}

function redirectToLogin() {
  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  history.replaceState({}, "", url.toString());
  if (currentPageName !== "login") {
    navigateTo("login");
  }
}
