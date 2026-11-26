import {
  aggregateByMonth,
  aggregateKpi,
  aggregateOutflowByActivity,
  aggregateTopCounterparties,
} from '@legacy-redo/utils/aggregate.ts'
import { filterCashflowRows, type CashflowFilterParams } from '@legacy-redo/utils/filters.ts'
import { useCashflowData } from '@legacy-redo/hooks/useCashflowData.ts'
import {
  ChartCard,
  DataTable,
  FilterPanel,
  HorizontalStackedBarChart,
  KPICard,
  LineTimeSeriesChart,
  VerticalGroupedBarChart,
  type DataTableSort,
  type FilterPanelValues,
  resolveDataStatus,
} from '@ui-kit/components/ui/index.ts'
import { DashboardPage, DashboardPageHeader, dashboardGrid } from '@ui-kit/components/layout'
import { chartFactVar, chartSeriesColors } from '@ui-kit/tokens/chartColors.ts'
import { useMemo, useState } from 'react'

function netTrend(value: number): 'up' | 'down' | 'flat' {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}

function yoyTrend(ratio: number | null): 'up' | 'down' | 'flat' {
  if (ratio === null) return 'flat'
  if (ratio > 0) return 'up'
  if (ratio < 0) return 'down'
  return 'flat'
}

const OUTFLOW_ACTIVITY_SERIES = [
  { key: 'od', name: 'ОД' },
  { key: 'id', name: 'ИД' },
  { key: 'fd', name: 'ФД' },
] as const

const MONTH_FLOW_SERIES = [
  { key: 'inflow', name: 'Поступления', color: chartFactVar },
  { key: 'outflow', name: 'Выбытия', color: chartSeriesColors[2] },
] as const

