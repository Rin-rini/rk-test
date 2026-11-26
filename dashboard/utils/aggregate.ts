import { costItemChartColor } from '../constants/costItemChartColors.ts'
import type { BudgetRow } from '../types.ts'

/** Суммирует числа, пропуская `null` — вспомогательная для `aggregateKpi`. */
export function sumNullable(values: (number | null)[]): number {
  return values.reduce<number>((acc, v) => (v === null ? acc : acc + v), 0)
}

export type KpiTotals = {
  plan: number
  fact: number
  deviation: number
  deviationPercent: number | null
}

/** Итоги план/факт/отклонение по отфильтрованным строкам — блок KPI (`KPICard`). */
export function aggregateKpi(rows: BudgetRow[]): KpiTotals {
  const plan = sumNullable(rows.map((r) => r.plan))
  const fact = sumNullable(rows.map((r) => r.fact))
  const deviation = fact - plan
  const deviationPercent = plan > 0 ? deviation / plan : null
  return { plan, fact, deviation, deviationPercent }
}

const MONTH_LABELS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

/** Подпись месяца для оси X («янв 24») — график «Исполнение и план по месяцам». */
export function monthChartLabel(isoMonth: string): string {
  const [y, m] = isoMonth.split('-').map(Number)
  const shortYear = String(y).slice(2)
  return `${MONTH_LABELS[(m ?? 1) - 1]} ${shortYear}`
}

export type MonthSeriesPoint = {
  month: string
  label: string
  plan: number
  fact: number
}

export type DaySeriesPoint = {
  day: string
  label: string
  month: string
  plan: number
  fact: number
}

/** Индекс дневных строк по `YYYY-MM` — drill-down месячного `ComboBarLineChart`. */
export function indexRowsByMonth(rows: BudgetRow[]): Map<string, BudgetRow[]> {
  const map = new Map<string, BudgetRow[]>()
  for (const row of rows) {
    const month = row.date.slice(0, 7)
    const bucket = map.get(month)
    if (bucket) bucket.push(row)
    else map.set(month, [row])
  }
  return map
}

/** План/факт по дням выбранного месяца — детальный уровень drill-down «Исполнение и план по месяцам». */
export function aggregateByDayInMonth(rows: BudgetRow[], isoMonth: string): DaySeriesPoint[] {
  const prefix = `${isoMonth}-`
  const [y, m] = isoMonth.split('-').map(Number)
  if (!y || !m) return []

  const daysInMonth = new Date(y, m, 0).getDate()
  const dayMap = new Map<string, { plan: number; fact: number }>()

  for (const row of rows) {
    if (!row.date.startsWith(prefix)) continue
    const dayKey = row.date.slice(8, 10)
    const cur = dayMap.get(dayKey) ?? { plan: 0, fact: 0 }
    if (row.plan !== null) cur.plan += row.plan
    if (row.fact !== null) cur.fact += row.fact
    dayMap.set(dayKey, cur)
  }

  const points: DaySeriesPoint[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = String(day).padStart(2, '0')
    const vals = dayMap.get(dayKey) ?? { plan: 0, fact: 0 }
    points.push({
      day: dayKey,
      label: `${String(day)}.${String(m).padStart(2, '0')}`,
      month: isoMonth,
      plan: vals.plan,
      fact: vals.fact,
    })
  }
  return points
}

/** Помесячные суммы план/факт — `ComboBarLineChart` «Исполнение и план по месяцам». */
export function aggregateByMonth(rows: BudgetRow[]): MonthSeriesPoint[] {
  const map = new Map<string, { plan: number; fact: number }>()
  for (const row of rows) {
    const month = row.date.slice(0, 7)
    const cur = map.get(month) ?? { plan: 0, fact: 0 }
    if (row.plan !== null) cur.plan += row.plan
    if (row.fact !== null) cur.fact += row.fact
    map.set(month, cur)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({
      month,
      label: monthChartLabel(month),
      plan: vals.plan,
      fact: vals.fact,
    }))
}

export type DepartmentBarPoint = {
  department: string
  departmentId: string
  fact: number
  plan: number
  deviationPercent: number | null
}

/**
 * Сводка план/факт по подразделениям (база для сводки):
 * отклонение — `HorizontalBarChart`, факт — `VerticalBarChart`, строки — `DataTable` сводки.
 */
export function aggregateByDepartment(rows: BudgetRow[]): DepartmentBarPoint[] {
  const map = new Map<string, DepartmentBarPoint>()
  for (const row of rows) {
    const cur =
      map.get(row.departmentId) ??
      ({
        department: row.department,
        departmentId: row.departmentId,
        fact: 0,
        plan: 0,
        deviationPercent: null,
      } satisfies DepartmentBarPoint)
    if (row.plan !== null) cur.plan += row.plan
    if (row.fact !== null) cur.fact += row.fact
    map.set(row.departmentId, cur)
  }
  return [...map.values()]
    .map((d) => ({
      ...d,
      deviationPercent: d.plan > 0 ? (d.fact - d.plan) / d.plan : null,
    }))
    .sort((a, b) => b.fact - a.fact)
}

export type CostItemSlice = {
  id: string
  label: string
  value: number
  color?: string
}

/** Доли факта по статьям затрат — `PieChart` «Структура факта по статьям затрат». */
export function aggregateByCostItem(rows: BudgetRow[]): CostItemSlice[] {
  const map = new Map<string, number>()
  for (const row of rows) {
    if (row.fact === null) continue
    map.set(row.costItem, (map.get(row.costItem) ?? 0) + row.fact)
  }
  return [...map.entries()]
    .map(([label, value]) => ({
      id: label,
      label,
      value,
      color: costItemChartColor(label),
    }))
    .sort((a, b) => b.value - a.value)
}

