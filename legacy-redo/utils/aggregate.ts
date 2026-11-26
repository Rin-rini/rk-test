import type {
  CashflowDataset,
  CashflowKpi,
  CashflowMonthPoint,
  CashflowRow,
  CounterpartyMeta,
  OutflowByActivityPoint,
  TopCounterpartyRow,
} from '../types.ts'
import type { DateRangeValue } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'
import {
  filterCashflowRows,
  rowAmount,
  rowsBeforePeriod,
  shiftRangeYears,
  type CashflowFilterParams,
} from './filters.ts'

const MONTH_LABELS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export function monthChartLabel(isoMonth: string): string {
  const [y, m] = isoMonth.split('-').map(Number)
  const shortYear = String(y).slice(2)
  return `${MONTH_LABELS[(m ?? 1) - 1]} ${shortYear}`
}

function entityIds(legalEntityId: string, dataset: CashflowDataset): string[] {
  if (legalEntityId !== 'all') return [legalEntityId]
  return dataset.legalEntities.map((e) => e.value)
}

function anchorOpeningByEntity(
  dataset: CashflowDataset,
  entities: string[],
  currency: string,
  beforeDate: string,
): Map<string, { asOf: string; amount: number }> {
  const result = new Map<string, { asOf: string; amount: number }>()
  for (const entityId of entities) {
    const records = dataset.openingBalances
      .filter((r) => r.legalEntityId === entityId && r.asOf <= beforeDate)
      .sort((a, b) => b.asOf.localeCompare(a.asOf))
    const hit = records[0]
    if (hit) {
      result.set(entityId, { asOf: hit.asOf, amount: hit.amounts[currency] ?? 0 })
    } else {
      result.set(entityId, { asOf: '0000-01-01', amount: 0 })
    }
  }
  return result
}

function netOfRow(row: CashflowRow, currency: string): number {
  const amount = rowAmount(row, currency)
  return row.direction === 'in' ? amount : -amount
}

function balanceAtDate(
  dataset: CashflowDataset,
  params: Omit<CashflowFilterParams, 'period'>,
  asOfStart: string,
  historyRows: CashflowRow[],
): number {
  const entities = entityIds(params.legalEntityId, dataset)
  const anchors = anchorOpeningByEntity(dataset, entities, params.currency, asOfStart)
  let total = 0
  for (const entityId of entities) {
    const anchor = anchors.get(entityId) ?? { asOf: '0000-01-01', amount: 0 }
    let balance = anchor.amount
    for (const row of historyRows) {
      if (row.legalEntityId !== entityId) continue
      if (row.date < anchor.asOf) continue
      if (row.date >= asOfStart) continue
      balance += netOfRow(row, params.currency)
    }
    total += balance
  }
  return total
}

function sumDirection(rows: CashflowRow[], currency: string, direction: 'in' | 'out'): number {
  let sum = 0
  for (const row of rows) {
    if (row.direction !== direction) continue
    sum += rowAmount(row, currency)
  }
  return sum
}

export function aggregateKpi(dataset: CashflowDataset, params: CashflowFilterParams): CashflowKpi {
  const filtered = filterCashflowRows(dataset.rows, params)
  const inflow = sumDirection(filtered, params.currency, 'in')
  const outflow = sumDirection(filtered, params.currency, 'out')
  const net = inflow - outflow

  const prePeriodRows = rowsBeforePeriod(dataset.rows, {
    before: params.period.from,
    legalEntityId: params.legalEntityId,
    activityTypes: params.activityTypes,
    currency: params.currency,
  })
  const openingAtPeriodStart = balanceAtDate(dataset, params, params.period.from, prePeriodRows)

  const priorParams: CashflowFilterParams = {
    ...params,
    period: shiftRangeYears(params.period, -1),
  }
  const priorFiltered = filterCashflowRows(dataset.rows, priorParams)
  const priorNet =
    sumDirection(priorFiltered, params.currency, 'in') - sumDirection(priorFiltered, params.currency, 'out')
  const yoyNetPercent =
    priorNet !== 0 ? (net - priorNet) / Math.abs(priorNet) : null

  return { inflow, outflow, net, openingAtPeriodStart, yoyNetPercent }
}

