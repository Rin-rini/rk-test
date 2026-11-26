import type { DateRangeValue } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'
import { parseISODate } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'
import type { CashflowRow } from '../types.ts'

export function dateInRange(date: string, range: DateRangeValue): boolean {
  const d = parseISODate(date)
  if (!d) return false
  const from = range.from ? parseISODate(range.from) : null
  const to = range.to ? parseISODate(range.to) : null
  if (from && d.getTime() < from.getTime()) return false
  if (to && d.getTime() > to.getTime()) return false
  return true
}

export function rowAmount(row: CashflowRow, currency: string): number {
  return row.amounts[currency] ?? 0
}

export type CashflowFilterParams = {
  period: DateRangeValue
  legalEntityId: string
  activityTypes: string[]
  currency: string
}

export function filterCashflowRows(rows: CashflowRow[], params: CashflowFilterParams): CashflowRow[] {
  const { period, legalEntityId, activityTypes, currency } = params
  return rows.filter((row) => {
    if (!dateInRange(row.date, period)) return false
    if (legalEntityId !== 'all' && row.legalEntityId !== legalEntityId) return false
    if (activityTypes.length > 0 && !activityTypes.includes(row.activityType)) return false
    if (row.amounts[currency] === undefined) return false
    return true
  })
}

/** Строки до начала периода (для пересчёта входящего остатка), с теми же отборами кроме даты. */
export function rowsBeforePeriod(
  rows: CashflowRow[],
  params: Omit<CashflowFilterParams, 'period'> & { before: string },
): CashflowRow[] {
  const beforeDate = parseISODate(params.before)
  if (!beforeDate) return []
  return rows.filter((row) => {
    const d = parseISODate(row.date)
    if (!d || d.getTime() >= beforeDate.getTime()) return false
    if (params.legalEntityId !== 'all' && row.legalEntityId !== params.legalEntityId) return false
    if (params.activityTypes.length > 0 && !params.activityTypes.includes(row.activityType)) return false
    if (row.amounts[params.currency] === undefined) return false
    return true
  })
}

export function shiftRangeYears(range: DateRangeValue, years: number): DateRangeValue {
  const shift = (iso: string) => {
    if (!iso) return iso
    const [y, m, d] = iso.split('-').map(Number)
    if (!y || !m || !d) return iso
    return `${y + years}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  return { from: shift(range.from), to: shift(range.to) }
}