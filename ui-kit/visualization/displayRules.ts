import type { MetricFormat } from './types.ts'

/** Класс из `visualization.css` для tabular-nums. */
export const METRIC_NUMERIC_CLASS = 'viz-numeric'

const TABULAR_FORMATS = new Set<MetricFormat>(['number', 'currency', 'currencyCompact', 'percent'])

/** Нужны ли табличные цифры (KPI, ячейки, тултипы). */
export function usesTabularDigits(format: MetricFormat): boolean {
  return TABULAR_FORMATS.has(format)
}

export function metricDisplayClass(format: MetricFormat | undefined): string | undefined {
  if (!format || !usesTabularDigits(format)) return undefined
  return METRIC_NUMERIC_CLASS
}

/** Собирает className для ячейки/числа без дублирования условий в компонентах. */
export function joinDisplayClasses(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(' ')
}