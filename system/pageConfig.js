window.PAGE_CONFIG = {
  header: {
    title: "Header",
    html: "header/header.html",
    js: ["header/header.js"],
    css: ["header/header.css"]
  },
  /*
  statistic: {
    title: "Statistic",
    html: "statistic/statistic.html",
    js: ["statistic/statistic.js"],
    css: ["statistic/statistic.css"],
    externalJs: ["vendor/chartjs-4.4.1.umd.min.js"]

    },
      */
  admin_sklad: {
    title: "Warehouse administration",
    html: "admin_sklad/admin_sklad.html",
    js: ["admin_sklad/admin_sklad.js"],
    css: ["admin_sklad/admin_sklad.css"]
  },
  login: {
    title: "Login",
    html: "login/login.html",
    js: ["login/login.js"],
    css: []
  },
  newsale: {
    title: "New sale",
    html: "newsale/newsale.html",
    js: ["newsale/newsales_classes.js", "newsale/newsale.js"],
    css: ["shared/table.css", "newsale/newsale.css"]
  },
  barcode: {
    title: "Tag print",
    html: "barcode/barcode.html",
    js: ["barcode/barcode.js"],
    css: ["barcode/barcode.css"],
    externalJs: [
      "vendor/jsbarcode-3.11.6.all.min.js",
      "vendor/dom-to-image-2.6.0.min.js",
      "vendor/jspdf-2.5.1.umd.min.js"
    ]
  },
  catalog: {
    title: "Catalog",
    html: "catalog/catalog.html",
    js: ["catalog/catalog.js"],
    css: ["shared/table.css", "catalog/catalog.css"]
  },
  sales: {
    title: "Sales",
    html: "sales/sales.html",
    js: ["sales/sales.js"],
    css: ["shared/table.css"]
  },
  /*
  statistic: {
    title: "Свод",
    html: "statistic/statistic.html",
    js: ["statistic/class_ChartDrawer.js", "statistic/statistic.js", "vendor/chartjs-4.4.1.umd.min.js"],
    css: ["statistic/statistic.css"],
    externalJs: ["https://www.gstatic.com/charts/loader.js"]
  },
  */
    statistic: {
    title: "Свод",
    html: "statistic/statistic.html",
    js: ["statistic/statistic.js"],
    css: ["statistic/charts.css"],
    externalJs: ["https://cdn.jsdelivr.net/npm/chart.js"]
  },
  settings: {
    title: "Settings",
    html: "settings/settings.html",
    js: ["settings/settings.js"],
    css: ["settings/settings.css"]
  },
  salary: {
    title: "Salary",
    html: "salary/salary.html",
    js: ["salary/salary.js"],
    css: ["salary/salary.css"],
    externalJs: [
      "vendor/chartjs-4.4.1.umd.min.js"
    ]
  },
  cashregister: {
    title: "Cash Register",
    html: "cashRegister/cashRegister.html",
    js: ["cashRegister/table_li.js", "cashRegister/cashRegister.js"],
    css: ["shared/table.css", "cashRegister/cache_budget_register.css"]
  },
  budget: {
    title: "Budget",
    html: "budget/budget.html",
    js: ["budget/budget.js"],
    css: ["budget/budget.css"],
    externalJs: ["https://cdn.jsdelivr.net/npm/chart.js"]
  },
  suppliers: {
    title: "Suppliers",
    html: "suppliers/suppliers.html",
    js: ["suppliers/suppliers.js?v=20260404-5"],
    css: ["suppliers/suppliers.css?v=20260404-1"],
    externalJs: ["https://cdn.jsdelivr.net/npm/chart.js"]
  },
  schedule: {
    title: "Schedule",
    html: "schedule/schedule.html",
    js: ["schedule/schedule.js"],
    css: ["schedule/schedule.css"]
  },
  sapo: {
    title: "Sapo CRM",
    html: "sapo/sapo.html",
    js: ["sapo/sapo.js"],
    css: ["sapo/sapo.css"]
  }
};
