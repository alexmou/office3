(() => {
  let selectedStoreId = 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitLogin();
  };

  const handleButtonClick = async (event) => {
    event.preventDefault();
    await submitLogin();
  };

  async function submitLogin() {
    const loginInput = document.getElementById("login");
    const passwordInput = document.getElementById("password");
    const loginValue = loginInput?.value || "";
    const passwordValue = passwordInput?.value || "";

    if (!loginValue || !passwordValue) {
      alert("Please enter both username and password");
      return;
    }

    if (selectedStoreId === 0) {
      showErrorPopup("Please select a store");
      return;
    }

    await handleLogin(loginValue, passwordValue, selectedStoreId);
  }

  function selectStore(storeId) {
    document.querySelectorAll(".store-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    const selectedBtn = document.getElementById(`store${storeId}`);
    if (selectedBtn) {
      selectedBtn.classList.add("selected");
      selectedStoreId = storeId;
    }
  }

  function showStoresChoice(stores) {
    if (typeof stores === "string") {
      try {
        stores = JSON.parse(stores);
      } catch (e) {
        console.error("Failed to parse stores", e);
        return;
      }
    }
    if (!Array.isArray(stores) || stores.length < 1) return;

    const storesData = stores
      .map((store) => {
        const storeId = store?.storeId ?? store?.id ?? store?.[0];
        const storeName = store?.storeName ?? store?.name ?? store?.[1];
        const numericId = Number(storeId);
        if (!storeName || Number.isNaN(numericId)) return null;
        return { storeId: numericId, storeName };
      })
      .filter(Boolean);

    if (storesData.length === 0) return;

    const container = document.getElementById("stores-container");
    if (!container) return;
    container.innerHTML = "";

    storesData.forEach((store) => {
      const { storeId, storeName } = store;

      const storeOption = document.createElement("div");
      storeOption.className = "store-option";

      const storeBtn = document.createElement("div");
      storeBtn.id = `store${storeId}`;
      storeBtn.className = "store-btn";
      storeBtn.textContent = storeName;
      storeBtn.onclick = function() {
        selectStore(storeId);
      };

      storeOption.appendChild(storeBtn);
      container.appendChild(storeOption);
    });

    const existingContainer =
      document.querySelector(".stores-container") ||
      document.querySelector(".store-option")?.parentElement;

    if (existingContainer && existingContainer !== container) {
      existingContainer.parentNode.replaceChild(container, existingContainer);
    } else if (!existingContainer) {
      document.body.insertBefore(container, document.body.firstChild);
    }

    window.validateStoreSelection = function() {
      const selectedBtn = document.querySelector(".store-btn.selected");
      if (!selectedBtn) {
        showErrorPopup("Please select a store");
        return false;
      }
      return selectedBtn.id.replace("store", "");
    };
  }

  async function getStores() {
    try {
      const params = window.token ? { token: window.token } : {};
      const resp = await API.getStores(params, { webhook: "prod" });
      const parsed = typeof resp === "string" ? JSON.parse(resp) : resp;
      const stores = parsed?.data || parsed;
      if (Array.isArray(stores) && stores.length > 0) return stores;
    } catch (e) {
      console.error("getStores failed", e);
    }
    // fallback: return cached or example structure to avoid empty UI
    if (Array.isArray(window.STORES_CACHE) && window.STORES_CACHE.length > 0) {
      return window.STORES_CACHE;
    }
    try {
      const cachedRaw = window.localStorage?.getItem("stores_cache");
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch (e) {
      console.warn("Не удалось прочитать stores_cache из localStorage", e);
    }
    return [];
  }

  async function showLogin() {
    const loginHtml = document.getElementById("global");
    if (loginHtml) {
      loginHtml.style.display = "block";
    }

    try {
      const stores = await getStores();
      showStoresChoice(stores);
    } catch (e) {
      console.error("Failed to load stores", e);
      showErrorPopup("Ошибка загрузки списка магазинов");
    }
    bindLoginForm();
  }

  function bindLoginForm() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.removeEventListener("submit", handleSubmit);
      loginForm.addEventListener("submit", handleSubmit);
    }

    const btn = document.getElementById("submitButton");
    if (btn) {
      btn.removeEventListener("click", handleButtonClick);
      btn.addEventListener("click", handleButtonClick);
    }
  }

  async function login(l, p, store) {
    const payload = { login: l, password: p, store };
    window.currentLoginName = l;
    const resp = await API.setToken(payload);
    const parsed = typeof resp === "string" ? JSON.parse(resp) : resp;
    if (!parsed || !parsed.token) {
      showErrorPopup("Неверный логин или пароль");
      return null;
    }
    return parsed;
  }

  async function getAuthData(me) {
    try {
      if (typeof me === "string") {
        me = JSON.parse(me);
      }
    } catch (e) {
      console.error("Не удалось распарсить ответ getAuthData", e);
      showErrorPopup("Ошибка авторизации: некорректный ответ");
      return;
    }

    if (me && me.token) {
      token = me.token;
      globalUrl = me.globalUrl || (window.location.origin + window.location.pathname + "?");
      setToken(token, globalUrl);
      const preferred = typeof window.getPreferredInitialPage === "function"
        ? window.getPreferredInitialPage()
        : null;
      navigateTo(preferred || "newsale");
    } else {
      alert("Неверный логин или пароль");
    }
  }

  async function handleLogin(l, p, store) {
    try {
      const authData = await login(l, p, store);
      if (authData) {
        await getAuthData(authData);
      }
    } catch (e) {
      console.error("Login failed", e);
      showErrorPopup("Ошибка авторизации");
    }
  }

  window.showLogin = showLogin;

  registerPageInit("login", () => {
    showLogin().catch((err) => console.error("Login init failed", err));
  });
})();
