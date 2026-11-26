import type { DateRangeValue } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'
import { parseISODate } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'
import type { BudgetRow } from '../types.ts'

export function dateInRange(date: string, range: DateRangeValue): boolean {
  const d = parseISODate(date)
  if (!d) return false
  const from = range.from ? parseISODate(range.from) : null
  const to = range.to ? parseISODate(range.to) : null
  if (from && d.getTime() < from.getTime()) return false
  if (to && d.getTime() > to.getTime()) return false
  return true
}

export function filterBudgetRows(
  rows: BudgetRow[],
  range: DateRangeValue,
  departmentIds: string[],
): BudgetRow[] {
  return rows.filter((row) => {
    if (!dateInRange(row.date, range)) return false
    if (departmentIds.length > 0 && !departmentIds.includes(row.departmentId)) return false
    return true
  })
}