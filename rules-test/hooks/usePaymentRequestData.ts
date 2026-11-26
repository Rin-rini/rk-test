import dataset from '@rules-test/data/payment-requests.json'
import type { CounterpartyOption, PaymentRequestDataset, PaymentRequestRow } from '@rules-test/types.ts'
import { useEffect, useMemo, useState } from 'react'

const LOAD_DELAY_MS = 1200

function parseDataset() {
  const data = dataset as PaymentRequestDataset
  const counterparties: CounterpartyOption[] = [...data.counterparties].sort((a, b) =>
    a.label.localeCompare(b.label, 'ru'),
  )
  return {
    meta: data.meta,
    rows: data.rows as PaymentRequestRow[],
    counterparties,
  }
}

export function usePaymentRequestData() {
  const parsed = useMemo(() => parseDataset(), [])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOAD_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return {
    meta: parsed.meta,
    rows: ready ? parsed.rows : [],
    counterparties: parsed.counterparties,
    isLoading: !ready,
    error: null as string | null,
  }
}