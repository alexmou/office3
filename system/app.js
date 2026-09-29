const DEFAULT_NAV_ITEMS = [
  { id: "newsale", label: "New sale", type: "page", level: 0 },
  { id: "barcode", label: "Tag print", type: "page", level: 0 },
  { id: "catalog", label: "Catalog", type: "page", level: 0 },
  { id: "sales", label: "Sales", type: "page", level: 0 },
  { id: "salary", label: "Salary", type: "page", level: 0 },
  { id: "cashregister", label: "Cash Register", type: "page", level: 0 },
  { id: "budget", label: "Budget", type: "page", level: 0 },
  { id: "statistic", label: "Statistic", type: "page", level: 0 },
  { id: "settings", label: "Settings", type: "page", level: 0 },
  { id: "sapo", label: "Sapo CRM", type: "page", level: 0 },
];

let currentNavItems = [];

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


//------- сброс логина (переадрессация в корень)------начало-------
function initDailyAppReset() {
  const startedDate = getLocalDateKey();
  let resetTimer = null;

  function getLocalDateKey() {
    const now = new Date();

    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");
  }

  function redirectToAppRoot() {
    window.location.replace("/office/");
  }

  function checkDateChanged() {
    if (getLocalDateKey() !== startedDate) {
      redirectToAppRoot();
      return true;
    }

    return false;
  }

  function scheduleNextMidnight() {
    if (resetTimer) {
      clearTimeout(resetTimer);
    }

    if (checkDateChanged()) {
      return;
    }

    const now = new Date();

    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );

    const delay = nextMidnight.getTime() - now.getTime();

    resetTimer = setTimeout(
      redirectToAppRoot,
      delay
    );
  }

  scheduleNextMidnight();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      scheduleNextMidnight();
    }
  });

  window.addEventListener("focus", scheduleNextMidnight);
}

//------- сброс логина (переадрессация в корень)-------конец------



const loadedAssets = {
  css: new Map(),
  js: new Map(),
};

const pageInitializers = {};
const pageCleanupHandlers = new Map();

window.registerPageInit = function(pageId, fn) {
  if (pageId && typeof fn === "function") {
    pageInitializers[pageId] = fn;
  }
};

window.registerPageCleanup = function(pageId, fn) {
  if (!pageId || typeof fn !== "function") return;
  const handlers = pageCleanupHandlers.get(pageId) || new Set();
  handlers.add(fn);
  pageCleanupHandlers.set(pageId, handlers);
};

async function runPageCleanup(context) {
  if (!context) return;
  const handlers = [...context.cleanups];
  context.cleanups.clear();
  for (const cleanup of handlers) {
    try {
      const result = cleanup();
      if (result && typeof result.then === "function") {
        result.catch((err) => console.error(`Failed to cleanup page ${context.pageId}`, err));
      }
    } catch (err) {
      console.error(`Failed to cleanup page ${context.pageId}`, err);
    }
  }
  for (const cleanup of pageCleanupHandlers.get(context.pageId) || []) {
    try {
      cleanup();
    } catch (err) {
      console.error(`Failed to cleanup page ${context.pageId}`, err);
    }
  }
}

async function runPageInit(pageId, context) {
  const fn = pageInitializers[pageId];
  if (typeof fn !== "function" || !context?.isActive()) return;
  console.debug("[PAGE INIT START]", {
    pageId,
    navVersion: context.navVersion,
    currentPage: window.__NAVIGATION?.pageId,
    currentVersion: window.__NAVIGATION?.version,
  });
  try {
    await fn(context);
  } catch (err) {
    if (err?.name !== "AbortError" && !context.signal.aborted) {
      console.error(`Failed to init page ${pageId}`, err);
    }
  } finally {
    console.debug("[PAGE INIT END]", {
      pageId,
      navVersion: context.navVersion,
      currentPage: window.__NAVIGATION?.pageId,
      currentVersion: window.__NAVIGATION?.version,
    });
  }
}

