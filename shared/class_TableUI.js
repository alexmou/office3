


  /**
 * Класс для работы с данными каталога.
 * Отвечает за:
 * - Хранение исходных данных
 * - Фильтрацию по условию или текущим фильтрам
 * - Загрузку данных с сервера (опционально)
 */
class TableData {
    constructor() {
        this.header = [];
        this.filterOptions = [];
        this.values = [];
        this.currentQuery = {};
        this.query = null;
        this.dataFunctionName = null;
        this.filterFunctionName = null;
        this.fullTextQuery = "";
    }

    /**
     * Инициализирует загрузку данных и создание набора данных с сервера.
     * @param {Object} query - Объект с параметрами фильтрации или условиями запроса.
     * @param {string} dataFunctionName - Название серверной функции для получения данных.
     * @param {string} filterFunctionName - Название серверной функции для получения опций фильтра.
     */
    async initWithServerQuery(query, dataFunctionName, filterFunctionName) {
        this.query = query;
        this.dataFunctionName = dataFunctionName;
        this.filterFunctionName = filterFunctionName;
        this.currentQuery = { ...query };
        await this.loadDataSequentially();
    }

    /**
     * Инициализация с уже загруженными данными (без сервера).
     * @param {Array} rowData - Двумерный массив (первая строка - заголовки).
     * @param {Array} [filters] - Опционально массив объектов {header, index}, определяющих фильтруемые колонки.
     */
    initWithPreloadedData(rowData, headerData, filters) {
        if (!Array.isArray(rowData) || rowData.length === 0) {
            throw new Error("Некорректные данные для инициализации.");
        }

        this.values = rowData;
        this.header = headerData;
        this.filterOptions = filters || this.header.map((h, i) => ({header: h, index: i}));
        // Изначально устанавливаем все фильтры в "All"
        this.filterOptions.forEach(opt => {
            this.currentQuery[opt.header] = "All";
        });
    }

    /**
     * Последовательная загрузка данных с сервера.
     */
    async loadDataSequentially() {
        await this.getAllItemsByQuery();
        await this.getFilterOptions();
    }

    /**
     * Запрашивает все товары по заданному запросу с сервера.
     */
    async getAllItemsByQuery() {
        const request = {
            googleFuncName: this.dataFunctionName,
            callbackJSfunctionName: "loadItemListUI",
            params: [this.query]
        };
        try {
            const data = await runGSfunctionPromise(request);
            const parsedData = typeof data === "string" ? JSON.parse(data) : data;
            const items = parsedData?.data?.data || parsedData?.data || parsedData;
            this.loadItemListUI(items);
        } catch (error) {
            console.error("Ошибка при получении всех товаров:", error);
        }
    }

    /**
     * Обрабатывает полученные данные товаров.
     * @param {Array} articleList - Список товаров.
     */
    loadItemListUI(articleList) {
       this.values = articleList;
    }

    /**
     * Запрашивает опции фильтрации.
     */
    async getFilterOptions() {
        const request = {
            googleFuncName: this.filterFunctionName,
            callbackJSfunctionName: "setFilterOptions",
            params: []
        };
        try {
            const data = await runGSfunctionPromise(request);
            const parsedData = typeof data === "string" ? JSON.parse(data) : data;
            const filters = parsedData?.data || parsedData;
            this.setFilterOptions(filters);
        } catch (error) {
            console.error("Ошибка при получении опций фильтрации:", error);
        }
    }

    /**
     * Устанавливает опции фильтрации.
     * @param {Array} filters - [{header: string, index: number}, ...]
     */
    setFilterOptions(filters) {
        this.header = filters.map(option => option.header);
        this.filterOptions = filters;
        // Изначально все фильтры = "All"
        this.filterOptions.forEach(opt => {
            this.currentQuery[opt.header] = "All";
        });
    }

    /**
     * Получение заголовков.
     * Если "All", вернёт все заголовки.
     * Иначе - только указанные.
     */
    getHeader(requestedHeaders = "All") {
        if (requestedHeaders === "All") return this.header;
        if (Array.isArray(requestedHeaders)) {
            return this.header.filter(h => requestedHeaders.includes(h));
        }
        return this.header.includes(requestedHeaders) ? [requestedHeaders] : [];
    }