export function CashFlowDashboard() {
  const {
    dataset,
    rows,
    legalEntities,
    activityTypes,
    currencies,
    defaultPeriod,
    isLoading,
    error,
  } = useCashflowData()

  const defaultFilters: FilterPanelValues = useMemo(
    () => ({
      period: defaultPeriod,
      legalEntity: 'all',
      activity: [] as string[],
      currency: 'RUB',
    }),
    [defaultPeriod],
  )

  const [filters, setFilters] = useState<FilterPanelValues>(defaultFilters)
  const [sort, setSort] = useState<DataTableSort>({ columnId: 'outflow', direction: 'desc' })

  const period = (filters.period as { from: string; to: string }) ?? defaultPeriod
  const legalEntityId = (filters.legalEntity as string) ?? 'all'
  const activity = (filters.activity as string[] | undefined) ?? []
  const currency = (filters.currency as string) ?? 'RUB'

  const filterParams = useMemo<CashflowFilterParams>(
    () => ({
      period,
      legalEntityId,
      activityTypes: activity,
      currency,
    }),
    [period, legalEntityId, activity, currency],
  )

  const filtered = useMemo(
    () => (rows.length ? filterCashflowRows(rows, filterParams) : []),
    [rows, filterParams],
  )

  const kpi = useMemo(
    () => (rows.length ? aggregateKpi(dataset, filterParams) : null),
    [dataset, filterParams, rows.length],
  )
  const monthly = useMemo(
    () => (rows.length ? aggregateByMonth(dataset, filterParams) : []),
    [dataset, filterParams, rows.length],
  )
  const outflowStructure = useMemo(
    () => aggregateOutflowByActivity(filtered, currency, period),
    [filtered, currency, period],
  )
  const outflowChartHeight = useMemo(
    () => Math.min(280, Math.max(168, outflowStructure.length * 28 + 48)),
    [outflowStructure.length],
  )
  const topCounterparties = useMemo(
    () => aggregateTopCounterparties(filtered, currency, dataset.counterparties),
    [filtered, currency, dataset.counterparties],
  )

  const status = resolveDataStatus({
    isLoading,
    error,
    sourceCount: rows.length,
    resultCount: filtered.length,
  })

  const currencyCode =
    currency === 'EUR' || currency === 'USD' || currency === 'RUB' ? currency : 'RUB'

  return (
    <DashboardPage>
      <DashboardPageHeader title="Движение денежных средств" />

      <FilterPanel
        filters={[
          { kind: 'dateRange', id: 'period', label: 'Период' },
          {
            kind: 'singleSelect',
            id: 'legalEntity',
            label: 'Юрлицо',
            options: legalEntities,
          },
          {
            kind: 'multiSelect',
            id: 'activity',
            label: 'Вид деятельности',
            options: activityTypes,
          },
          {
            kind: 'singleSelect',
            id: 'currency',
            label: 'Валюта',
            options: currencies.map((c) => ({ value: c, label: c })),
          },
        ]}
        value={filters}
        onChange={setFilters}
        defaultValues={defaultFilters}
      />

      <section className={dashboardGrid.kpiRow} aria-label="Ключевые показатели">
        <KPICard
          title="Поступления"
          value={kpi?.inflow ?? null}
          unit="currency"
          currency={currencyCode}
          status={status}
        />
        <KPICard
          title="Выбытия"
          value={kpi?.outflow ?? null}
          unit="currency"
          currency={currencyCode}
          status={status}
        />
        <KPICard
          title="Чистый денежный поток"
          value={kpi?.net ?? null}
          unit="currency"
          currency={currencyCode}
          trend={kpi ? netTrend(kpi.net) : 'flat'}
          status={status}
        />
        <KPICard
          title="Остаток на начало периода"
          value={kpi?.openingAtPeriodStart ?? null}
          unit="currency"
          currency={currencyCode}
          status={status}
        />
        <KPICard
          title="Год к году"
          value={kpi?.yoyNetPercent ?? null}
          unit="percent"
          trend={yoyTrend(kpi?.yoyNetPercent ?? null)}
          status={status}
        />
      </section>

      <section className={dashboardGrid.charts} aria-label="Графики">
        <ChartCard className={dashboardGrid.chartFull} title="Поступления и выбытия по месяцам" status={status}>
          <VerticalGroupedBarChart
            data={monthly}
            categoryKey="label"
            series={[...MONTH_FLOW_SERIES]}
            valueFormat="currencyCompact"
            height={250}
            legend={false}
          />
        </ChartCard>

        <ChartCard className={dashboardGrid.chartFull} title="Остаток на конец месяца" status={status}>
          <LineTimeSeriesChart
            data={monthly}
            xKey="label"
            series={[{ key: 'balance', name: 'Остаток на конец месяца', color: chartSeriesColors[3] }]}
            valueFormat="currencyCompact"
            height={200}
            legend={false}
          />
        </ChartCard>

        <ChartCard
          className={dashboardGrid.chartHalf}
          title="Выбытия по видам деятельности"
          status={status}
        >
          <HorizontalStackedBarChart
            data={outflowStructure}
            categoryKey="category"
            series={[...OUTFLOW_ACTIVITY_SERIES]}
            valueFormat="currencyCompact"
            categoryAxisWidth={72}
            height={outflowChartHeight}
          />
        </ChartCard>

        <ChartCard className={dashboardGrid.chartHalf} title="Топ контрагентов по сумме расходов" status={status}>
          <DataTable
            columns={[
              {
                id: 'counterparty',
                header: 'Контрагент',
                accessor: (r) => r.counterparty,
                sortable: true,
              },
               {
                id: 'outflow',
                header: 'Выбытия',
                accessor: (r) => r.outflow,
                format: 'currency',
                currency: currencyCode,
                sortable: true,
              },
              {
                id: 'inflow',
                header: 'Поступления',
                accessor: (r) => r.inflow,
                format: 'currency',
                currency: currencyCode,
                sortable: true,
              },
             
            ]}
            rows={topCounterparties}
            sort={sort}
            onSortChange={setSort}
            status={status}
            scrollable
            getRowKey={(r) => r.id}
          />
        </ChartCard>
      </section>
    </DashboardPage>
  )
}