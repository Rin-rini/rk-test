/** Форматы значений в UI kit (таблицы, KPI, тултипы). */
export type MetricFormat = 'text' | 'number' | 'currency' | 'currencyCompact' | 'percent'

/** Синоним для колонок DataTable. */
export type CellFormat = MetricFormat

/** ISO-код валюты для сумм (KPI, таблицы, тултипы). */
export type CurrencyCode = 'RUB' | 'USD' | 'EUR'

export type FormatByMetricOptions = {
  currency?: CurrencyCode
}