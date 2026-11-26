import {
  formatByMetric,
  formatCurrencyKpi,
  formatPercent,
  joinDisplayClasses,
  metricDisplayClass,
} from '@ui-kit/visualization/index.ts'
import type { CurrencyCode, MetricFormat } from '@ui-kit/visualization/types.ts'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '@ui-kit/components/ui/Button/Button.tsx'
import { Skeleton } from '@ui-kit/components/ui/Skeleton/Skeleton.tsx'
import { AsyncDataView } from '../feedback/AsyncDataView.tsx'
import type { DataStatus } from '../feedback/types.ts'
import styles from './KPICard.module.css'

export type KpiTrend = 'up' | 'down' | 'flat'
export type KpiUnit = Extract<MetricFormat, 'currency' | 'percent' | 'number'>
/** Подсветка значения в паре «план / факт» (как на графиках). */
export type KpiValueTone = 'default' | 'plan' | 'fact'
/**
 * Смысл направления стрелки для цвета:
 * `up-is-good` — рост зелёный, падение красный (по умолчанию);
 * `up-is-bad` — рост красный, падение зелёный (перерасход, отклонение от плана).
 */
export type KpiTrendSemantics = 'up-is-good' | 'up-is-bad'

export type KPICardProps = {
  title: string
  value: number | null
  delta?: number | null
  deltaPercent?: number | null
  trend?: KpiTrend
  /** Цвет стрелки и дельты при `trend`; по умолчанию `up-is-good`. */
  trendSemantics?: KpiTrendSemantics
  unit?: KpiUnit
  /** ISO валюта при `unit="currency"`; по умолчанию `RUB`. */
  currency?: CurrencyCode
  valueTone?: KpiValueTone
  status?: DataStatus
  onRetry?: () => void
}

function TrendIcon({ trend }: { trend: KpiTrend }) {
  if (trend === 'up') return <TrendingUp size={16} aria-hidden />
  if (trend === 'down') return <TrendingDown size={16} aria-hidden />
  return <Minus size={16} aria-hidden />
}

function positiveClass(semantics: KpiTrendSemantics): string {
  return semantics === 'up-is-good' ? styles.trendUp : styles.trendDown
}

function negativeClass(semantics: KpiTrendSemantics): string {
  return semantics === 'up-is-good' ? styles.trendDown : styles.trendUp
}

function trendIconClass(trend: KpiTrend, semantics: KpiTrendSemantics): string {
  if (trend === 'up') return positiveClass(semantics)
  if (trend === 'down') return negativeClass(semantics)
  return styles.trendNeutral
}

function deltaTone(
  trend: KpiTrend | undefined,
  delta: number | null | undefined,
  semantics: KpiTrendSemantics,
): string {
  if (trend === 'up') return positiveClass(semantics)
  if (trend === 'down') return negativeClass(semantics)
  if (delta === null || delta === undefined) return styles.deltaNeutral
  if (delta > 0) return positiveClass(semantics)
  if (delta < 0) return negativeClass(semantics)
  return styles.deltaNeutral
}

export function KPICard({
  title,
  value,
  delta = null,
  deltaPercent = null,
  trend = 'flat',
  trendSemantics = 'up-is-good',
  unit = 'currency',
  currency = 'RUB',
  valueTone = 'default',
  status = 'ready',
  onRetry,
}: KPICardProps) {
  const showDelta = delta !== null || deltaPercent !== null
  const numericClass = metricDisplayClass(unit)

  function formatKpiValue(amount: number | null): string {
    if (unit === 'currency') return formatCurrencyKpi(amount, currency)
    return formatByMetric(amount, unit)
  }
  const valueToneClass =
    valueTone === 'plan' ? styles.valuePlan : valueTone === 'fact' ? styles.valueFact : ''

  const showTrend = status === 'ready'

  return (
    <article
      className={[
        styles.card,
        valueTone === 'plan' ? styles.cardPlan : valueTone === 'fact' ? styles.cardFact : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {showTrend ? (
          <span className={[styles.trend, trendIconClass(trend, trendSemantics)].join(' ')} aria-hidden>
            <TrendIcon trend={trend} />
          </span>
        ) : null}
      </header>
      <AsyncDataView
        status={status}
        onRetry={onRetry}
        loading={
          <div className={styles.skeleton}>
            <Skeleton className={styles.skelValue} />
            <Skeleton className={styles.skelDelta} />
          </div>
        }
        empty={
          <p className={styles.stateMessage} role="status">
            Нет данных за выбранный период
          </p>
        }
        error={
          <div className={styles.stateError} role="alert">
            <p className={styles.stateMessage}>Не удалось загрузить данные</p>
            {onRetry ? (
              <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
                Повторить
              </Button>
            ) : null}
          </div>
        }
      >
        <p className={joinDisplayClasses(styles.value, numericClass, valueToneClass)}>
          {formatKpiValue(value)}
        </p>
        {showDelta ? (
          <p className={[styles.delta, deltaTone(trend, delta, trendSemantics)].join(' ')}>
            {delta !== null ? (
              <span className={joinDisplayClasses(styles.deltaPart, numericClass)}>
                {formatKpiValue(delta)}
              </span>
            ) : null}
            {deltaPercent !== null ? (
              <span className={joinDisplayClasses(styles.deltaPart, metricDisplayClass('percent'))}>
                {formatPercent(deltaPercent)}
              </span>
            ) : null}
          </p>
        ) : null}
      </AsyncDataView>
    </article>
  )
}