let currentPageStyles = [];
const CORE_SCRIPTS = [
  "system/n8n.js",
  "system/api.js",
  "shared/class_TableUI.js",
];

// Monotonic navigation generation: only the latest navigateTo()/loadPage() call may touch the DOM/state.
let navigationVersion = 0;
window.__NAVIGATION = { version: 0, pageId: null, controller: null };
let activePageContext = null;

function createPageContext(pageId, navVersion, controller) {
  const cleanups = new Set();
  return {
    pageId,
    navVersion,
    controller,
    signal: controller.signal,
    cleanups,
    isActive() {
      return window.__NAVIGATION?.pageId === pageId &&
        window.__NAVIGATION?.version === navVersion &&
        !controller.signal.aborted;
    },
    onCleanup(fn) {
      if (typeof fn === "function") cleanups.add(fn);
    },
  };
}

function beginNavigation(pageId) {
  const previous = activePageContext;
  navigationVersion += 1;
  const controller = new AbortController();
  if (previous) {
    console.debug("[NAV INVALIDATE]", {
      oldPageId: previous.pageId,
      oldNavVersion: previous.navVersion,
      newPageId: pageId,
      newNavVersion: navigationVersion,
    });
    previous.controller?.abort();
    runPageCleanup(previous);
  }
  window.__NAVIGATION = { version: navigationVersion, pageId, controller };
  const context = createPageContext(pageId, navigationVersion, controller);
  activePageContext = context;
  currentPageName = pageId;
  return context;
}

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
  await ensureScripts(CORE_SCRIPTS);
}

async function loadHeader() {
  const headerRoot = document.getElementById("header-root");
  if (!headerRoot) return;
  const cfg = window.PAGE_CONFIG?.header;
  if (!cfg) return;

  ensureCss(cfg.css);
  await ensureScripts(cfg.js);

  let htmlText = null;
  // `fetch()` for local files is blocked in most browsers; fall back to an inline template.
  if (window.location.protocol !== "file:") {
    try {
      const res = await fetch(cfg.html);
      if (!res.ok) throw new Error(`Header HTML fetch failed: ${res.status} ${res.statusText}`);
      htmlText = await res.text();
    } catch (err) {
      console.error("Failed to load header HTML", err);
    }
  }

  headerRoot.innerHTML = htmlText ? extractBodyHtml(htmlText) : HEADER_FALLBACK_HTML;

  if (!htmlText && window.location.protocol === "file:" && typeof showErrorPopup === "function") {
    const msg = "Откройте приложение через HTTP-сервер (не file://), иначе загрузка страниц и header через fetch будет заблокирована.";
    showErrorPopup(typeof window.localizeUiText === "function" ? window.localizeUiText(msg, msg) : msg);
  }
  if (typeof initHeader === "function") {
    // По умолчанию меню пустое; затем обновляется из API.getMenu().
    initHeader([]);
  }
  if (typeof window.localizeDomTree === "function") {
    window.localizeDomTree(headerRoot);
  }
}

function unwrapMenuResponse(raw) {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!parsed) return [];
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.data)) return parsed.data;
  if (parsed.data && Array.isArray(parsed.data.data)) return parsed.data.data;
  const firstArray = Object.values(parsed).find(Array.isArray);
  return firstArray || [];
}

