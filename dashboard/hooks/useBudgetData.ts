import { useEffect, useMemo, useState } from 'react'
import dataset from '../data/budget.json'
import type { BudgetDataset, BudgetRow, DepartmentOption } from '../types.ts'

const LOAD_DELAY_MS = 1400

function parseDataset() {
  const data = dataset as BudgetDataset
  const deptOptions: DepartmentOption[] = []
  const seen = new Set<string>()
  for (const row of data.rows) {
    if (seen.has(row.departmentId)) continue
    seen.add(row.departmentId)
    deptOptions.push({ value: row.departmentId, label: row.department })
  }
  deptOptions.sort((a, b) => a.label.localeCompare(b.label, 'ru'))
  return { rows: data.rows as BudgetRow[], departments: deptOptions }
}

export function useBudgetData() {
  const parsed = useMemo(() => parseDataset(), [])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOAD_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return {
    rows: ready ? parsed.rows : [],
    departments: parsed.departments,
    isLoading: !ready,
    error: null as string | null,
  }
}