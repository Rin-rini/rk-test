import {
  aggregateByCostItem,
  aggregateByCostItemPlanFact,
  aggregateByDayInMonth,
  aggregateByDepartment,
  aggregateByMonth,
  aggregateDepartmentCostStructure,
  aggregateDetailTableRows,
  aggregateKpi,
  departmentDeviationFromBar,
  departmentSummaryFromBar,
  indexRowsByMonth,
} from '@dashboard/utils/aggregate.ts'
import { filterBudgetRows } from '@dashboard/utils/filters.ts'
import { useBudgetData } from '@dashboard/hooks/useBudgetData.ts'
import {
  BUDGET_DETAIL_TABLE_COLUMNS,
  BUDGET_SUMMARY_TABLE_COLUMNS,
} from '@dashboard/constants/budgetTableColumns.ts'
import {
  ChartCard,
  DataTable,
  PieChart,
  FilterPanel,
  ComboBarLineChart,
  HorizontalBarChart,
  HorizontalStackedBarChart,
  KPICard,
  VerticalBarChart,
  type ChartXDrillConfig,
  type ColumnFiltersState,
  type DataTableSort,
  type FilterPanelValues,
  VerticalGroupedBarChart,
  resolveDataStatus,
} from '@ui-kit/components/ui/index.ts'
import { planFactGroupedBarSeries } from '@dashboard/constants/planFactGroupedBarSeries.ts'
import { DashboardPage, DashboardPageHeader, dashboardGrid } from '@ui-kit/components/layout'
import { useEffect, useMemo, useState } from 'react'

const ALL_RANGE = { from: '2024-01-01', to: '2025-12-31' }

const DEFAULT_FILTERS: FilterPanelValues = {
  period: ALL_RANGE,
  dept: [],
  view: 'summary',
}

function kpiTrend(deviation: number): 'up' | 'down' | 'flat' {
  if (deviation > 0) return 'up'
  if (deviation < 0) return 'down'
  return 'flat'
}

