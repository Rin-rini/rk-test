# Правила для AI: сборка дашборда по описанию

Ты собираешь **новый аналитический экран** только из UI kit этого репозитория. На входе — текстовое описание: какие блоки, метрики, графики, фильтры, таблица. На выходе — рабочий React-компонент экрана в нужной папке проекта.

Подробное описание, как работать с UI kit — в `GUIDELINE.md`; ниже — **обязательные правила и справочники**, по которым нужно принимать решения без импровизации.

---

## Стек и импорты

- React 19, TypeScript, Vite.
- Стили экрана: CSS Modules + `var(--*)` из `ui-kit/tokens`. CSS-in-JS на экранах не использовать.
- `class-variance-authority` — только внутри kit.
- Иконки: `lucide-react`. Появление страницы: `framer-motion`. Recharts — **только** внутри `ui-kit/components/ui/charts/`, не в папке экрана.
- Импорты с суффиксом `.ts` / `.tsx`.
- Алиасы: `@ui-kit`, `@dashboard`, `@legacy-redo`, `@rules-test`.

---

## Маппинг описания дашборда на UI kit

По описанию пользователя восстанови структуру:

| В описании | Реализация |
| --- | --- |
| Заголовок, описание, примечания, кнопки | `DashboardPage` + `DashboardPageHeader` |
| Период, отборы, переключатель вида | `FilterPanel` + `FilterPanelValues` в `useState` |
| ключевые цифры вверху | `section` с `dashboardGrid.kpiRow` + `KPICard` |
| Каждый график | `ChartCard` внутри `dashboardGrid.charts` + span-класс |
| Детальная выгрузка | `DataTable`, при длине — `scrollable` |
| Загрузка / нет данных / ошибка | единый `DataStatus`, проп `status` в KPI, `ChartCard`, `DataTable` |

**Ширина `ChartCard`** (проп `className`):

- на всю строку → `dashboardGrid.chartFull`
- пара 7+5 → `chartWide` + `chartNarrow`
- два равных → `chartHalf`

**Фильтры слева** → `layout="vertical"`, `bodyWithSidebar`, `sidebar`, `main`.

---

## Выбор графика (строго)

| Смысл из описания | Компонент |
| --- | --- |
| Динамика по времени, несколько рядов | `LineTimeSeriesChart` |
| Сравнение категорий, короткие подписи по X | `VerticalBarChart` |
| Рейтинг, длинные подписи | `HorizontalBarChart` (отображать только первые 7 категорий на видимой части и добавлять прокрутку для остальных)|
| Состав в одном столбце | `HorizontalStackedBarChart` |
| План/факт по категориям | `HorizontalGroupedBarChart` + массив `series` (`key`, `name`, `color`) |
| Доли, структура % | `PieChart` |
| Цепочка ± к итогу | `WaterfallChart` |
| Столбцы + линия плана | `ComboBarLineChart` |
| Корреляция двух метрик | `DataTable` или горизонтальные столбцы |

Запрещено: scatter, 3D, свои chart-обёртки на Recharts в папке экрана. Нет времени и 2–3 категории → столбцы, не линия.

Две серии на grouped-bar: явный `series`, цвета через токены (`chartPlanVar` / `chartFactVar` или `chartSeriesColors`), не hex. Не экспортировать доменные пресеты из `ui-kit`.

На графиках для осей: `valueFormat="currencyCompact"` (или `percent` / `number` по смыслу).

---

## Форматирование чисел

Импорт: `@ui-kit/visualization/index.ts` или реэкспорт `@ui-kit/components/ui/index.ts`.

- Отображение: `formatByMetric(value, format)`.
- Таблица: колонки с `format: MetricFormat` в `DataTable` где поддерживается; иначе `metricDisplayClass`.
- **Не** копировать `formatCurrency` / ветки по формату в папке экрана.
- KPI: `unit` на `KPICard` согласован с типом значения.
- **Не выдумывать цифры.** Нет данных → `empty` и пустые состояния kit, не литералы в KPI/графиках.

| format | Использование |
| --- | --- |
| `currency` | KPI, ячейки таблицы |
| `currencyCompact` | оси графиков |
| `percent` | доля 0…1 в данных |
| `number`, `text` | по смыслу |

---

## Алгоритм генерации

1. Определи папку экрана по заданию
2. Создай компонент экрана; корень — `DashboardPage` (семантика `main`, сетка, анимация появления).
3. `DashboardPageHeader` — русский `title`, остальное по описанию.
4. `FilterPanel`: собери `filters` из описания (`dateRange`, `multiSelect`, `singleSelect`).
5. Hook/утилиты для данных в папке дашборда; агрегаты в `useMemo` от фильтров.
6. `status` из loading/error/length данных.
7. KPI-ряд по описанию.
8. Для каждого графика из описания — `ChartCard` + тип из таблицы выше + данные из агрегатов.
9. Таблица, если в описании есть детализация.
10. Подключи экран в `src/App` или точку входа, если это требуется заданием.

Layout **только** `@ui-kit/layout/index.ts`, не копировать grid из другого файла построчно.

Компоненты **только** `@ui-kit/components/ui/index.ts`.

В CSS модулях экрана: **нет** hex/rgb цветов и произвольной типографики.

Тексты UI — **русский**.

---

## Жёсткие запреты

1. Не вносить изменения в UI kit.
2. Не подменять UI kit локальными стилями и самодельными карточками/графиками/таблицами.
3. Не выдумывать числа в данных.
4. Не обходить `formatByMetric` / колоночные форматы таблицы.
5. Не добавлять Recharts напрямую на экран.

При конфликте с чатом приоритет у чата, **кроме** пунктов 1 и 2 — их не нарушать.

---

## Шаблон импортов

```ts
import {
  ChartCard,
  DataTable,
  FilterPanel,
  KPICard,
  /* конкретный Chart */
  type FilterPanelValues,
  type DataTableSort,
} from '@ui-kit/components/ui/index.ts'
import { DashboardPage, DashboardPageHeader, dashboardGrid } from '@ui-kit/layout/index.ts'
```

---

## Проверка перед завершением

1. `npm run build` — без ошибок TypeScript.
2. Экран рендерится
3. Контрольные суммы совпадают с источником данных, если он передан.
4. Тёмная тема, токенные цвета графиков, сетка 12 колонок.

---

## Справка: layout

```ts
import { DashboardPage, DashboardPageHeader, dashboardGrid } from '@ui-kit/layout/index.ts'
```

```ts
const status = resolveDataStatus({
  isLoading,
  error,
  sourceCount: rows.length,
  resultCount: filtered.length,
})
```

Подробности для людей (Storybook, токены, антипаттерны графиков) — `GUIDELINE.md`.