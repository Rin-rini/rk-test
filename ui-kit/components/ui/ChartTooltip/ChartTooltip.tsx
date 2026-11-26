import { formatByMetric, joinDisplayClasses, metricDisplayClass } from '@ui-kit/visualization/index.ts'
import type { MetricFormat } from '@ui-kit/visualization/types.ts'
import styles from './ChartTooltip.module.css'

type TooltipPayloadItem = {
  dataKey?: string | number
  name?: string
  value?: number | string
  payload?: unknown
}

export type ChartTooltipRow = {
  key: string
  label: string
  value: number | null
  format?: MetricFormat
}

export type ChartTooltipProps = {
  active?: boolean
  label?: string | number
  payload?: TooltipPayloadItem[]
  rows?: ChartTooltipRow[]
  valueFormat?: MetricFormat
}

export function ChartTooltip({ active, label, payload, rows, valueFormat = 'currency' }: ChartTooltipProps) {
  if (!active) return null

  const items: ChartTooltipRow[] =
    rows ??
    (payload ?? []).map((entry) => {
      const dataKey = entry.dataKey !== undefined ? String(entry.dataKey) : undefined
      return {
        key: dataKey ?? String(entry.name),
        label: String(entry.name ?? dataKey),
        value: typeof entry.value === 'number' ? entry.value : null,
        format: valueFormat,
      }
    })

  if (items.length === 0) return null

  return (
    <div className={styles.root}>
      {label ? <p className={styles.date}>{String(label)}</p> : null}
      <ul className={styles.list}>
        {items.map((row) => {
          const format = row.format ?? valueFormat
          return (
            <li key={row.key} className={styles.row}>
              <span className={styles.label}>{row.label}</span>
              <span className={joinDisplayClasses(styles.value, metricDisplayClass(format))}>
                {formatByMetric(row.value, format)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}