    /**
     * Получение данных по условию "Колонка=Значение".
     * Если "All", то вернуть все данные (без заголовка).
     */
    getData(condition = "All") {
        const rows = this.values.length > 1 ? this.values : [];
        if (condition === "All") {
            return rows;
        }

        const [field, value] = condition.split("=");
        if (!field || value === undefined) return rows;

        const filterOption = this.filterOptions.find(opt => opt.header === field.trim());
        if (!filterOption) return rows;

        const colIndex = filterOption.index;
        return rows.filter(row => String(row[colIndex]).trim() === String(value).trim());
    }

    /**
     * Фильтрует данные по currentQuery.
     */
    filterByCurrentQuery() {
        const rows = this.values.length > 1 ? this.values : [];

        const filtered = rows.filter(row => {
            return Object.keys(this.currentQuery).every(key => {
                const option = this.filterOptions.find(opt => opt.header === key);
                if (!option) return true;
                const headerIndex = option.index;
                const filterValue = this.currentQuery[key];
                if (filterValue === "All") return true;
                return row[headerIndex] == filterValue;
            });
        });

        const needle = String(this.fullTextQuery || "").trim().toLowerCase();
        if (!needle) return filtered;

        return filtered.filter((row) => {
          const haystack = Array.isArray(row)
            ? row
            : (row && typeof row === "object" ? Object.values(row) : [row]);
          return haystack.some((cell) => String(cell ?? "").toLowerCase().includes(needle));
        });
    }

    /**
     * Проверка редактируемости столбца (по умолчанию все не редактируемые).
     */
    isEditable(columnNumber) {
        return false; 
    }
}


/**
 * Класс для отображения данных на странице (UI).
 * Отвечает за отрисовку таблицы, фильтров и обновление интерфейса.
 */
class TableUI {
    constructor(tableID, catalogData) {
        this.catalogData = catalogData;
        this.productListElement = document.getElementById(tableID);
        this.currentQuery = catalogData.currentQuery;
        this.colorizeRowsOptions=""
    }

