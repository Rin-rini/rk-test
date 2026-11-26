import type { DateRangeValue } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'
import { parseISODate } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'
import { STATUS_FILTER_ALL } from '@rules-test/constants/statusOptions.ts'
import type { PaymentRequestRow, PaymentRequestStatus } from '@rules-test/types.ts'

export function dateInRange(date: string, range: DateRangeValue): boolean {
  const d = parseISODate(date)
  if (!d) return false
  const from = range.from ? parseISODate(range.from) : null
  const to = range.to ? parseISODate(range.to) : null
  if (from && d.getTime() < from.getTime()) return false
  if (to && d.getTime() > to.getTime()) return false
  return true
}

function resolveStatusFilter(selected: string[]): PaymentRequestStatus[] | null {
  if (selected.length === 0 || selected.includes(STATUS_FILTER_ALL)) return null
  return selected as PaymentRequestStatus[]
}

export function filterPaymentRequestRows(
  rows: PaymentRequestRow[],
  range: DateRangeValue,
  counterpartyIds: string[],
  statusIds: string[],
): PaymentRequestRow[] {
  const statuses = resolveStatusFilter(statusIds)
  return rows.filter((row) => {
    if (!dateInRange(row.paymentDate, range)) return false
    if (counterpartyIds.length > 0 && !counterpartyIds.includes(row.counterpartyId)) return false
    if (statuses && !statuses.includes(row.status)) return false
    return true
  })
}