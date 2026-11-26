import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { chartSeriesColors } from '../tokens/chartColors.ts'
import {
  ChartCard,
  DataTable,
  FilterPanel,
  KPICard,
  LineTimeSeriesChart,
  type ColumnFiltersState,
  type DataTableSort,
  type FilterPanelValues,
} from '../components/ui/index.ts'
import { presetToRange } from '../components/ui/DateRangePicker/dateRangeUtils.ts'
import { dashboardGrid } from '../components/layout/index.ts'

type BudgetRow = { id: string; dept: string; plan: number; spent: number; delta: number }

const rows: BudgetRow[] = [
  { id: '1', dept: 'Финансы', plan: 12_000_000, spent: 11_200_000, delta: -0.067 },
  { id: '2', dept: 'ИТ', plan: 8_500_000, spent: 8_900_000, delta: 0.047 },
  { id: '3', dept: 'HR', plan: 3_200_000, spent: 3_400_000, delta: 0.0625 },
  { id: '4', dept: 'Закупки', plan: 5_600_000, spent: 5_100_000, delta: -0.089 },
  { id: '5', dept: 'Маркетинг', plan: 4_100_000, spent: 4_450_000, delta: 0.085 },
  { id: '6', dept: 'Логистика', plan: 6_800_000, spent: 6_750_000, delta: -0.007 },
  { id: '7', dept: 'Юридический отдел', plan: 1_900_000, spent: 1_850_000, delta: -0.026 },
  { id: '8', dept: 'АХО', plan: 2_400_000, spent: 2_600_000, delta: 0.083 },
]

/** Синтетика для story: суммы в условных млрд ₽ по месяцам. */
const chartRows = [
  { month: 'янв', plan: 10.0, spent: 9.2, forecast: 9.5, limit: 11.0 },
  { month: 'фев', plan: 10.2, spent: 10.1, forecast: 9.9, limit: 11.0 },
  { month: 'мар', plan: 10.5, spent: 8.4, forecast: 9.8, limit: 11.2 },
  { month: 'апр', plan: 10.8, spent: 10.6, forecast: 10.4, limit: 11.2 },
  { month: 'май', plan: 11.0, spent: 11.1, forecast: 10.7, limit: 11.5 },
  { month: 'июн', plan: 11.2, spent: 10.9, forecast: 11.0, limit: 11.5 },
]

const dynamicsSeries = [
  { key: 'plan', name: 'План', color: chartSeriesColors[4] },
  { key: 'spent', name: 'Исполнение', color: chartSeriesColors[0] },
  { key: 'forecast', name: 'Прогноз', color: chartSeriesColors[2] },
  { key: 'limit', name: 'Лимит', color: chartSeriesColors[3] },
] as const

function AnalyticsShowcase() {
  const [filters, setFilters] = useState<FilterPanelValues>({
    period: presetToRange('last30'),
    view: 'summary',
    dept: ['fin'],
  })
  const [sort, setSort] = useState<DataTableSort>({ columnId: 'dept', direction: 'asc' })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>({})
  return (
    <div className={dashboardGrid.page}>
      <FilterPanel
        filters={[
          { kind: 'dateRange', id: 'period', label: 'Период' },
          {
            kind: 'singleSelect',
            id: 'view',
            label: 'Режим',
            options: [
              { value: 'summary', label: 'Сводка' },
              { value: 'detail', label: 'Детализация' },
            ],
          },
          {
            kind: 'multiSelect',
            id: 'dept',
            label: 'Подразделения',
            options: [
              { value: 'fin', label: 'Финансы' },
              { value: 'it', label: 'ИТ' },
              { value: 'hr', label: 'HR' },
            ],
          },
        ]}
        value={filters}
        onChange={setFilters}
        defaultValues={{ period: presetToRange('last30'), view: 'summary', dept: ['fin'] }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        <KPICard title="План" value={1_371_877_259} trend="flat" unit="currency" />
        <KPICard title="Загрузка" value={null} status="loading" />
        <KPICard title="Нет данных" value={null} status="empty" />
        <KPICard title="Ошибка API" value={null} status="error" onRetry={() => undefined} />
      </div>

      <ChartCard title="Динамика" status="ready">
        <LineTimeSeriesChart
          data={chartRows}
          xKey="month"
          series={[...dynamicsSeries]}
          legend
          height={200}
          valueFormat="number"
        />
      </ChartCard>

      <ChartCard title="График с ошибкой" status="error" onRetry={() => undefined} />

      <DataTable
        columns={[
          { id: 'dept', header: 'Подразделение', accessor: (r) => r.dept, sortable: true, filterable: true },
          {
            id: 'plan',
            header: 'План',
            accessor: (r) => r.plan,
            format: 'currency',
            sortable: true,
            filterable: true,
          },
          {
            id: 'spent',
            header: 'Исполнение',
            accessor: (r) => r.spent,
            format: 'currency',
            sortable: true,
            filterable: true,
          },
          { id: 'delta', header: 'Δ %', accessor: (r) => r.delta, format: 'percent', sortable: true },
        ]}
        rows={rows}
        sort={sort}
        onSortChange={setSort}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        getRowKey={(r) => r.id}
      />

      <DataTable
        columns={[{ id: 'dept', header: 'Подразделение', accessor: () => null }]}
        rows={[]}
        sort={null}
        onSortChange={() => {}}
        status="empty"
        getRowKey={() => 'empty'}
      />
    </div>
  )
}

const meta = {
  title: 'UI/Аналитика',
  component: AnalyticsShowcase,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AnalyticsShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}