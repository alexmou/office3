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
    externalJs: ["https://hammerjs.github.io/dist/hammer.min.js"]
  },
  admin_sklad: {
    title: "Администрирование складов",
    html: "../admin_sklad/admin_sklad.html",
    js: ["../admin_sklad/admin_sklad.js"],
    css: ["../admin_sklad/admin_sklad.css"],
    externalJs: ["https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"]
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
    js: ["../newsale/newsales_classes.js", "../newsale/newsale.js"],
    css: ["../shared/table.css", "../newsale/newsale.css"],
    externalCss: ["https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"]
  },
  barcode: {
    title: "Tag print",
    html: "../barcode/barcode.html",
    js: ["../barcode/barcode.js"],
    css: ["../barcode/barcode.css"],
    externalJs: [
      "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.js",
      "https://cdn.bootcss.com/dom-to-image/2.6.0/dom-to-image.min.js",
      "https://cdn.bootcss.com/FileSaver.js/2014-11-29/FileSaver.min.js",
      "https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
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
    css: ["../settings/settings.css"],
    externalJs: ["https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"],
    externalCss: [
      "https://unpkg.com/@material/mdc-web@13.0.0/dist/material-components-web.min.css",
      "https://cdn.jsdelivr.net/npm/@material/mwc-button@0.27.0/mwc-button.min.css"
    ]
  },
  salary: {
    title: "Salary",
    html: "../salary/salary.html",
    js: ["../salary/salary.js"],
    css: ["../salary/salary.css"],
    externalJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js",
      "https://code.jquery.com/ui/1.10.3/jquery-ui.js",
      "https://cdn.jsdelivr.net/npm/chart.js"
    ],
    externalCss: ["https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"]
  },
  cashregister: {
    title: "Cash Register",
    html: "../cashRegister/cashRegister.html",
    js: ["../cashRegister/table_li.js", "../cashRegister/cashRegister.js"],
    css: ["../shared/table.css", "../cashRegister/cache_budget_register.css"],
    externalCss: ["https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"]
  },
  budget: {
    title: "Budget",
    html: "../budget2/budget2.html",
    js: ["../budget2/budget2.js"],
    css: ["../budget2/budget2.css"],
    externalJs: ["https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"],
    externalCss: ["https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"]
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
