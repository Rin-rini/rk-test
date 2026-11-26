import {
  PAYMENT_REQUEST_TABLE_COLUMNS,
  type PaymentRequestTableRow,
} from '@rules-test/constants/tableColumns.ts'
import { STATUS_FILTER_OPTIONS } from '@rules-test/constants/statusOptions.ts'
import { usePaymentRequestData } from '@rules-test/hooks/usePaymentRequestData.ts'
import {
  aggregateByStatus,
  aggregateKpi,
  aggregatePaymentCalendar,
  rangeDayCount,
} from '@rules-test/utils/aggregate.ts'
import { filterPaymentRequestRows } from '@rules-test/utils/filters.ts'
import {
  ChartCard,
  DataTable,
  FilterPanel,
  HorizontalBarChart,
  KPICard,
  VerticalBarChart,
  type ColumnFiltersState,
  type DataTableSort,
  type FilterPanelValues,
  resolveDataStatus,
} from '@ui-kit/components/ui/index.ts'
import { DashboardPage, DashboardPageHeader, dashboardGrid } from '@ui-kit/components/layout'
import { useMemo, useState } from 'react'

const DEFAULT_PERIOD = { from: '2025-09-01', to: '2025-12-15' }

const DEFAULT_FILTERS: FilterPanelValues = {
  period: DEFAULT_PERIOD,
  status: ['all'],
  counterparty: [],
}

function toTableRows(
  rows: ReturnType<typeof filterPaymentRequestRows>,
): PaymentRequestTableRow[] {
  return rows.map((row) => ({
    id: row.id,
    counterparty: row.counterparty,
    amount: row.amount,
    status: row.status,
    basisType: row.basisType,
    basis: row.basis,
    initiator: row.initiator,
  }))
}

export function PaymentRequestRegistryDashboard() {
  const { meta, rows, counterparties, isLoading, error } = usePaymentRequestData()
  const [filters, setFilters] = useState<FilterPanelValues>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<DataTableSort>({ columnId: 'amount', direction: 'desc' })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>({})

  const period = (filters.period as { from: string; to: string }) ?? DEFAULT_PERIOD
  const statusIds = (filters.status as string[] | undefined) ?? ['all']
  const counterpartyIds = (filters.counterparty as string[] | undefined) ?? []

  const filtered = useMemo(
    () => filterPaymentRequestRows(rows, period, counterpartyIds, statusIds),
    [rows, period, counterpartyIds, statusIds],
  )

  const todayISO = meta.referenceToday
  const kpi = useMemo(() => aggregateKpi(filtered, todayISO), [filtered, todayISO])

  const periodDays = useMemo(() => rangeDayCount(period.from, period.to), [period.from, period.to])

  const paymentCalendar = useMemo(
    () => aggregatePaymentCalendar(filtered, periodDays),
    [filtered, periodDays],
  )

  const statusBars = useMemo(() => aggregateByStatus(filtered), [filtered])

  const statusChartHeight = useMemo(
    () => Math.min(280, Math.max(168, statusBars.length * 36 + 48)),
    [statusBars.length],
  )

  const tableRows = useMemo(() => toTableRows(filtered), [filtered])

  const status = resolveDataStatus({
    isLoading,
    error,
    sourceCount: rows.length,
    resultCount: filtered.length,
  })

  return (
    <DashboardPage>
      <DashboardPageHeader title="Реестр заявок на оплату" />

      <FilterPanel
        filters={[
          { kind: 'dateRange', id: 'period', label: 'Период' },
          {
            kind: 'multiSelect',
            id: 'status',
            label: 'Статус заявок',
            options: [...STATUS_FILTER_OPTIONS],
          },
          {
            kind: 'multiSelect',
            id: 'counterparty',
            label: 'Контрагенты',
            options: counterparties,
          },
        ]}
        value={filters}
        onChange={setFilters}
        defaultValues={DEFAULT_FILTERS}
      />

      <section className={dashboardGrid.kpiRow} aria-label="Ключевые показатели">
        <KPICard title="К оплате сегодня" value={kpi.dueToday} unit="currency" status={status} />
        <KPICard
          title="Просроченные заявки"
          value={kpi.overdue}
          unit="currency"
          status={status}
        />
        <KPICard title="На согласовании" value={kpi.pendingApproval} unit="currency" status={status} />
      </section>

      <section className={dashboardGrid.charts} aria-label="Графики">
        <ChartCard className={dashboardGrid.chartHalf} title="Платежный календарь" status={status}>
          <VerticalBarChart
            data={paymentCalendar}
            categoryKey="label"
            valueKey="amount"
            name="К оплате"
            valueFormat="currencyCompact"
            height={200}
          />
        </ChartCard>

        <ChartCard className={dashboardGrid.chartHalf} title="Статусы заявок" status={status}>
          <HorizontalBarChart
            data={statusBars}
            categoryKey="status"
            valueKey="amount"
            name="Сумма"
            valueFormat="currencyCompact"
            height={statusChartHeight}
          />
        </ChartCard>
      </section>

      <section aria-label="Реестр заявок">
        <DataTable
          columns={PAYMENT_REQUEST_TABLE_COLUMNS}
          rows={tableRows}
          sort={sort}
          onSortChange={setSort}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          status={status}
          scrollable
          getRowKey={(row) => row.id}
        />
      </section>
    </DashboardPage>
  )
}