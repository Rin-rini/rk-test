export type PaymentRequestStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'paid'
  | 'rejected'

export type PaymentBasisType = 'contract' | 'invoice'

export type PaymentRequestRow = {
  id: string
  counterpartyId: string
  counterparty: string
  amount: number
  status: PaymentRequestStatus
  basisType: PaymentBasisType
  basis: string
  initiator: string
  /** Плановая дата платежа, YYYY-MM-DD. */
  paymentDate: string
}

export type PaymentRequestDataset = {
  meta: {
    generatedAt: string
    currency: string
    referenceToday: string
    dateRange: { from: string; to: string }
    rowCount: number
  }
  counterparties: { value: string; label: string }[]
  rows: PaymentRequestRow[]
}

export type CounterpartyOption = {
  value: string
  label: string
}