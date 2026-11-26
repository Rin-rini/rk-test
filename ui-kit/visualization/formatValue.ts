import { currencySymbol, getCurrencyFullFormatter } from './currency.ts'
import {
  currencyMagnitudeFromAbs,
  MAGNITUDE_BILLIONS,
  MAGNITUDE_MILLIONS,
  MAGNITUDE_THOUSANDS,
} from './magnitude.ts'
import type { CurrencyCode, FormatByMetricOptions, MetricFormat } from './types.ts'

export const EMPTY_VALUE = '—'

const percent = new Intl.NumberFormat('ru-RU', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const decimal = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

/** Одна значащая цифра после запятой — KPI и крупные суммы. */
const compactOneFraction = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})

const thousandsWhole = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

/** Полная сумма без копеек; `null` → «—». */
export function formatCurrency(value: number | null, currency: CurrencyCode = 'RUB'): string {
  if (value === null) return EMPTY_VALUE
  return getCurrencyFullFormatter(currency).format(value)
}

function formatCurrencyWithMagnitudeSuffix(
  value: number,
  magnitude: Exclude<ReturnType<typeof currencyMagnitudeFromAbs>, 'base'>,
  currency: CurrencyCode,
  fraction: Intl.NumberFormat,
): string {
  const sym = currencySymbol(currency)
  if (magnitude === 'billions') {
    return `${fraction.format(value / MAGNITUDE_BILLIONS)} млрд ${sym}`
  }
  if (magnitude === 'millions') {
    return `${fraction.format(value / MAGNITUDE_MILLIONS)} млн ${sym}`
  }
  return `${thousandsWhole.format(value / MAGNITUDE_THOUSANDS)} тыс. ${sym}`
}

/**
 * KPI: ≥ млрд / ≥ млн с одной цифрой после запятой, иначе полная сумма.
 * `1 371 877 259 ₽` → «1,4 млрд ₽» (округление по ru-RU).
 */
export function formatCurrencyKpi(value: number | null, currency: CurrencyCode = 'RUB'): string {
  if (value === null) return EMPTY_VALUE
  const magnitude = currencyMagnitudeFromAbs(value)
  if (magnitude === 'billions' || magnitude === 'millions') {
    return formatCurrencyWithMagnitudeSuffix(value, magnitude, currency, compactOneFraction)
  }
  return formatCurrency(value, currency)
}

/**
 * Сокращённая валюта для подписей осей и узких колонок.
 * ≥ млрд → «X,X млрд ₽», ≥ млн → «X,X млн ₽», ≥ тыс. → «X тыс. ₽», иначе полная сумма.
 */
export function formatCurrencyCompact(value: number | null, currency: CurrencyCode = 'RUB'): string {
  if (value === null) return EMPTY_VALUE
  const magnitude = currencyMagnitudeFromAbs(value)
  if (magnitude === 'billions' || magnitude === 'millions') {
    return formatCurrencyWithMagnitudeSuffix(value, magnitude, currency, compactOneFraction)
  }
  if (magnitude === 'thousands') {
    return formatCurrencyWithMagnitudeSuffix(value, 'thousands', currency, thousandsWhole)
  }
  return formatCurrency(value, currency)
}

/** Доля 0…1 (не п.п.): `0.083` → «8,3 %». */
export function formatPercent(ratio: number | null): string {
  if (ratio === null) return EMPTY_VALUE
  return percent.format(ratio)
}

export function formatNumber(value: number | null): string {
  if (value === null) return EMPTY_VALUE
  return decimal.format(value)
}

/** Единая точка форматирования по типу метрики. */
export function formatByMetric(
  value: string | number | null,
  format: MetricFormat = 'text',
  options: FormatByMetricOptions = {},
): string {
  const currency = options.currency ?? 'RUB'
  if (value === null) return EMPTY_VALUE
  if (format === 'text') {
    return typeof value === 'string' ? value : formatNumber(value)
  }
  if (typeof value !== 'number') return String(value)
  switch (format) {
    case 'currency':
      return formatCurrency(value, currency)
    case 'currencyCompact':
      return formatCurrencyCompact(value, currency)
    case 'percent':
      return formatPercent(value)
    case 'number':
      return formatNumber(value)
    default:
      return String(value)
  }
}