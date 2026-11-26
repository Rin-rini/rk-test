import type { CellFormat, CurrencyCode } from '@ui-kit/visualization/types.ts'

export type { CellFormat }

export type ColumnFilterEntry = {
  query: string
}

export type ColumnFiltersState = Record<string, ColumnFilterEntry>

export type DataTableColumn<T> = {
  id: string
  header: string
  accessor: (row: T) => string | number | null
  format?: CellFormat
  /** При `format: 'currency' | 'currencyCompact'` — ISO-код валюты (по умолчанию RUB). */
  currency?: CurrencyCode
  sortable?: boolean
  filterable?: boolean
}

export type SortDirection = 'asc' | 'desc'

export type DataTableSort = {
  columnId: string
  direction: SortDirection
} | null