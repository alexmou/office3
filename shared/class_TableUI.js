


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
        this.inStockOnly = false;
        this.inStockField = "quantity";
        this._searchIndex = null;
        this._searchIndexRows = null;
    }

    /**
     * Инициализирует загрузку данных и создание набора данных с сервера.
     * @param {Object} query - Объект с параметрами фильтрации или условиями запроса.
     * @param {string} dataFunctionName - Название серверной функции для получения данных.
     * @param {string} [filterFunctionName] - Опционально: функция для получения опций фильтра.
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
        this.invalidateSearchIndex();
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
        if (this.filterFunctionName) {
            await this.getFilterOptions();
        }
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
       this.invalidateSearchIndex();
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
        this.invalidateSearchIndex();
        // Изначально все фильтры = "All"
        this.filterOptions.forEach(opt => {
            this.currentQuery[opt.header] = "All";
        });
    }

    invalidateSearchIndex() {
        this._searchIndex = null;
        this._searchIndexRows = null;
    }

    getSearchIndex(rows) {
        if (!Array.isArray(rows)) return [];
        if (this._searchIndex && this._searchIndexRows === rows) {
            return this._searchIndex;
        }
        this._searchIndexRows = rows;
        this._searchIndex = rows.map((row) => {
            const haystack = Array.isArray(row)
              ? row
              : (row && typeof row === "object" ? Object.values(row) : [row]);
            return haystack
              .map((cell) => String(cell ?? "").toLowerCase())
              .join("\t");
        });
        return this._searchIndex;
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
        const rows = Array.isArray(this.values) ? this.values : [];
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
        const rows = Array.isArray(this.values) ? this.values : [];
        const currentQuery = this.currentQuery || {};
        const queryKeys = Object.keys(currentQuery);
        const filterOptions = Array.isArray(this.filterOptions) ? this.filterOptions : [];
        const filterIndex = new Map();
        filterOptions.forEach((opt) => {
            if (!opt) return;
            filterIndex.set(opt.header, opt.index);
        });

        const needle = String(this.fullTextQuery || "").trim().toLowerCase();
        const useSearch = !!needle;
        const searchIndex = useSearch ? this.getSearchIndex(rows) : null;

        let qtyIndex = -1;
        if (this.inStockOnly) {
            const fieldName = this.inStockField || "quantity";
            const opt = filterOptions.find((o) => o.header === fieldName);
            qtyIndex = opt ? opt.index : -1;
        }

        const toNumber = (v) => {
            if (v === null || v === undefined) return null;
            const s = String(v).trim().replace(/\s+/g, "").replace(",", ".");
            if (!s) return null;
            const n = Number(s);
            return Number.isFinite(n) ? n : null;
        };

        const filtered = [];
        for (let i = 0; i < rows.length; i += 1) {
            const row = rows[i];

            let matchesFilters = true;
            for (let k = 0; k < queryKeys.length; k += 1) {
                const key = queryKeys[k];
                const headerIndex = filterIndex.get(key);
                if (headerIndex === undefined) continue;
                const filterValue = currentQuery[key];
                if (filterValue === "All") continue;
                const cellValue = row?.[headerIndex];
                if (String(cellValue ?? "").trim() !== String(filterValue ?? "").trim()) {
                    matchesFilters = false;
                    break;
                }
            }
            if (!matchesFilters) continue;

            if (this.inStockOnly && qtyIndex !== -1) {
                const val = row?.[qtyIndex];
                const n = toNumber(val);
                if (n !== null) {
                    if (n === 0) continue;
                } else {
                    const s = String(val ?? "").trim();
                    if (s === "" || s === "0") continue;
                }
            }

            if (useSearch) {
                const haystack = searchIndex ? searchIndex[i] : "";
                if (!haystack.includes(needle)) continue;
            }

            filtered.push(row);
        }
        return filtered;
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
    constructor(tableID, catalogData, options = {}) {
        this.catalogData = catalogData;
        this.productListElement = document.getElementById(tableID);
        this.currentQuery = catalogData.currentQuery;
        this.colorizeRowsOptions = "";
        this.renderOptions = {
            virtualize: false,
            chunkSize: 200,
            thresholdPx: 240,
        };
        this._virtualState = null;
        this._colorizeColumnIndex = -1;
        this.setRenderOptions(options);
    }

    setRenderOptions(options = {}) {
        if (!options || typeof options !== "object" || Array.isArray(options)) return;
        const next = { ...this.renderOptions };
        if (options.virtualize !== undefined) next.virtualize = !!options.virtualize;
        if (Number.isFinite(Number(options.chunkSize))) {
            next.chunkSize = Math.max(10, Number(options.chunkSize));
        }
        if (Number.isFinite(Number(options.thresholdPx))) {
            next.thresholdPx = Math.max(40, Number(options.thresholdPx));
        }
        this.renderOptions = next;
    }

    cleanupVirtualState() {
        if (!this._virtualState) return;
        const { container, onScroll } = this._virtualState;
        if (container && onScroll) {
            container.removeEventListener("scroll", onScroll);
        }
        this._virtualState = null;
    }

    resolveColorizeIndex(headers) {
        this._colorizeColumnIndex = -1;
        const opts = this.colorizeRowsOptions || {};
        if (!opts.columnName) return;
        const idx = headers.indexOf(opts.columnName);
        if (idx >= 0) {
            this._colorizeColumnIndex = idx;
        }
    }

    buildRow(row) {
        const tr = document.createElement("tr");
        const opts = this.colorizeRowsOptions || {};
        if (this._colorizeColumnIndex !== -1 && opts.value !== undefined) {
            const cellValue = row?.[this._colorizeColumnIndex];
            if (String(cellValue ?? "").trim() === String(opts.value ?? "").trim()) {
                tr.style = opts.style || "";
            }
        }
        row.forEach((cell, cellIndex) => {
            const td = document.createElement("td");
            td.textContent = cell;
            if (this.catalogData.isEditable(cellIndex)) {
                td.contentEditable = true;
                td.classList.add("editable-cell");
            }
            tr.appendChild(td);
        });
        return tr;
    }

    appendRows(tbody, data, startIndex, endIndex) {
        const fragment = document.createDocumentFragment();
        for (let i = startIndex; i < endIndex; i += 1) {
            fragment.appendChild(this.buildRow(data[i]));
        }
        tbody.appendChild(fragment);
    }

    renderRows(tbody, data, container) {
        if (!this.renderOptions.virtualize || !container) {
            this.appendRows(tbody, data, 0, data.length);
            return;
        }

        const state = {
            data,
            tbody,
            container,
            rendered: 0,
            chunkSize: this.renderOptions.chunkSize,
            thresholdPx: this.renderOptions.thresholdPx,
            scheduled: false,
            onScroll: null,
        };

        const renderChunk = () => {
            if (state.rendered >= state.data.length) return;
            const next = Math.min(state.rendered + state.chunkSize, state.data.length);
            this.appendRows(state.tbody, state.data, state.rendered, next);
            state.rendered = next;
        };

        renderChunk();
        if (state.rendered >= state.data.length) return;

        state.onScroll = () => {
            if (state.scheduled) return;
            state.scheduled = true;
            requestAnimationFrame(() => {
                state.scheduled = false;
                if (!state.container) return;
                const { scrollTop, clientHeight, scrollHeight } = state.container;
                if (scrollTop + clientHeight >= scrollHeight - state.thresholdPx) {
                    renderChunk();
                }
            });
        };

        state.container.addEventListener("scroll", state.onScroll);
        this._virtualState = state;
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

        this.cleanupVirtualState();
        this.productListElement.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'table-scroll relative shadow-md sm:rounded-lg';

        const table = document.createElement('table');
        table.id = "flowTable";
        table.className = 'w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400';

        // Создаем заголовок таблицы
        const thead = document.createElement('thead');
        thead.id = "thead";
        thead.className = 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400';

        const headerRow = document.createElement('tr');
        headerRow.className = 'table-header-row';
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
        this.resolveColorizeIndex(headers);
        this.renderRows(tbody, data, container);

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

        const normalizeFilterValue = (value) => String(value ?? "").trim();

        // Создаем строку для фильтров
        const filterRow = document.createElement('tr');
        filterRow.className = 'table-filter-row';

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
            const uniqueValues = new Set(data.map(row => normalizeFilterValue(row?.[index])));
            uniqueValues.forEach(value => {
                const optionElement = document.createElement('option');
                optionElement.value = value;
                optionElement.textContent = value;
                select.appendChild(optionElement);
            });

            // Устанавливаем текущее выбранное значение из currentQuery
            const current = this.currentQuery[header];
            select.value = current === undefined ? 'All' : normalizeFilterValue(current) || 'All';

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

        // Sticky offset для второй строки (фильтров) = высота строки заголовков
        try {
          const table = thead.closest("table");
          const headerRow = thead.querySelector("tr.table-header-row");
          if (table && headerRow && headerRow.getBoundingClientRect) {
            const h = headerRow.getBoundingClientRect().height || 0;
            table.style.setProperty("--table-header-height", `${h}px`);
          }
        } catch (_) {
          // ignore measurement errors
        }
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
        const normalizeFilterValue = (value) => String(value ?? "").trim();

        this.catalogData.header.forEach((header, index) => {
            const selectElement = document.getElementById(`${header}Select`);
            if (!selectElement) return;

            const currentValue = this.currentQuery[header];
            const uniqueValues = new Set(filteredData.map(row => normalizeFilterValue(row?.[index])));

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
            const normalizedCurrent = currentValue === "All" ? "All" : normalizeFilterValue(currentValue);
            if (normalizedCurrent !== 'All' && uniqueValues.has(normalizedCurrent)) {
                selectElement.value = normalizedCurrent;
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




    