export function BudgetDashboard() {
  const { rows, departments, isLoading, error } = useBudgetData()
  const [filters, setFilters] = useState<FilterPanelValues>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<DataTableSort>({ columnId: 'department', direction: 'asc' })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>({})

  const departmentIds = (filters.dept as string[] | undefined) ?? []
  const period = filters.period as { from: string; to: string }
  const view = (filters.view as string) ?? 'summary'
  const isSummaryView = view === 'summary'
  const isDetailView = view === 'detail'

  useEffect(() => {
    setSort(
      isSummaryView
        ? { columnId: 'department', direction: 'asc' }
        : { columnId: 'month', direction: 'desc' },
    )
    setColumnFilters({})
  }, [isSummaryView])

  const filtered = useMemo(
    () => filterBudgetRows(rows, period, departmentIds),
    [rows, period, departmentIds],
  )

  const kpi = useMemo(() => aggregateKpi(filtered), [filtered])

  const summaryData = useMemo(() => {
    if (!isSummaryView) return null
    const byDepartment = aggregateByDepartment(filtered)
    return {
      monthly: aggregateByMonth(filtered),
      deptDeviation: departmentDeviationFromBar(byDepartment),
      deptBarData: byDepartment.map(({ department, fact }) => ({ department, fact })),
      deptSummary: departmentSummaryFromBar(byDepartment),
    }
  }, [filtered, isSummaryView])

  const detailData = useMemo(() => {
    if (!isDetailView) return null
    const deptCostStructure = aggregateDepartmentCostStructure(filtered, 'fact')
    return {
      costSlices: aggregateByCostItem(filtered),
      costItemPlanFact: aggregateByCostItemPlanFact(filtered),
      deptCostStructure,
      detailTableRows: aggregateDetailTableRows(filtered),
      deptStructureChartHeight: Math.min(280, Math.max(168, deptCostStructure.data.length * 28 + 48)),
    }
  }, [filtered, isDetailView])

  const rowsByMonth = useMemo(() => indexRowsByMonth(filtered), [filtered])

  const monthChartDrilldown = useMemo<ChartXDrillConfig>(
    () => ({
      drillKey: 'month',
      backLabel: 'Все месяцы',
      rootHint: 'Нажмите столбец или точку месяца, чтобы увидеть разбивку по дням',
      getDetailData: (month) => aggregateByDayInMonth(rowsByMonth.get(month) ?? [], month),
    }),
    [rowsByMonth],
  )

  const status = resolveDataStatus({
    isLoading,
    error,
    sourceCount: rows.length,
    resultCount: filtered.length,
  })

  const tableShared = {
    sort,
    onSortChange: setSort,
    columnFilters,
    onColumnFiltersChange: setColumnFilters,
    status,
    scrollable: true as const,
  }

  return (
    <DashboardPage>
      <DashboardPageHeader title="Исполнение бюджета: план / факт" />

      <FilterPanel
        filters={[
          { kind: 'dateRange', id: 'period', label: 'Период' },
          {
            kind: 'multiSelect',
            id: 'dept',
            label: 'Подразделения',
            options: departments,
          },
          {
            kind: 'singleSelect',
            id: 'view',
            label: 'Уровень',
            options: [
              { value: 'summary', label: 'Сводка по подразделениям' },
              { value: 'detail', label: 'Детализация по статьям' },
            ],
          },
        ]}
        value={filters}
        onChange={setFilters}
        defaultValues={DEFAULT_FILTERS}
      />

      <section className={dashboardGrid.kpiRow} aria-label="Ключевые показатели">
        <KPICard title="План" value={kpi.plan} unit="currency" valueTone="plan" status={status} />
        <KPICard title="Факт" value={kpi.fact} unit="currency" valueTone="fact" status={status} />
        <KPICard
          title="Отклонение"
          value={kpi.deviation}
          unit="currency"
          trend={kpiTrend(kpi.deviation)}
          trendSemantics="up-is-bad"
          status={status}
        />
        <KPICard
          title="Отклонение, %"
          value={kpi.deviationPercent}
          unit="percent"
          trend={kpiTrend(kpi.deviation)}
          trendSemantics="up-is-bad"
          status={status}
        />
      </section>

      <section className={dashboardGrid.charts} aria-label="Графики">
        {isSummaryView && summaryData ? (
          <>
            <ChartCard
              className={dashboardGrid.chartFull}
              title="Исполнение и план по месяцам"
              status={status}
            >
              <ComboBarLineChart
                data={summaryData.monthly}
                xKey="label"
                bar={{ key: 'fact', name: 'Факт' }}
                line={{ key: 'plan', name: 'План' }}
                valueFormat="currencyCompact"
                height={180}
                drilldown={monthChartDrilldown}
              />
            </ChartCard>

            <ChartCard
              className={dashboardGrid.chartHalf}
              title="Отклонение по подразделениям, ₽"
              status={status}
            >
              <HorizontalBarChart
                data={summaryData.deptDeviation}
                categoryKey="department"
                valueKey="deviation"
                name="Отклонение"
                valueFormat="currencyCompact"
                height={168}
              />
            </ChartCard>

            <ChartCard
              className={dashboardGrid.chartHalf}
              title="Сравнение подразделений (факт)"
              status={status}
            >
              <VerticalBarChart
                data={summaryData.deptBarData}
                categoryKey="department"
                valueKey="fact"
                name="Факт"
                valueFormat="currencyCompact"
                height={168}
              />
            </ChartCard>
          </>
        ) : null}

        {isDetailView && detailData ? (
          <>
            <ChartCard
              className={dashboardGrid.chartFull}
              title="Структура затрат по подразделениям (факт)"
              status={status}
            >
              <HorizontalStackedBarChart
                data={detailData.deptCostStructure.data}
                categoryKey="department"
                series={detailData.deptCostStructure.series}
                valueFormat="currencyCompact"
                categoryAxisWidth={140}
                height={detailData.deptStructureChartHeight}
              />
            </ChartCard>

            <ChartCard
              className={dashboardGrid.chartHalf}
              title="План и факт по статьям затрат"
              status={status}
            >
              <VerticalGroupedBarChart
                data={detailData.costItemPlanFact}
                categoryKey="costItem"
                series={planFactGroupedBarSeries}
                valueFormat="currencyCompact"
                categoryAxisWidth={156}
                height={168}
              />
            </ChartCard>

            <ChartCard
              className={dashboardGrid.chartHalf}
              title="Структура факта по статьям затрат"
              status={status}
            >
              <PieChart height={200} slices={detailData.costSlices} />
            </ChartCard>
          </>
        ) : null}
      </section>

      <section>
        {isSummaryView ? (
          <DataTable
            {...tableShared}
            columns={BUDGET_SUMMARY_TABLE_COLUMNS}
            rows={summaryData?.deptSummary ?? []}
            getRowKey={(r) => r.id}
          />
        ) : (
          <DataTable
            {...tableShared}
            columns={BUDGET_DETAIL_TABLE_COLUMNS}
            rows={detailData?.detailTableRows ?? []}
            getRowKey={(r) => r.id}
          />
        )}
      </section>
    </DashboardPage>
  )
}