    /**
     * Отрисовывает таблицу на странице.
     * @param {Array} headers - Массив заголовков столбцов.
     * @param {Array} data - Двумерный массив данных (без заголовка).
     */
    drawTable(headers, data) {
        if (!this.productListElement) {
            throw new Error("Не найден элемент для вывода таблицы.");
        }

        this.productListElement.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'relative overflow-x-auto shadow-md sm:rounded-lg';

        const table = document.createElement('table');
        table.id = "flowTable";
        table.className = 'w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400';

        // Создаем заголовок таблицы
        const thead = document.createElement('thead');
        thead.id = "thead";
        thead.className = 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400';

        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.scope = 'col';
            th.className = 'px-6 py-3';
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Создаём тело таблицы
        const tbody = document.createElement('tbody');
        tbody.id = 'tbody';

        data.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach((cell, cellIndex) => {
                const td = document.createElement('td');
                td.textContent = cell;
                if (this.catalogData.isEditable(cellIndex)) {
                    td.contentEditable = true;
                    td.classList.add('editable-cell');
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        container.appendChild(table);
        this.productListElement.appendChild(container);
    }

    /**
     * Отрисовывает фильтры над таблицей.
     * @param {Array} headers - Заголовки столбцов.
     * @param {Array} data - Отфильтрованные данные (без заголовка).
     */
    drawFilters(headers, data) {
        const thead = document.getElementById("thead");
        if (!thead) return;

        // Создаем строку для фильтров
        const filterRow = document.createElement('tr');

        headers.forEach((header, index) => {
            const th = document.createElement('th');
            const select = document.createElement('select');
            select.id = `${header}Select`;
            select.className = 'filter-select';

            const allOption = document.createElement('option');
            allOption.value = "All";
            allOption.textContent = "All";
            select.appendChild(allOption);

            // Собираем уникальные значения для текущего столбца
            const uniqueValues = new Set(data.map(row => row[index]));
            uniqueValues.forEach(value => {
                const optionElement = document.createElement('option');
                optionElement.value = value;
                optionElement.textContent = value;
                select.appendChild(optionElement);
            });

            // Устанавливаем текущее выбранное значение из currentQuery
            select.value = this.currentQuery[header] || 'All';

            // При изменении фильтра обновляем таблицу
            select.addEventListener('change', () => {
                this.currentQuery[header] = select.value;
                this.updateTable();
            });

            th.appendChild(select);
            filterRow.appendChild(th);
        });

        // Пустая ячейка (опционально для будущих действий)
        const actionTh = document.createElement('th');
        filterRow.appendChild(actionTh);

        thead.appendChild(filterRow);
    }

    /**
     * Обновляет таблицу при изменении фильтров.
     * Сначала перерисовываем таблицу, затем фильтры, и наконец обновляем опции фильтров.
     */
    updateTable() {
        const filteredData = this.catalogData.filterByCurrentQuery();
        
        // Перерисовываем таблицу
        this.drawTable(this.catalogData.header, filteredData);
        // Снова отрисовываем фильтры
        this.drawFilters(this.catalogData.header, filteredData);
        // Обновляем опции фильтров по новым данным
        this.updateFilterOptions(filteredData);
    }

    /**
     * Обновляет опции фильтров при изменении набора данных.
     * Переформировывает список значений в фильтрах с учетом текущих отфильтрованных данных.
     * @param {Array} filteredData - Текущий отфильтрованный набор данных.
     */
    updateFilterOptions(filteredData) {
        this.catalogData.header.forEach((header, index) => {
            const selectElement = document.getElementById(`${header}Select`);
            if (!selectElement) return;

            const currentValue = this.currentQuery[header];
            const uniqueValues = new Set(filteredData.map(row => row[index]));

            // Очищаем select
            selectElement.innerHTML = '';

            const allOption = document.createElement('option');
            allOption.value = 'All';
            allOption.textContent = 'All';
            selectElement.appendChild(allOption);

            uniqueValues.forEach(value => {
                const optionElement = document.createElement('option');
                optionElement.value = value;
                optionElement.textContent = value;
                selectElement.appendChild(optionElement);
            });

            // Восстанавливаем выбранный фильтр, если он ещё доступен
            if (currentValue !== 'All' && uniqueValues.has(currentValue)) {
                selectElement.value = currentValue;
            } else {
                selectElement.value = 'All';
                this.currentQuery[header] = 'All';
            }
        });
        this.colorizeRows()
    }

    /**
 * Функция для раскрашивания строк таблицы в зависимости от значения столбца.
 * @param {Object} options - Объект с настройками.
 * @param {string} options.columnName - Название столбца.
 * @param {string} options.value - Значение для раскрашивания.
 * @param {string} options.color - Цвет фона строки.
 */
colorizeRows() {

    if(!this.colorizeRowsOptions) return true
    const { columnName, value, style } = this.colorizeRowsOptions;

    // Находим таблицу
    const table = document.getElementById("flowTable");
    if (!table) {
        console.error("Таблица с id 'flowTable' не найдена.");
        return;
    }

    // Получаем индекс нужного столбца
    const headerCells = table.querySelectorAll("thead th");
    let columnIndex = -1;

    headerCells.forEach((cell, index) => {
        if (cell.textContent.trim() === columnName) {
            columnIndex = index;
        }
    });

    if (columnIndex === -1) {
        console.error(`Столбец "${columnName}" не найден в таблице.`);
        return;
    }

    // Применяем цвет к строкам, где значение в указанном столбце совпадает
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells[columnIndex] && cells[columnIndex].textContent.trim() === value) {
            row.style = style;
        }
    });
}




    /**
     * Отрисовывает таблицу и фильтры с текущими данными.
     */
    drawAll() {
        const headers = this.catalogData.getHeader("All");
        const data = this.catalogData.filterByCurrentQuery(); 
        this.drawTable(headers, data);
        this.drawFilters(headers, data);
    }
}




    
