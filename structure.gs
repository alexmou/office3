

// Centralized configuration for all pages
const pageConfig = {
      header: {
        pageTitle: "",
        html: "header/header",
        javascript: ["header/header.js"],
        css: ["header/header.css"]
       
    },
          charts: {
        pageTitle: "",
        html: "charts/charts",
        javascript: ["charts/charts.js"],
        css: ["charts/charts.css"],
         src:["https://hammerjs.github.io/dist/hammer.min.js"]
       
    },

      admin_sklad: {
              pageTitle: "Администрирование складов",
              html: "admin_sklad/admin_sklad",
              javascript: ["admin_sklad/admin_sklad.js"],
              src:["https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"],
              css: ["admin_sklad/admin_sklad.css"]

          },
   
    login: {
        pageTitle: "",
        html: ["login/login"],
        javascript: [],
        css: []
    },
    newsale: {
        pageTitle: "New sale",
        html: ["newsale/newsale"],
        javascript: ["newsale/newsales_classes.js", "newsale/newsale.js"],
        css: ["newsale/newsale.css"]
    },
    barcode: {
        pageTitle: "Tag print",
        html: "barcode/barcode",
        javascript: ["barcode/barcode.js"],
        src:[
            "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.js",
            "https://cdn.bootcss.com/dom-to-image/2.6.0/dom-to-image.min.js",
            "https://cdn.bootcss.com/FileSaver.js/2014-11-29/FileSaver.min.js",
            "https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
        ],
        css: ["barcode/barcode.css"],
    },
    catalog: {
        pageTitle: "Catalog",
        html: "catalog/catalog",
        javascript: ["shared/class_TableUI.js", "catalog/catalog.js"],
        css: ["shared/table.css","catalog/catalog.css"],
    },
    sales: {
        pageTitle: "Sales",
        html: "sales/sales",
        javascript: ["system/n8n.js","shared/class_TableUI.js", "sales/sales.js"],
        css: ["shared/table.css"],
        src: [],
    },
    statistic: {
        pageTitle: "Statistic",
        html: "statistic/statistic",
        javascript: [ "statistic/class_ChartDrawer.js","statistic/statistic.js" ], 
        css: ["statistic/statistic.css"],
        src:[
            "https://www.gstatic.com/charts/loader.js",
        ]
    },
    settings: {
        pageTitle: "Settings",
        html: "settings/settings",
        javascript: ["settings/settings.js"],
        css: ["settings/settings.css"
        ],
        src:[
            "https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"
        ],
        link:[
            "https://unpkg.com/@material/mdc-web@13.0.0/dist/material-components-web.min.css",
            "https://cdn.jsdelivr.net/npm/@material/mwc-button@0.27.0/mwc-button.min.css"
        ]
    },
     salary: {
        pageTitle: "Salary",
        html: "salary/salary",
        javascript: ["salary/salary.js"],
        css: ["salary/salary.css"
        ],
        src:[
           "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js",
           "https://code.jquery.com/ui/1.10.3/jquery-ui.js",
           "https://cdn.jsdelivr.net/npm/chart.js"
       ],
        link:[
            "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"

        ]
    },
     cashregister: {
        pageTitle: "Cash Register",
        html: "cashRegister/cashRegister",
        javascript: ["cashRegister/table_li.js","cashRegister/cashRegister.js"],
        css: ["shared/table.css","cashRegister/cache_budget_register.css"],
        src:[

             ],
        link:[
            "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
        ]
    },
        budget: {
        pageTitle: "Budget",
        html: "budget2/budget2",
        javascript: ["budget2/budget2.js"],
       css: ["budget2/budget2.css"],
        src:[
              "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
             ],
        link:[
            "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
        ]
    },
      supliers: {
        pageTitle: "supliers",
        html: "supliers/supliers",
        javascript: [],
       css: [],
        src:[

             ],
        link:[

        ]
    },
    schedule: {
    pageTitle: "Schedule",
    html: "schedule/schedule",
    javascript: [ "schedule/schedule.js"],
    css: ["schedule/schedule.css"],
    src: [],
    link: []
},






};
