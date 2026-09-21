

class ChartDrawer {
    constructor() {
        // Загружаем Google Charts
        google.charts.load("current", { packages: ["corechart", "bar"] });

        // Глобальные опции, применимые ко всем графикам
        this.globalOptions = {
            is3D: true,
            width: '100%',
            chartArea: { width: "500px", height: "500px" },
            legend: { position: "right" },
            animation: {
                startup: true,
                duration: 1000,
                easing: "out",
        },
        };
    }

    drawChart(type, containerId, data, specificOptions = {}, isBarChart = false) {
        // Ждем загрузки Google Charts
        google.charts.setOnLoadCallback(() => {
            // Преобразуем данные в DataTable
            const dataTable = google.visualization.arrayToDataTable(data);

            // Объединяем глобальные и специфические опции
            const options = { ...this.globalOptions, ...specificOptions };

            // Определяем тип графика
            let chart;
            if (type === "PieChart") {
                chart = new google.visualization.PieChart(document.getElementById(containerId));
            } else if (type === "ScatterChart") {
                chart = new google.visualization.ScatterChart(document.getElementById(containerId));
            } else if (type === "ColumnChart") {
                chart = new google.visualization.ColumnChart(document.getElementById(containerId));
            } else if (type === "BarChart" || isBarChart) {
                chart = new google.charts.Bar(document.getElementById(containerId));
                options = google.charts.Bar.convertOptions(options);
            } else {
                console.error("Unsupported chart type:", type);
                return;
            }

            // Отрисовываем график
            chart.draw(dataTable, options);
        });
    }
}



  