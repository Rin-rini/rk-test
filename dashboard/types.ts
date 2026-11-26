export type BudgetRow = {
  /** Календарный день, YYYY-MM-DD. */
  date: string
  departmentId: string
  department: string
  costItem: string
  plan: number | null
  fact: number | null
}

export type BudgetDataset = {
  meta: {
    generatedAt: string
    currency: string
    months: number
    dateFrom?: string
    dateTo?: string
    granularity?: string
    rowCount?: number
    departments: string[]
    costItems: string[]
  }
  rows: BudgetRow[]
}

export type DepartmentOption = {
  value: string
  label: string
}