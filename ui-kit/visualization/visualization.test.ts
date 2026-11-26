import { describe, expect, it } from 'vitest'
import {
  formatByMetric,
  formatChartAxisTick,
  formatCurrencyCompact,
  formatPercent,
  EMPTY_VALUE,
  maxAbsInDataRows,
  maxAbsInNumbers,
  metricDisplayClass,
  resolveChartValueScale,
  usesTabularDigits,
} from './index.ts'
import {
  currencyMagnitudeFromAbs,
  MAGNITUDE_BILLIONS,
  MAGNITUDE_MILLIONS,
  MAGNITUDE_THOUSANDS,
} from './magnitude.ts'
import { formatCurrencyKpi } from './formatValue.ts'

describe('currencyMagnitudeFromAbs', () => {
  it('uses shared thresholds', () => {
    expect(currencyMagnitudeFromAbs(MAGNITUDE_BILLIONS)).toBe('billions')
    expect(currencyMagnitudeFromAbs(MAGNITUDE_BILLIONS - 1)).toBe('millions')
    expect(currencyMagnitudeFromAbs(MAGNITUDE_MILLIONS - 1)).toBe('thousands')
    expect(currencyMagnitudeFromAbs(MAGNITUDE_MILLIONS)).toBe('millions')
    expect(currencyMagnitudeFromAbs(MAGNITUDE_THOUSANDS - 1)).toBe('base')
    expect(currencyMagnitudeFromAbs(MAGNITUDE_THOUSANDS)).toBe('thousands')
    expect(currencyMagnitudeFromAbs(-2_500_000)).toBe('millions')
  })
})

describe('resolveChartValueScale', () => {
  it('maps currency magnitude from max abs', () => {
    expect(resolveChartValueScale(2_000_000_000, 'currency')).toBe('billions')
    expect(resolveChartValueScale(2_000_000, 'currency')).toBe('millions')
    expect(resolveChartValueScale(50_000, 'currencyCompact')).toBe('thousands')
    expect(resolveChartValueScale(500, 'currency')).toBe('rubles')
    expect(resolveChartValueScale(1, 'percent')).toBe('percent')
    expect(resolveChartValueScale(1, 'number')).toBe('plain')
  })
})

describe('formatByMetric', () => {
  it('formats null as em dash', () => {
    expect(formatByMetric(null, 'currency')).toBe(EMPTY_VALUE)
  })

  it('formats percent ratio', () => {
    expect(formatPercent(0.083)).toContain('8')
    expect(formatPercent(0.083)).toContain('%')
    expect(formatByMetric(0.083, 'percent')).toBe(formatPercent(0.083))
  })

  it('keeps text strings', () => {
    expect(formatByMetric('Финансы', 'text')).toBe('Финансы')
  })
})

describe('formatCurrencyKpi', () => {
  it('shortens billions and millions with one fraction digit', () => {
    const billions = formatCurrencyKpi(1_371_877_259, 'RUB')
    expect(billions).toMatch(/млрд/)
    expect(billions).toContain('₽')
    expect(formatCurrencyKpi(2_500_000, 'EUR')).toMatch(/млн/)
    expect(formatCurrencyKpi(2_500_000, 'EUR')).toContain('€')
    expect(formatCurrencyKpi(900, 'USD')).toMatch(/\$/)
  })

  it('shows full amount below one million', () => {
    expect(formatCurrencyKpi(850_000, 'RUB')).toMatch(/850/)
    expect(formatCurrencyKpi(850_000, 'RUB')).toMatch(/₽/)
  })
})

describe('formatCurrencyCompact', () => {
  it('aligns compact steps with chart scale thresholds', () => {
    expect(formatCurrencyCompact(2_500_000)).toMatch(/млн/)
    expect(formatCurrencyCompact(12_000)).toMatch(/тыс/)
    expect(formatCurrencyCompact(500)).toMatch(/₽/)
  })
})

describe('formatChartAxisTick', () => {
  it('abbreviates axis values without duplicate axis title', () => {
    expect(formatChartAxisTick(2_500_000_000, 'billions')).toMatch(/млрд/)
    expect(formatChartAxisTick(1_500_000, 'millions')).toMatch(/млн/)
    expect(formatChartAxisTick(42_000, 'thousands')).toMatch(/тыс/)
    expect(formatChartAxisTick(0.083, 'percent')).toContain('%')
  })
})

describe('maxAbsInDataRows', () => {
  it('ignores non-numbers', () => {
    expect(maxAbsInDataRows([{ a: 3, b: 'x' }, { a: -7 }], ['a', 'b'])).toBe(7)
    expect(maxAbsInNumbers([3, -7, Number.NaN])).toBe(7)
  })
})

describe('displayRules', () => {
  it('applies tabular class only to numeric formats', () => {
    expect(usesTabularDigits('currency')).toBe(true)
    expect(usesTabularDigits('text')).toBe(false)
    expect(metricDisplayClass('currency')).toBe('viz-numeric')
    expect(metricDisplayClass('text')).toBeUndefined()
  })
})