export type CostItemPlanFactPoint = {
  costItem: string
  plan: number
  fact: number
}

/** План и факт по статьям — `VerticalGroupedBarChart` «План и факт по статьям затрат». */
export function aggregateByCostItemPlanFact(rows: BudgetRow[]): CostItemPlanFactPoint[] {
  const map = new Map<string, { plan: number; fact: number }>()
  for (const row of rows) {
    const cur = map.get(row.costItem) ?? { plan: 0, fact: 0 }
    if (row.plan !== null) cur.plan += row.plan
    if (row.fact !== null) cur.fact += row.fact
    map.set(row.costItem, cur)
  }
  return [...map.entries()]
    .map(([costItem, vals]) => ({ costItem, plan: vals.plan, fact: vals.fact }))
    .sort((a, b) => b.fact - a.fact)
}

export type DetailTableRow = {
  id: string
  month: string
  department: string
  costItem: string
  plan: number | null
  fact: number | null
  deviation: number | null
  deviationPercent: number | null
}

/** Агрегация дневных строк в месяц × подразделение × статья — `DataTable` в режиме «Детализация». */
export function aggregateDetailTableRows(rows: BudgetRow[]): DetailTableRow[] {
  type Acc = {
    month: string
    department: string
    costItem: string
    plan: number
    fact: number
    hasPlan: boolean
    hasFact: boolean
  }

  const map = new Map<string, Acc>()
  for (const row of rows) {
    const month = row.date.slice(0, 7)
    const key = `${month}|${row.departmentId}|${row.costItem}`
    const cur =
      map.get(key) ??
      ({
        month,
        department: row.department,
        costItem: row.costItem,
        plan: 0,
        fact: 0,
        hasPlan: false,
        hasFact: false,
      })

    if (row.plan !== null) {
      cur.plan += row.plan
      cur.hasPlan = true
    }
    if (row.fact !== null) {
      cur.fact += row.fact
      cur.hasFact = true
    }
    map.set(key, cur)
  }

  return [...map.entries()]
    .map(([key, acc]) => {
      const plan = acc.hasPlan ? acc.plan : null
      const fact = acc.hasFact ? acc.fact : null
      const deviation =
        plan !== null && fact !== null ? fact - plan : null
      const deviationPercent =
        plan !== null && plan > 0 && fact !== null ? (fact - plan) / plan : null
      return {
        id: key,
        month: acc.month,
        department: acc.department,
        costItem: acc.costItem,
        plan,
        fact,
        deviation,
        deviationPercent,
      }
    })
    .sort((a, b) => b.month.localeCompare(a.month))
}

export type DepartmentSummaryRow = {
  id: string
  department: string
  departmentId: string
  plan: number
  fact: number
  deviation: number
  deviationPercent: number | null
}

/** Преобразование точек подразделений в строки — `DataTable` «Сводка по подразделениям». */
export function departmentSummaryFromBar(rows: DepartmentBarPoint[]): DepartmentSummaryRow[] {
  return rows.map((d) => ({
    id: d.departmentId,
    department: d.department,
    departmentId: d.departmentId,
    plan: d.plan,
    fact: d.fact,
    deviation: d.fact - d.plan,
    deviationPercent: d.deviationPercent,
  }))
}

export type DepartmentDeviationPoint = {
  department: string
  deviation: number
}

/** Отклонение факт − план по подразделениям — `HorizontalBarChart` «Отклонение по подразделениям, ₽». */
export function departmentDeviationFromBar(rows: DepartmentBarPoint[]): DepartmentDeviationPoint[] {
  return rows
    .map((d) => ({ department: d.department, deviation: d.fact - d.plan }))
    .sort((a, b) => b.deviation - a.deviation)
}

export type DepartmentCostStructureSeries = {
  key: string
  name: string
  color?: string
}

export type DepartmentCostStructure = {
  data: Record<string, string | number>[]
  series: DepartmentCostStructureSeries[]
}

/** Стек статей затрат внутри каждого подразделения — `HorizontalStackedBarChart` «Структура затрат по подразделениям». */
export function aggregateDepartmentCostStructure(
  rows: BudgetRow[],
  metric: 'fact' | 'plan' = 'fact',
): DepartmentCostStructure {
  const costItems = [...new Set(rows.map((r) => r.costItem))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
  const series: DepartmentCostStructureSeries[] = costItems.map((name, index) => ({
    key: `cost_${index}`,
    name,
    color: costItemChartColor(name, index),
  }))
  const keyByItem = new Map(costItems.map((name, index) => [name, `cost_${index}`]))

  const deptMap = new Map<
    string,
    { department: string; totals: Record<string, number> }
  >()

  for (const row of rows) {
    const amount = metric === 'fact' ? row.fact : row.plan
    if (amount === null) continue
    const itemKey = keyByItem.get(row.costItem)
    if (!itemKey) continue
    const dept =
      deptMap.get(row.departmentId) ??
      ({ department: row.department, totals: {} } satisfies {
        department: string
        totals: Record<string, number>
      })
    dept.totals[itemKey] = (dept.totals[itemKey] ?? 0) + amount
    deptMap.set(row.departmentId, dept)
  }

  const data = [...deptMap.values()]
    .map((dept) => {
      const total = Object.values(dept.totals).reduce((s, v) => s + v, 0)
      const point: Record<string, string | number> = { department: dept.department, total }
      for (const s of series) {
        point[s.key] = dept.totals[s.key] ?? 0
      }
      return point
    })
    .sort((a, b) => (b.total as number) - (a.total as number))
    .map(({ total: _total, ...rest }) => rest)

  return { data, series }
}