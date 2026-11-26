import type { PaymentRequestStatus } from '@rules-test/types.ts'

export const STATUS_FILTER_ALL = 'all' as const

export const STATUS_FILTER_OPTIONS = [
  { value: STATUS_FILTER_ALL, label: 'Все' },
  { value: 'draft', label: 'Черновик' },
  { value: 'pending_approval', label: 'На согласовании' },
  { value: 'approved', label: 'Согласована' },
  { value: 'paid', label: 'Оплачена' },
  { value: 'rejected', label: 'Отклонена' },
] as const

const STATUS_LABELS: Record<PaymentRequestStatus, string> = {
  draft: 'Черновик',
  pending_approval: 'На согласовании',
  approved: 'Согласована',
  paid: 'Оплачена',
  rejected: 'Отклонена',
}

export function statusLabel(status: PaymentRequestStatus): string {
  return STATUS_LABELS[status]
}

export function basisLabel(row: { basis: string }): string {
  return row.basis
}