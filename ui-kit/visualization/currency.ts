import type { CurrencyCode } from './types.ts'

const currencyFullCache = new Map<CurrencyCode, Intl.NumberFormat>()

export function getCurrencyFullFormatter(currency: CurrencyCode): Intl.NumberFormat {
  let fmt = currencyFullCache.get(currency)
  if (!fmt) {
    fmt = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    currencyFullCache.set(currency, fmt)
  }
  return fmt
}

/** Краткое обозначение валюты */
export function currencySymbol(currency: CurrencyCode): string {
  switch (currency) {
    case 'RUB':
      return '₽'
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
  }
}