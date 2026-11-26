import { basisLabel, statusLabel } from '@rules-test/constants/statusOptions.ts'
import type { PaymentRequestRow } from '@rules-test/types.ts'
import type { DataTableColumn } from '@ui-kit/components/ui/index.ts'

export type PaymentRequestTableRow = Pick<
  PaymentRequestRow,
  'id' | 'counterparty' | 'amount' | 'status' | 'basis' | 'basisType' | 'initiator'
>

export const PAYMENT_REQUEST_TABLE_COLUMNS: DataTableColumn<PaymentRequestTableRow>[] = [
  {
    id: 'counterparty',
    header: 'Контрагент',
    accessor: (r) => r.counterparty,
    sortable: true,
    filterable: true,
  },
  {
    id: 'amount',
    header: 'Сумма',
    accessor: (r) => r.amount,
    format: 'currency',
    sortable: true,
  },
  {
    id: 'status',
    header: 'Статус',
    accessor: (r) => statusLabel(r.status),
    sortable: true,
    filterable: true,
  },
  {
    id: 'basis',
    header: 'Основание',
    accessor: (r) => basisLabel(r),
    sortable: true,
    filterable: true,
  },
  {
    id: 'initiator',
    header: 'Инициатор',
    accessor: (r) => r.initiator,
    sortable: true,
    filterable: true,
  },
]