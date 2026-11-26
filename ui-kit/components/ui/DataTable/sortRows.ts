import type { DataTableColumn, DataTableSort, SortDirection } from './types.ts'

function comparePrimitives(
  a: string | number,
  b: string | number,
  direction: SortDirection,
): number {
  const mul = direction === 'asc' ? 1 : -1
  if (typeof a === 'number' && typeof b === 'number') {
    if (a === b) return 0
    return mul * (a < b ? -1 : 1)
  }
  return mul * String(a).localeCompare(String(b), 'ru', { numeric: true })
}

function compareCellValues(
  a: string | number | null,
  b: string | number | null,
  direction: SortDirection,
): number {
  const aNull = a === null
  const bNull = b === null
  if (aNull && bNull) return 0
  /** Пустые значения всегда в конце списка. */
  if (aNull) return 1
  if (bNull) return -1

  if (typeof a === 'number' && typeof b === 'string') {
    return comparePrimitives(a, b, direction)
  }
  if (typeof a === 'string' && typeof b === 'number') {
    return comparePrimitives(a, b, direction)
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return comparePrimitives(a, b, direction)
  }
  return comparePrimitives(String(a), String(b), direction)
}

/** Сортирует копию строк по активной колонке. */
export function sortTableRows<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  sort: DataTableSort,
): T[] {
  if (!sort) return rows

  const column = columns.find((c) => c.id === sort.columnId)
  if (!column?.sortable) return rows

  const copy = [...rows]
  copy.sort((rowA, rowB) => {
    const a = column.accessor(rowA)
    const b = column.accessor(rowB)
    const cmp = compareCellValues(a, b, sort.direction)
    if (cmp !== 0) return cmp
    return 0
  })
  return copy
}