function quarterKeyFromDate(isoDate: string): string {
  const [y, m] = isoDate.split('-').map(Number)
  if (!y || !m) return ''
  const q = Math.ceil(m / 3)
  return `${y}-Q${q}`
}

export function quarterChartLabel(quarterKey: string): string {
  const match = /^(\d{4})-Q(\d)$/.exec(quarterKey)
  if (!match) return quarterKey
  const [, y, q] = match
  return `${q} кв. ${String(y).slice(2)}`
}

function quartersInRange(period: DateRangeValue): string[] {
  const months = monthKeysInRange(period)
  const keys = new Set<string>()
  for (const month of months) {
    const key = quarterKeyFromDate(`${month}-01`)
    if (key) keys.add(key)
  }
  return [...keys].sort((a, b) => a.localeCompare(b))
}

function monthKeysInRange(period: CashflowFilterParams['period']): string[] {
  const [fromY, fromM] = period.from.split('-').map(Number)
  const [toY, toM] = period.to.split('-').map(Number)
  if (!fromY || !fromM || !toY || !toM) return []
  const months: string[] = []
  let y = fromY
  let m = fromM
  for (;;) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    if (y === toY && m === toM) break
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return months
}

export function aggregateByMonth(
  dataset: CashflowDataset,
  params: CashflowFilterParams,
): CashflowMonthPoint[] {
  const filtered = filterCashflowRows(dataset.rows, params)
  const prePeriodRows = rowsBeforePeriod(dataset.rows, {
    before: params.period.from,
    legalEntityId: params.legalEntityId,
    activityTypes: params.activityTypes,
    currency: params.currency,
  })
  let running = balanceAtDate(dataset, params, params.period.from, prePeriodRows)

  const byMonth = new Map<string, { inflow: number; outflow: number }>()
  for (const row of filtered) {
    const month = row.date.slice(0, 7)
    const cur = byMonth.get(month) ?? { inflow: 0, outflow: 0 }
    const amount = rowAmount(row, params.currency)
    if (row.direction === 'in') cur.inflow += amount
    else cur.outflow += amount
    byMonth.set(month, cur)
  }

  return monthKeysInRange(params.period).map((month) => {
    const vals = byMonth.get(month) ?? { inflow: 0, outflow: 0 }
    running += vals.inflow - vals.outflow
    return {
      month,
      label: monthChartLabel(month),
      inflow: vals.inflow,
      outflow: vals.outflow,
      balance: running,
    }
  })
}

export function aggregateOutflowByActivity(
  rows: CashflowRow[],
  currency: string,
  period: DateRangeValue,
): OutflowByActivityPoint[] {
  const byQuarter = new Map<string, { od: number; id: number; fd: number }>()
  for (const row of rows) {
    if (row.direction !== 'out') continue
    const qKey = quarterKeyFromDate(row.date)
    if (!qKey) continue
    const cur = byQuarter.get(qKey) ?? { od: 0, id: 0, fd: 0 }
    if (row.activityType === 'od' || row.activityType === 'id' || row.activityType === 'fd') {
      cur[row.activityType] += rowAmount(row, currency)
    }
    byQuarter.set(qKey, cur)
  }

  return quartersInRange(period).map((qKey) => ({
    category: quarterChartLabel(qKey),
    ...(byQuarter.get(qKey) ?? { od: 0, id: 0, fd: 0 }),
  }))
}

export function aggregateTopCounterparties(
  rows: CashflowRow[],
  currency: string,
  counterparties: CounterpartyMeta[],
): TopCounterpartyRow[] {
  const nameById = new Map(counterparties.map((c) => [c.id, c.name]))
  const map = new Map<string, { inflow: number; outflow: number }>()
  for (const row of rows) {
    const amount = rowAmount(row, currency)
    const cur = map.get(row.counterpartyId) ?? { inflow: 0, outflow: 0 }
    if (row.direction === 'in') cur.inflow += amount
    else cur.outflow += amount
    map.set(row.counterpartyId, cur)
  }

  return [...map.entries()]
    .filter(([, vals]) => vals.outflow > 0)
    .map(([id, vals]) => ({
      id,
      counterparty: nameById.get(id) ?? id,
      inflow: vals.inflow,
      outflow: vals.outflow,
    }))
    .sort((a, b) => b.outflow - a.outflow)
}