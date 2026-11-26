export type ActivityType = 'od' | 'id' | 'fd'

export type CashflowDirection = 'in' | 'out'

export type CashflowRow = {
  date: string
  legalEntityId: string
  activityType: ActivityType
  direction: CashflowDirection
  counterpartyId: string
  amounts: Record<string, number>
}

export type LegalEntityOption = {
  value: string
  label: string
}

export type CounterpartyMeta = {
  id: string
  name: string
}

export type OpeningBalanceRecord = {
  legalEntityId: string
  asOf: string
  amounts: Record<string, number>
}

export type ActivityTypeOption = {
  value: ActivityType
  label: string
}

export type CashflowDataset = {
  meta: {
    generatedAt: string
    currencies: string[]
    activityTypes: ActivityTypeOption[]
    dateRange: { from: string; to: string }
    rowCount: number
  }
  legalEntities: LegalEntityOption[]
  counterparties: CounterpartyMeta[]
  openingBalances: OpeningBalanceRecord[]
  rows: CashflowRow[]
}

export type CashflowKpi = {
  inflow: number
  outflow: number
  net: number
  openingAtPeriodStart: number
  yoyNetPercent: number | null
}

export type CashflowMonthPoint = {
  month: string
  label: string
  inflow: number
  outflow: number
  balance: number
}

export type TopCounterpartyRow = {
  id: string
  counterparty: string
  inflow: number
  outflow: number
}

export type OutflowByActivityPoint = {
  category: string
  od: number
  id: number
  fd: number
}