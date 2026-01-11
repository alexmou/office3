

function arrayToObjects(arr) {
    const [headers, ...rows] = arr;
    var res = rows.map((r) => headers.reduce((o, h, j) => Object.assign(o, {
        [h]: r[j]
    }), {}));
    return res
}


function findUnique(arr, predicate) {
    var found = {};
    arr.forEach(d => {
        found[predicate(d)] = d;
    });
    return Object.keys(found).map(key => found[key]);
}




function toLocaleStringCorrect(value) {
    // Если значение пустое, null или undefined, возвращаем пустую строку
    if (value == null || value === "") {
        return "";
    }

    // Если значение строка
    if (typeof value === "string") {
        // Если строка начинается с нуля и не является числом, возвращаем её как есть
        if (/^0\d+/.test(value)) {
            return value;
        }

        let cleanedValue = value.replace(/\s+/g, ""); // Убираем пробелы
        let numberValue = parseFloat(cleanedValue);

        // Если после удаления пробелов значение становится числом, форматируем его
        if (!isNaN(numberValue)) {
            return numberValue.toLocaleString('ru-RU', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                useGrouping: true
            });
        }

        // Если это текст, возвращаем исходное значение
        return value;
    }

    // Если значение уже число, форматируем его
    if (typeof value === "number") {
        return value.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true
        });
    }

    // Если значение другого типа (например, объект), возвращаем его как есть
    return value;
}

