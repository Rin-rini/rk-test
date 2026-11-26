import { statusLabel } from '@rules-test/constants/statusOptions.ts'
import type { PaymentRequestRow, PaymentRequestStatus } from '@rules-test/types.ts'
import { parseISODate } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'

export type PaymentRequestKpi = {
  dueToday: number
  overdue: number
  pendingApproval: number
}

const STATUS_ORDER: PaymentRequestStatus[] = [
  'draft',
  'pending_approval',
  'approved',
  'paid',
  'rejected',
]

function sumAmount(rows: PaymentRequestRow[]): number {
  return rows.reduce((acc, row) => acc + row.amount, 0)
}

export function aggregateKpi(rows: PaymentRequestRow[], todayISO: string): PaymentRequestKpi {
  const today = parseISODate(todayISO)?.getTime()
  const dueToday = sumAmount(
    rows.filter((row) => row.status === 'approved' && row.paymentDate === todayISO),
  )
  const overdue = sumAmount(
    rows.filter((row) => {
      if (row.status !== 'approved') return false
      const payment = parseISODate(row.paymentDate)?.getTime()
      if (today === undefined || payment === undefined) return false
      return payment < today
    }),
  )
  const pendingApproval = sumAmount(rows.filter((row) => row.status === 'pending_approval'))
  return { dueToday, overdue, pendingApproval }
}

export type PaymentCalendarPoint = {
  label: string
  amount: number
}

const weekdayFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })
const dayMonthFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })

export function aggregatePaymentCalendar(
  rows: PaymentRequestRow[],
  rangeDays: number,
): PaymentCalendarPoint[] {
  const payable = rows.filter((row) => row.status === 'approved')
  const byKey = new Map<string, number>()

  for (const row of payable) {
  if (!parseISODate(row.paymentDate)) continue
    const key = row.paymentDate
    byKey.set(key, (byKey.get(key) ?? 0) + row.amount)
  }

  return [...byKey.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([paymentDate, amount]) => {
      const date = parseISODate(paymentDate)
      const label =
        rangeDays <= 14 && date
          ? weekdayFmt.format(date).replace(/\.$/, '')
          : date
            ? dayMonthFmt.format(date)
            : paymentDate
      return { label, amount }
    })
}

export type StatusBarPoint = {
  status: string
  amount: number
}

export function aggregateByStatus(rows: PaymentRequestRow[]): StatusBarPoint[] {
  const totals = new Map<PaymentRequestStatus, number>()
  for (const status of STATUS_ORDER) totals.set(status, 0)
  for (const row of rows) {
    totals.set(row.status, (totals.get(row.status) ?? 0) + row.amount)
  }
  return STATUS_ORDER.map((status) => ({
    status: statusLabel(status),
    amount: totals.get(status) ?? 0,
  })).filter((point) => point.amount > 0)
}

export function rangeDayCount(from: string, to: string): number {
  const start = parseISODate(from)
  const end = parseISODate(to)
  if (!start || !end) return 31
  const ms = end.getTime() - start.getTime()
  return Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)) + 1)
}