import { describe, expect, it } from 'vitest'
import { sortTableRows } from './sortRows.ts'
import type { DataTableColumn } from './types.ts'

type Row = { name: string; amount: number | null }

const columns: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Имя', accessor: (r) => r.name, sortable: true },
  { id: 'amount', header: 'Сумма', accessor: (r) => r.amount, sortable: true, format: 'currency' },
]

const rows: Row[] = [
  { name: 'Бета', amount: 200 },
  { name: 'Альфа', amount: null },
  { name: 'Гамма', amount: 100 },
]

describe('sortTableRows', () => {
  it('sorts strings ascending with ru locale', () => {
    const sorted = sortTableRows(rows, columns, { columnId: 'name', direction: 'asc' })
    expect(sorted.map((r) => r.name)).toEqual(['Альфа', 'Бета', 'Гамма'])
  })

  it('sorts numbers descending', () => {
    const sorted = sortTableRows(rows, columns, { columnId: 'amount', direction: 'desc' })
    expect(sorted.map((r) => r.amount)).toEqual([200, 100, null])
  })

  it('returns original order when sort is null', () => {
    expect(sortTableRows(rows, columns, null)).toEqual(rows)
  })
})