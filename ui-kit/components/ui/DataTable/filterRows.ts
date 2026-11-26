import type { ColumnFiltersState, DataTableColumn } from './types.ts'

function cellToFilterString(value: string | number | null): string {
  if (value === null) return ''
  return String(value)
}

type ParsedQuery =
  | { kind: 'empty' }
  | { kind: 'contains'; needle: string }
  | { kind: 'regex'; pattern: string; flags: string }

/**
 * Обычный текст — поиск по вхождению (без учёта регистра).
 * Шаблон в слэшах — regex: `/договор/i`.
 */
function parseFilterQuery(raw: string): ParsedQuery {
  const query = raw.trim()
  if (!query) return { kind: 'empty' }

  const regexForm = query.match(/^\/(.+)\/([gimsuy]*)$/)
  if (regexForm) {
    return { kind: 'regex', pattern: regexForm[1], flags: regexForm[2] || 'i' }
  }
  return { kind: 'contains', needle: query.toLowerCase() }
}

function matchesFilterSafe(cell: string, query: string): boolean {
  const parsed = parseFilterQuery(query)
  if (parsed.kind === 'empty') return true
  if (parsed.kind === 'contains') {
    return cell.toLowerCase().includes(parsed.needle)
  }
  try {
    return new RegExp(parsed.pattern, parsed.flags).test(cell)
  } catch {
    return cell.toLowerCase().includes(query.toLowerCase())
  }
}

export function filterTableRows<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  columnFilters: ColumnFiltersState,
): T[] {
  return rows.filter((row) =>
    columns.every((column) => {
      if (!column.filterable) return true
      const filter = columnFilters[column.id]
      if (!filter?.query.trim()) return true
      const cell = cellToFilterString(column.accessor(row))
      return matchesFilterSafe(cell, filter.query)
    }),
  )
}