function normalizeMenuItems(items) {
  return (items || []).map((it) => {
    const isSection =
      it?.issection === 1 ||
      it?.issection === "1" ||
      it?.issection === true ||
      it?.isSection === 1 ||
      it?.isSection === "1" ||
      it?.isSection === true;
    const type = (it?.type || "").toString().trim() || (isSection ? "section" : "page");
    const id = (it?.pageName || it?.id || it?.pageId || "").toString().trim();
    const rawLabel = (it?.text || it?.name || it?.label || id).toString();
    const label =
      typeof window.localizeUiText === "function"
        ? window.localizeUiText(rawLabel, rawLabel)
        : rawLabel;
    const rawPos = it?.pos ?? it?.level ?? "";
    const pos = rawPos === 0 ? "0" : (rawPos == null ? "" : String(rawPos)).trim();
    const posPath = pos
      ? pos
          .split(".")
          .map((part) => parseInt(String(part).trim(), 10))
          .filter((n) => Number.isFinite(n))
      : null;
    const level = Array.isArray(posPath) ? Math.max(0, posPath.length - 1) : 0;
    return { id, label, type, level, pos, posPath, isSection };
  });
}

function applyNavToHeader(navItems) {
  if (typeof window.updateMenu === "function") {
    window.updateMenu(navItems);
  } else if (typeof initHeader === "function") {
    initHeader(navItems);
  }
}

function ensureExtraNavItems(navItems) {
  const items = Array.isArray(navItems) ? [...navItems] : [];
  if (!items.some((it) => it?.id === "sapo")) {
    items.push({ id: "sapo", label: "Sapo CRM", type: "page", level: 0 });
  }
  return items;
}

async function refreshMenu() {
  const username = String(window.currentLoginName || "").trim();
  if (!username || !window.API || typeof window.API.getMenu !== "function") {
    currentNavItems = [];
    applyNavToHeader([]);
    if (typeof window.setMenuEnabled === "function") {
      window.setMenuEnabled(false);
    }
    return currentNavItems;
  }

  try {
    const raw = await API.getMenu({ username }, { scope: "global" });
    const items = normalizeMenuItems(unwrapMenuResponse(raw));
    const filtered = items.filter((it) => it.type !== "page" || !!it.id);
    currentNavItems = ensureExtraNavItems(filtered.length > 0 ? filtered : DEFAULT_NAV_ITEMS.slice());
    applyNavToHeader(currentNavItems);
    if (typeof window.setMenuEnabled === "function") {
      window.setMenuEnabled(true);
    }
    return currentNavItems;
  } catch (err) {
    console.error("Failed to load menu via API.getMenu()", err);
    currentNavItems = ensureExtraNavItems(DEFAULT_NAV_ITEMS.slice());
    applyNavToHeader(currentNavItems);
    if (typeof window.setMenuEnabled === "function") {
      window.setMenuEnabled(true);
    }
    return currentNavItems;
  }
}

