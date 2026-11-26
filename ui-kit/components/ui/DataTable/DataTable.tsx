import { formatByMetric, joinDisplayClasses, metricDisplayClass } from '@ui-kit/visualization/index.ts'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useMemo } from 'react'
import { Skeleton } from '@ui-kit/components/ui/Skeleton/Skeleton.tsx'
import { EmptyDataState } from '../feedback/EmptyDataState.tsx'
import { ErrorDataState } from '../feedback/ErrorDataState.tsx'
import type { DataStatus } from '../feedback/types.ts'
import { ColumnFilterMenu, isColumnFilterActive } from './ColumnFilterMenu.tsx'
import { filterTableRows } from './filterRows.ts'
import { sortTableRows } from './sortRows.ts'
import type { ColumnFiltersState, DataTableColumn, DataTableSort, SortDirection } from './types.ts'
import styles from './DataTable.module.css'

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  rows: T[]
  sort: DataTableSort
  onSortChange: (sort: DataTableSort) => void
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  status?: DataStatus
  onRetry?: () => void
  skeletonRowCount?: number
  getRowKey: (row: T, index: number) => string
  scrollable?: boolean
}

function nextDirection(current: DataTableSort, columnId: string): SortDirection {
  if (!current || current.columnId !== columnId) return 'asc'
  return current.direction === 'asc' ? 'desc' : 'asc'
}

const emptyFilter = { query: '' }

export function DataTable<T>({
  columns,
  rows,
  sort,
  onSortChange,
  columnFilters = {},
  onColumnFiltersChange,
  status = 'ready',
  onRetry,
  skeletonRowCount = 5,
  getRowKey,
  scrollable = false,
}: DataTableProps<T>) {
  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return
    onSortChange({ columnId, direction: nextDirection(sort, columnId) })
  }

  const displayRows = useMemo(() => {
    if (status !== 'ready') return rows
    const filtered = filterTableRows(rows, columns, columnFilters)
    return sortTableRows(filtered, columns, sort)
  }, [status, rows, columns, columnFilters, sort])

  const filtersEnabled = Boolean(onColumnFiltersChange) && status === 'ready'

  const patchColumnFilter = (columnId: string, entry: { query: string }) => {
    onColumnFiltersChange?.({
      ...columnFilters,
      [columnId]: entry,
    })
  }

  const colSpan = columns.length

  const body =
    status === 'loading' ? (
      <>
        {Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
          <tr key={`skel-${rowIndex}`}>
            {columns.map((column) => (
              <td key={column.id}>
                <Skeleton className={styles.skelCell} />
              </td>
            ))}
          </tr>
        ))}
      </>
    ) : status === 'empty' ? (
      <tr>
        <td colSpan={colSpan} className={styles.stateCell}>
          <EmptyDataState />
        </td>
      </tr>
    ) : status === 'error' ? (
      <tr>
        <td colSpan={colSpan} className={styles.stateCell}>
          <ErrorDataState onRetry={onRetry} />
        </td>
      </tr>
    ) : displayRows.length === 0 ? (
      <tr>
        <td colSpan={colSpan} className={styles.stateCell}>
          <p className={styles.noMatches}>Нет строк по заданным фильтрам</p>
        </td>
      </tr>
    ) : (
      displayRows.map((row, rowIndex) => (
        <tr key={getRowKey(row, rowIndex)}>
          {columns.map((column) => (
            <td
              key={column.id}
              className={joinDisplayClasses(metricDisplayClass(column.format ?? 'text'))}
            >
              {formatByMetric(column.accessor(row), column.format ?? 'text', {
                currency: column.currency,
              })}
            </td>
          ))}
        </tr>
      ))
    )

  return (
    <div
      className={[
        'kit-scrollbar',
        styles.wrap,
        scrollable ? styles.wrapScrollable : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => {
              const sortActive = sort?.columnId === column.id
              const filterActive = isColumnFilterActive(columnFilters[column.id])
              const SortIcon = !column.sortable
                ? null
                : !sortActive
                  ? ArrowUpDown
                  : sort?.direction === 'asc'
                    ? ArrowUp
                    : ArrowDown
              return (
                <th
                  key={column.id}
                  className={filterActive ? styles.thFiltered : undefined}
                >
                  <span className={styles.thLabel}>
                    <button
                      type="button"
                      className={[styles.thButton, column.sortable ? styles.thSortable : ''].join(' ')}
                      onClick={() => handleSort(column.id, column.sortable)}
                      disabled={!column.sortable}
                    >
                      <span>{column.header}</span>
                      {SortIcon ? <SortIcon size={14} aria-hidden /> : null}
                    </button>
                    {column.filterable && filtersEnabled ? (
                      <ColumnFilterMenu
                        header={column.header}
                        value={columnFilters[column.id] ?? emptyFilter}
                        onChange={(entry) => patchColumnFilter(column.id, entry)}
                      />
                    ) : null}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  )
}