import type { DetailTableRow, DepartmentSummaryRow } from '@dashboard/utils/aggregate.ts'
import type { DataTableColumn } from '@ui-kit/components/ui/index.ts'

export const BUDGET_SUMMARY_TABLE_COLUMNS: DataTableColumn<DepartmentSummaryRow>[] = [
  {
    id: 'department',
    header: 'Подразделение',
    accessor: (r) => r.department,
    sortable: true,
    filterable: true,
  },
  {
    id: 'plan',
    header: 'План',
    accessor: (r) => r.plan,
    format: 'currency',
    sortable: true,
  },
  {
    id: 'fact',
    header: 'Факт',
    accessor: (r) => r.fact,
    format: 'currency',
    sortable: true,
  },
  {
    id: 'deviation',
    header: 'Δ, ₽',
    accessor: (r) => r.deviation,
    format: 'currency',
    sortable: true,
  },
  {
    id: 'deviationPercent',
    header: 'Δ, %',
    accessor: (r) => r.deviationPercent,
    format: 'percent',
    sortable: true,
  },
]

export const BUDGET_DETAIL_TABLE_COLUMNS: DataTableColumn<DetailTableRow>[] = [
  {
    id: 'month',
    header: 'Месяц',
    accessor: (r) => r.month,
    sortable: true,
    filterable: true,
  },
  {
    id: 'department',
    header: 'Подразделение',
    accessor: (r) => r.department,
    sortable: true,
    filterable: true,
  },
  {
    id: 'costItem',
    header: 'Статья',
    accessor: (r) => r.costItem,
    sortable: true,
    filterable: true,
  },
  {
    id: 'plan',
    header: 'План',
    accessor: (r) => r.plan,
    format: 'currency',
    sortable: true,
  },
  {
    id: 'fact',
    header: 'Факт',
    accessor: (r) => r.fact,
    format: 'currency',
    sortable: true,
  },
  {
    id: 'deviation',
    header: 'Δ, ₽',
    accessor: (r) => r.deviation,
    format: 'currency',
    sortable: true,
  },
  {
    id: 'deviationPercent',
    header: 'Δ, %',
    accessor: (r) => r.deviationPercent,
    format: 'percent',
    sortable: true,
  },
]