function ensureCss(cssList = []) {
  const head = document.head;
  return cssList.map((href) => {
    if (loadedAssets.css.has(href)) {
      const el = loadedAssets.css.get(href);
      el.disabled = false;
      return el;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    head.appendChild(link);
    loadedAssets.css.set(href, link);
    return link;
  });
}

function ensureScripts(scriptList = []) {
  // Share in-flight loads so concurrent navigation cannot add duplicate scripts.
  return scriptList.reduce((prev, src) => prev.then(() => loadScriptOnce(src)), Promise.resolve());
}

function loadScriptOnce(src) {
  if (loadedAssets.js.has(src)) {
    return loadedAssets.js.get(src);
  }
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(script);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
  loadedAssets.js.set(src, promise);
  return promise;
}

function cleanupPageAssets() {
  // Page scripts stay loaded so their registerPageInit hooks remain available.
  currentPageStyles.forEach((s) => s.remove());
  currentPageStyles = [];
}

async function loadPage(pageId, context) {
  const cfg = window.PAGE_CONFIG?.[pageId];
  if (!cfg || !context?.isActive()) return;
  const isStale = () => !context.isActive();

  setPageTitle(cfg.title || pageId);
  cleanupPageAssets();
  // always ensure overlay exists before toggling
  getOverlay();
  currentPageName = pageId;
  hidePage(pageId);

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
      link.href = href;
      document.head.appendChild(link);
      currentPageStyles.push(link);
    });
  }

  if (window.location.protocol === "file:") {
    if (isStale()) return;
    const pageRoot = document.getElementById("page-root");
    if (pageRoot) {
      pageRoot.innerHTML =
        '<div style="padding:1rem;max-width:60ch">' +
        "<h2>Нужен HTTP-сервер</h2>" +
        "<p>Страницы загружаются через <code>fetch()</code>, а в режиме <code>file://</code> браузер обычно блокирует такие запросы.</p>" +
        "<p>Пример: <code>python3 -m http.server 8123</code> (в корне проекта) и открыть <code>http://127.0.0.1:8123/index/index.html</code>.</p>" +
        "</div>";
      if (typeof window.localizeDomTree === "function") {
        window.localizeDomTree(pageRoot);
      }
    }
    showPage(pageId);
    return;
  }

  let htmlText;
  try {
    const res = await fetch(cfg.html, { signal: context.signal });
    htmlText = await res.text();
  } catch (err) {
    if (err?.name === "AbortError") {
      console.debug(`[NAV] aborted page fetch: ${pageId}`);
      return;
    }
    throw err;
  }
  if (isStale()) return;

  const pageRoot = document.getElementById("page-root");
  pageRoot.innerHTML = extractBodyHtml(htmlText);
  if (typeof window.localizeDomTree === "function") {
    window.localizeDomTree(pageRoot);
  }

  const scriptsToLoad = [];
  if (cfg.externalJs) {
    scriptsToLoad.push(...cfg.externalJs);
  }
  if (cfg.js) {
    scriptsToLoad.push(...cfg.js);
  }
  await ensureScripts(scriptsToLoad);
  if (isStale()) return;

  await runPageInit(pageId, context);
  if (isStale()) return;

  if (typeof window.localizeDomTree === "function") {
    window.localizeDomTree(pageRoot);
  }
  showPage(pageId);
  const titleEl = document.getElementById("pageName");
  if (titleEl) {
    const rawTitle = cfg.title || pageId;
    titleEl.textContent =
      typeof window.localizeUiText === "function"
        ? window.localizeUiText(rawTitle, rawTitle)
        : rawTitle;
  }
  if (typeof window.updateAppHeaderHeight === "function") {
    window.updateAppHeaderHeight();
  }

  // На странице логина меню не показываем.
  if (pageId === "login") {
    applyNavToHeader([]);
    if (typeof window.setMenuEnabled === "function") {
      window.setMenuEnabled(false);
    }
  }

  persistCurrentPage(pageId);
}

function navigateTo(pageId) {
  const context = beginNavigation(pageId);
  console.debug("[NAV START]", {
    pageId,
    navVersion: context.navVersion,
    time: performance.now(),
  });

  if (pageId !== "login" && !window.token) {
    redirectToLogin();
    return;
  }
  const requiresAuthCheck = pageId !== "login" && !!window.token && !window.__authVerified;
  const load = () => loadPage(pageId, context);
  if (!requiresAuthCheck) {
    load().catch((err) => {
      console.error("Failed to load page", pageId, err);
      if (context.isActive()) showPage(pageId);
    });
    return;
  }
  ensureValidToken(pageId)
    .then((ok) => {
      if (!ok) return;
      if (!context.isActive()) {
        console.debug(`[NAV] ignored stale navigation: ${pageId}`, context.navVersion, navigationVersion);
        return;
      }
      return load();
    })
    .catch((err) => {
      if (err?.name === "AbortError" || !context.isActive()) return;
      console.error("Failed to load page", pageId, err);
      showPage(pageId);
    });
}

window.navigateTo = navigateTo;

function setPageTitle(title) {
  const titleEl = document.getElementById("pageName");
  if (!titleEl) return;
  const rawTitle = title || "";
  titleEl.textContent =
    typeof window.localizeUiText === "function"
      ? window.localizeUiText(rawTitle, rawTitle)
      : rawTitle;
}

