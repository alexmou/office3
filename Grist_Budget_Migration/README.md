# BUTTON ROUGE: Budget/PNL -> Grist

Пакет переносит расчётную модель из книги Budget в Grist.

## Создаётся
- `BudgetCategories`: 56 исходных статей + безопасное поле `BaseCategory` без `#2/#3/...`.
- `Budget`: 311 исходных операций.
- `Months`: центральная P&L-таблица с нативными формулами Grist.
- `Sales.BudgetMonth`: формульный ключ месяца в существующей `Sales`.

`Months` заменяет расчётные листы `Pivot`, `PNL`, `Автоматич. свод`, `n8n-терминал`, `n8n-Поставщики`, `n8n-getMonthsSummary`.

## Запуск
```bash
export GRIST_HOST="https://grist.buttonrouge.org"
export GRIST_DOC_ID="DOC_ID"
export GRIST_API_KEY="API_KEY"
python3 install_grist_budget.py
```

Из docker-network Grist можно указать `GRIST_HOST=http://grist:8484`.

## Что проверяет скрипт
В существующей `Sales` должны быть: дата (`date`/`Date`), `finalPriceVND`, сумма поставщику (`AmountToSupplier`/`supplierAmount`) и `Terminal`. `done/status` используется для `SupplierPaid`, если существует.

## Безопасность миграции
Скрипт ничего не удаляет. Импорт `Budget` идемпотентен по `LegacyRowId`. Категории с суффиксами не объединяются автоматически: оригинальное имя сохраняется, а потенциальный общий вариант пишется в `BaseCategory`.

## Сверка после запуска
Сверьте 3-5 закрытых месяцев между старым PNL и `Months`: `SalesFact`, `SupplierFact`, `TerminalFact`, `ExpensesPaid`, `TotalExpenses`, `Profit`, `CumulativeProfit`. Только после сверки отключайте старые расчётные листы и n8n-цепочки.
