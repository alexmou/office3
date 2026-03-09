window.PAGE_CONFIG = {
  header: {
    title: "Header",
    html: "../header/header.html",
    js: ["../header/header.js"],
    css: ["../header/header.css"]
  },
  charts: {
    title: "Charts",
    html: "../charts/charts.html",
    js: ["../charts/charts.js"],
    css: ["../charts/charts.css"],
    externalJs: ["../vendor/chartjs-4.4.1.umd.min.js"]
  },
  admin_sklad: {
    title: "Warehouse administration",
    html: "../admin_sklad/admin_sklad.html",
    js: ["../admin_sklad/admin_sklad.js"],
    css: ["../admin_sklad/admin_sklad.css"]
  },
  login: {
    title: "Login",
    html: "../login/login.html",
    js: ["../login/login.js"],
    css: []
  },
  newsale: {
    title: "New sale",
    html: "../newsale/newsale.html",
    js: ["../newsale/newsales_classes.js?v=20260309-1", "../newsale/newsale.js?v=20260309-1"],
    css: ["../shared/table.css", "../newsale/newsale.css"]
  },
  barcode: {
    title: "Tag print",
    html: "../barcode/barcode.html",
    js: ["../barcode/barcode.js"],
    css: ["../barcode/barcode.css"],
    externalJs: [
      "../vendor/jsbarcode-3.11.6.all.min.js",
      "../vendor/dom-to-image-2.6.0.min.js",
      "../vendor/jspdf-2.5.1.umd.min.js"
    ]
  },
  catalog: {
    title: "Catalog",
    html: "../catalog/catalog.html",
    js: ["../catalog/catalog.js"],
    css: ["../shared/table.css", "../catalog/catalog.css"]
  },
  sales: {
    title: "Sales",
    html: "../sales/sales.html",
    js: ["../sales/sales.js"],
    css: ["../shared/table.css"]
  },
  statistic: {
    title: "Statistic",
    html: "../statistic/statistic.html",
    js: ["../statistic/class_ChartDrawer.js", "../statistic/statistic.js"],
    css: ["../statistic/statistic.css"],
    externalJs: ["https://www.gstatic.com/charts/loader.js"]
  },
  settings: {
    title: "Settings",
    html: "../settings/settings.html",
    js: ["../settings/settings.js"],
    css: ["../settings/settings.css"]
  },
  salary: {
    title: "Salary",
    html: "../salary/salary.html",
    js: ["../salary/salary.js"],
    css: ["../salary/salary.css"],
    externalJs: [
      "../vendor/jquery-2.1.3.min.js",
      "../vendor/jquery-ui-1.10.3.min.js",
      "../vendor/chartjs-4.4.1.umd.min.js"
    ]
  },
  cashregister: {
    title: "Cash Register",
    html: "../cashRegister/cashRegister.html",
    js: ["../cashRegister/table_li.js", "../cashRegister/cashRegister.js"],
    css: ["../shared/table.css", "../cashRegister/cache_budget_register.css"]
  },
  budget: {
    title: "Budget",
    html: "../budget2/budget2.html",
    js: ["../budget2/budget2.js"],
    css: ["../budget2/budget2.css"],
    externalJs: ["../vendor/chartjs-4.4.1.umd.min.js"]
  },
  supliers: {
    title: "Supliers",
    html: "../supliers/supliers.html",
    js: [],
    css: []
  },
  schedule: {
    title: "Schedule",
    html: "../schedule/schedule.html",
    js: ["../schedule/schedule.js"],
    css: ["../schedule/schedule.css"]
  }
};