function getPreferredInitialPage() {
  const username = String(window.currentLoginName || "").trim();
  const key = username ? `currentPageName_${username}` : "currentPageName";
  let raw = null;
  try {
    raw = window.localStorage?.getItem(key);
  } catch (e) {
    console.warn("Не удалось прочитать текущую страницу из localStorage", e);
  }
  const pageId = typeof raw === "string" ? raw.trim() : "";
  if (!pageId) return null;
  if (!window.PAGE_CONFIG?.[pageId]) return null;
  if (Array.isArray(currentNavItems) && currentNavItems.length > 0) {
    const allowed = currentNavItems.some((item) => item?.type === "page" && item?.id === pageId);
    if (!allowed) return null;
  }
  return pageId;
}
window.getPreferredInitialPage = getPreferredInitialPage;

async function persistCurrentPage(pageId) {
  if (!pageId || pageId === "login") return;
  const username = String(window.currentLoginName || "").trim();
  const key = username ? `currentPageName_${username}` : "currentPageName";
  try {
    window.localStorage?.setItem(key, pageId);
  } catch (e) {
    console.warn("Не удалось сохранить текущую страницу в localStorage", e);
  }
}

async function preloadLocalizationDictionary() {
  if (typeof window.loadLocalizationFromN8n !== "function") return null;
  try {
    return await window.loadLocalizationFromN8n({
      token: window.token,
      lang: window.APP_LANG || window.CONFIG?.APP_LANG || "en",
      scope: "ui",
    }, { scope: "global" });
  } catch (e) {
    console.warn("Не удалось загрузить словарь локализации из n8n", e);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initDailyAppReset();
  const url = new URL(window.location.href);
  const urlToken = url.searchParams.get("token");
  if (urlToken) {
    window.token = urlToken;
  }

  const headerTask = loadHeader().catch((err) => {
    console.error("Header bootstrap failed", err);
  });

  loadCoreScripts()
    .then(() => fetchConfigFromN8n())
    //.then(() => fetchUserStoreFromToken())
    .then(() => preloadLocalizationDictionary())
    .then(() => headerTask)
    .then(() => {
      if (typeof window.applyUserStore === "function") {
        window.applyUserStore(window.USER_STORE);
      }
    })
    .then(async () => {
      if (window.token) {
        const ok = await ensureValidToken("bootstrap");
        if (!ok) return;
      }
      const preferred = getPreferredInitialPage();
      const fallbackFirst = currentNavItems[0]?.id || DEFAULT_NAV_ITEMS[0]?.id;
      const initial = (window.token ? (preferred || fallbackFirst) : "login") || "login";
      if (window.token) {
        return loadPage(initial, beginNavigation(initial));
      }
      navigateTo(initial);
    })
    .catch((err) => {
      console.error("App bootstrap failed", err);
      // Still try to show header if it was requested.
      return headerTask;
    });
});

async function ensureValidToken(pageId) {
  if (pageId === "login") return true;
  if (!window.token) {
    redirectToLogin();
    return false;
  }
  try {
    const res = await API.getAuthData({ token: window.token }, { scope: "global" });
    const parsed = typeof res === "string" ? JSON.parse(res) : res;
    const respToken = parsed?.token;
    if (respToken && respToken === window.token) {
      window.AUTH_DATA = parsed;
      window.__authData = parsed;
      if (!window.__headerHydrated) {
        await updateHeaderUserInfo(parsed);
        await refreshMenu();
        window.__headerHydrated = true;
      }
      window.__authVerified = true;
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

  let stores = [];
  try {
    const resp = await API.getStores({ token: window.token }, { scope: "global" });
    const parsed = typeof resp === "string" ? JSON.parse(resp) : resp;
    stores = parsed?.data || parsed || [];
  } catch (e) {
    console.error("Failed to load stores for header", e);
    return null;
  }

  const entry = (stores || []).find((s) => {
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
