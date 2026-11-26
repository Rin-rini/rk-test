import { useEffect, useMemo, useState } from 'react'
import dataset from '../data/cashflow.json'
import type { CashflowDataset, CashflowRow, LegalEntityOption } from '../types.ts'

const LOAD_DELAY_MS = 900

function parseDataset(): {
  dataset: CashflowDataset
  legalEntities: LegalEntityOption[]
  rows: CashflowRow[]
} {
  const data = dataset as CashflowDataset
  const legalEntities: LegalEntityOption[] = [
    { value: 'all', label: 'Все юрлица' },
    ...data.legalEntities,
  ]
  return { dataset: data, legalEntities, rows: data.rows }
}

export function useCashflowData() {
  const parsed = useMemo(() => parseDataset(), [])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOAD_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return {
    dataset: parsed.dataset,
    rows: ready ? parsed.rows : [],
    legalEntities: parsed.legalEntities,
    activityTypes: parsed.dataset.meta.activityTypes,
    currencies: parsed.dataset.meta.currencies,
    defaultPeriod: parsed.dataset.meta.dateRange,
    isLoading: !ready,
    error: null as string | null,
  }
}