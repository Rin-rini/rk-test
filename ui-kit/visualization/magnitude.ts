/** Пороги сокращённого отображения сумм (compact UI и масштаб оси графика). */
export const MAGNITUDE_BILLIONS = 1_000_000_000
export const MAGNITUDE_MILLIONS = 1_000_000
export const MAGNITUDE_THOUSANDS = 1_000

export type CurrencyMagnitude = 'billions' | 'millions' | 'thousands' | 'base'

export function currencyMagnitudeFromAbs(absValue: number): CurrencyMagnitude {
  const abs = Math.abs(absValue)
  if (abs >= MAGNITUDE_BILLIONS) return 'billions'
  if (abs >= MAGNITUDE_MILLIONS) return 'millions'
  if (abs >= MAGNITUDE_THOUSANDS) return 'thousands'
  return 'base'
}