
class TableLi {
    constructor(tableID) {
        this.header = [];
        this.values = [];
        this.filterOptions = [];
        this.currentQuery = {};
        this.productListElement = document.getElementById(tableID);
        this.editableFieldNames = [];
        this.doSomethingWithRows=false
    }

    initWithPreloadedData(rowData) {
        try {
            this.query = "ALL";
            this.currentQuery = { ...this.query };
            this.values = rowData;
            this.createTable();
        } catch (error) {
            console.error("Ошибка при инициализации Table:", error);
        }
    }

    setFilterOptions(filters) {
        this.header = filters.map(option => option.header);
        this.filterOptions = filters;
        const dataRows = this.values.length > 0 ? this.values.slice(1) : [];
        // Сначала создаем заголовок таблицы
        this.createTableNew(this.header);
        // Затем создаем фильтры
        this.createTableFilter(this.header, dataRows);
        // Применяем фильтры и строим таблицу
        this.filterAndBuildTable();
    }

    createTableNew(headers) {
        this.productListElement.innerHTML = '';


      const headerAndfilterContainer= document.createElement('div');
      headerAndfilterContainer.className="header-filter-container"
      this.headerAndfilterContainer=headerAndfilterContainer

        const headerElement = document.createElement('li');
        headerElement.className = 'table-header';

        headers.forEach((headerText, index) => {
            const div = document.createElement('div');
            div.className = `col-header col-${index + 1}`;
            div.textContent = headerText;
            headerElement.appendChild(div);
        });

       headerAndfilterContainer.appendChild(headerElement);
         this.productListElement.appendChild(headerAndfilterContainer)
    }

    createTableFilter(headers, rows) {
        // Удаляем предыдущие фильтры, если есть
        const existingFilters = this.productListElement.querySelector('.filters');
        if (existingFilters) {
            existingFilters.remove();
        }


        const filtersContainer = document.createElement('li');
        filtersContainer.className = 'filters';

        headers.forEach((header, index) => {
            const filterItem = document.createElement('div');
            filterItem.className = `col-filter col-${index + 1}`;

            const select = document.createElement('select');
            select.id = `${header}-filter`;
            select.className = 'filter-select';

            // Опция "all"
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = '*';
            select.appendChild(allOption);

            // Уникальные значения для фильтра
            const uniqueValues = new Set(rows.map(row => row[index]));
            uniqueValues.forEach(value => {
                const optionElement = document.createElement('option');
                optionElement.value = value;
                optionElement.textContent = value;
                select.appendChild(optionElement);
            });

            // Устанавливаем текущее значение фильтра
            select.value = this.currentQuery[header] || 'all';

            select.addEventListener('change', () => {
                this.currentQuery[header] = select.value;
                this.filterAndBuildTable();
            });

            filterItem.appendChild(select);
            filtersContainer.appendChild(filterItem);
              this.headerAndfilterContainer.appendChild(filtersContainer);
        });

        // Добавляем фильтры после заголовка (headerElement уже создан в createTableNew)
        this.productListElement.appendChild(  this.headerAndfilterContainer);
    }

    filterAndBuildTable() {
        const rows = this.values.length > 0 ? this.values.slice(1) : [];

        const filteredData = rows.filter(row => {
            return Object.keys(this.currentQuery).every(key => {
                const option = this.filterOptions.find(opt => opt.header === key);
                if (!option) return true;
                const headerIndex = option.index;
                const filterValue = this.currentQuery[key];
                if (filterValue === "all") return true;
                return row[headerIndex] == filterValue;
            });
        });

        this.updateFilterOptions(filteredData);
        this.buildTable(filteredData);
    }

    updateFilterOptions(filteredData) {
        this.header.forEach((header, index) => {
            const selectElement = document.getElementById(`${header}-filter`);
            if (!selectElement) return;

            const currentValue = this.currentQuery[header];
            const uniqueValues = new Set(filteredData.map(row => row[index]));

            selectElement.innerHTML = '';

            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = '*';
            selectElement.appendChild(allOption);

            uniqueValues.forEach(value => {
                const optionElement = document.createElement('option');
                optionElement.value = value;
                optionElement.textContent = value;
                selectElement.appendChild(optionElement);
            });

            if (currentValue !== 'all' && uniqueValues.has(currentValue)) {
                selectElement.value = currentValue;
            } else {
                selectElement.value = 'all';
                this.currentQuery[header] = 'all';
            }
        });
      
    }

buildTable(data) {
    // Полностью очищаем список перед обновлением
    this.productListElement.innerHTML = '';
    this.productListElement.appendChild(this.headerAndfilterContainer);

    data.forEach(row => {
        const rowElement = document.createElement('li');
        rowElement.className = 'table-row';

        row.forEach((cell, index) => {
            const div = document.createElement('div');
            div.className = `col col-${index + 1}`;
            div.textContent = cell;

            if (this.isEditable(index)) {
                div.contentEditable = true;
                div.classList.add('editable-cell');
            }

            rowElement.appendChild(div);
        });

        this.productListElement.appendChild(rowElement);
    });

    // Обновляем классы строк
    if(this.doSomethingWithRows){
    doSomethingWithRows()
    }
}






    isEditable(columnNumber) {
        return this.editableFieldNames[columnNumber] === 1;
    }

    createTable() {
        this.editableFieldNames = Array(this.header.length).fill(0);
    }


sortByFirstColumn() {
    // Проверяем, есть ли данные для сортировки
    if (this.values.length <= 1) return;

    // Получаем данные (исключая заголовок)
    const rows = this.values.slice(1);
    
    // Сортируем по первой колонке
    rows.sort((a, b) => {
        // Преобразуем даты из dd.mm.yyyy в Date объекты
        const parseDate = (dateStr) => {
            const [day, month, year] = dateStr.split('.');
            return new Date(`${month}/${day}/${year}`);
        };
        
        const dateA = parseDate(a[0]);
        const dateB = parseDate(b[0]);
        return dateB - dateA;
    });
    
    // Обновляем значения, сохраняя заголовок
    this.values = [this.values[0], ...rows];
    
    // Перестраиваем таблицу с учетом текущих фильтров
    this.filterAndBuildTable();
}



}



  