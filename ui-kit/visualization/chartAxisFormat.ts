import { currencyMagnitudeFromAbs, MAGNITUDE_BILLIONS, MAGNITUDE_MILLIONS, MAGNITUDE_THOUSANDS } from './magnitude.ts'
import type { MetricFormat } from './types.ts'

export type ChartValueScale = 'billions' | 'millions' | 'thousands' | 'rubles' | 'percent' | 'plain'

const tickNumber = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const tickBillions = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const tickMillions = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const tickThousands = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const tickInteger = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const tickPercent = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

/** Максимум |value| по указанным ключам в строках данных. */
export function maxAbsInDataRows(data: Record<string, string | number>[], keys: string[]): number {
  let max = 0
  for (const row of data) {
    for (const key of keys) {
      const raw = row[key]
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        max = Math.max(max, Math.abs(raw))
      }
    }
  }
  return max
}

export function maxAbsInNumbers(values: number[]): number {
  let max = 0
  for (const value of values) {
    if (Number.isFinite(value)) max = Math.max(max, Math.abs(value))
  }
  return max
}

export function resolveChartValueScale(maxAbsValue: number, format: MetricFormat): ChartValueScale {
  if (format === 'percent') return 'percent'
  if (format === 'number') return 'plain'
  if (format === 'currency' || format === 'currencyCompact') {
    const magnitude = currencyMagnitudeFromAbs(maxAbsValue)
    if (magnitude === 'billions') return 'billions'
    if (magnitude === 'millions') return 'millions'
    if (magnitude === 'thousands') return 'thousands'
    return 'rubles'
  }
  return 'plain'
}

/** Значение тика с размерностью рядом с числом (без отдельной подписи оси). */
export function formatChartAxisTick(value: number, scale: ChartValueScale): string {
  switch (scale) {
    case 'billions':
      return `${tickBillions.format(value / MAGNITUDE_BILLIONS)} млрд`
    case 'millions':
      return `${tickMillions.format(value / MAGNITUDE_MILLIONS)} млн`
    case 'thousands':
      return `${tickThousands.format(value / MAGNITUDE_THOUSANDS)} тыс`
    case 'rubles':
      return `${tickInteger.format(value)} ₽`
    case 'percent':
      return `${tickPercent.format(value * 100)}%`
    case 'plain':
      return tickNumber.format(value)
  }
}