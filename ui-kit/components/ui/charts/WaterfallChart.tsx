import { ChartTooltip } from '@ui-kit/components/ui/ChartTooltip/ChartTooltip.tsx'
import { chartSeriesColors } from '@ui-kit/tokens/chartColors.ts'
import { formatByMetric } from '@ui-kit/visualization/index.ts'
import type { MetricFormat } from '@ui-kit/visualization/types.ts'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { LabelProps, RectangleProps } from 'recharts'
import { maxAbsInNumbers } from '@ui-kit/visualization/chartAxisFormat.ts'
import { chartGridStroke, chartTick, chartValueYAxisOptions } from './chartTheme.tsx'
import styles from './charts.module.css'

export type WaterfallStepKind = 'start' | 'delta' | 'total'

export type WaterfallChartStep = {
  label: string
  value: number
  kind: WaterfallStepKind
}

export type WaterfallChartProps = {
  steps: WaterfallChartStep[]
  height?: number
  withTooltip?: boolean
  valueFormat?: MetricFormat
}

type WaterfallBarRow = {
  label: string
  offset: number
  barHeight: number
  tooltipValue: number
  kind: WaterfallStepKind
  fill: string
}

const waterfallAnchorFill = chartSeriesColors[0]

const waterfallFill = {
  start: waterfallAnchorFill,
  total: waterfallAnchorFill,
  increase: 'var(--status-success)',
  decrease: 'var(--status-critical)',
} as const

/** Маскирует «ногу» плавающих дельт — совпадает с фоном карточки графика. */
const waterfallUnderlayFill = 'var(--bg-card)'

const valueBarRadius = 4

type WaterfallShapeProps = Partial<RectangleProps> & { payload?: WaterfallBarRow }

function WaterfallUnderlayShape({ x = 0, y = 0, width = 0, height = 0 }: WaterfallShapeProps) {
  if (height <= 0) return null
  return <Rectangle x={x} y={y} width={width} height={height} fill={waterfallUnderlayFill} radius={0} />
}

function WaterfallValueShape({ x = 0, y = 0, width = 0, height = 0, payload }: WaterfallShapeProps) {
  if (!payload || height <= 0) return null
  return (
    <Rectangle x={x} y={y} width={width} height={height} radius={valueBarRadius} fill={payload.fill} />
  )
}

function formatDeltaLabel(value: number, format: MetricFormat): string {
  const formatted = formatByMetric(value, format)
  return value > 0 ? `+${formatted}` : formatted
}

function tooltipLabelForKind(kind: WaterfallStepKind): string {
  switch (kind) {
    case 'start':
      return 'Начальное значение'
    case 'total':
      return 'Итого'
    default:
      return 'Изменение'
  }
}

function buildWaterfallRows(steps: WaterfallChartStep[]): WaterfallBarRow[] {
  let running = 0

  return steps.map((step) => {
    switch (step.kind) {
      case 'start': {
        running = step.value
        return {
          label: step.label,
          offset: 0,
          barHeight: step.value,
          tooltipValue: step.value,
          kind: step.kind,
          fill: waterfallFill.start,
        }
      }
      case 'delta': {
        const offset = step.value >= 0 ? running : running + step.value
        const barHeight = Math.abs(step.value)
        running += step.value
        return {
          label: step.label,
          offset,
          barHeight,
          tooltipValue: step.value,
          kind: step.kind,
          fill: step.value >= 0 ? waterfallFill.increase : waterfallFill.decrease,
        }
      }
      case 'total': {
        return {
          label: step.label,
          offset: 0,
          barHeight: step.value,
          tooltipValue: step.value,
          kind: step.kind,
          fill: waterfallFill.total,
        }
      }
    }
  })
}

function WaterfallDeltaLabel({
  x,
  y,
  width,
  index,
  rows,
  valueFormat,
}: LabelProps & { rows: WaterfallBarRow[]; valueFormat: MetricFormat }) {
  if (index === undefined || x === undefined || y === undefined || width === undefined) return null
  const row = rows[index]
  if (!row || row.kind !== 'delta') return null

  const boxX = Number(x)
  const boxY = Number(y)
  const boxW = Number(width)
  if (!Number.isFinite(boxX) || !Number.isFinite(boxY) || !Number.isFinite(boxW)) return null

  const fill = row.tooltipValue >= 0 ? waterfallFill.increase : waterfallFill.decrease
  const text = formatDeltaLabel(row.tooltipValue, valueFormat)

  return (
    <text
      x={boxX + boxW / 2}
      y={boxY - 6}
      textAnchor="middle"
      fill={fill}
      fontSize={11}
      className="viz-numeric"
    >
      {text}
    </text>
  )
}

export function WaterfallChart({
  steps,
  height = 176,
  withTooltip = true,
  valueFormat = 'currencyCompact',
}: WaterfallChartProps) {
  const data = buildWaterfallRows(steps)
  const valueAxis = chartValueYAxisOptions(
    valueFormat,
    maxAbsInNumbers(steps.map((step) => step.value)),
  )

  if (data.length === 0) {
    return <div className={styles.chartRoot} style={{ height }} />
  }

  return (
    <div className={styles.chartRoot}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartGridStroke} vertical={false} />
          <XAxis dataKey="label" tick={chartTick} interval={0} />
          <YAxis tick={valueAxis.tick} width={valueAxis.width} />
          {withTooltip ? (
            <Tooltip
              cursor={false}
              content={({ active, label, payload }) => {
                const row = payload?.[0]?.payload as WaterfallBarRow | undefined
                if (!row) {
                  return <ChartTooltip active={active} label={label} rows={[]} valueFormat={valueFormat} />
                }
                return (
                  <ChartTooltip
                    active={active}
                    label={label}
                    rows={[
                      {
                        key: row.label,
                        label: tooltipLabelForKind(row.kind),
                        value: row.tooltipValue,
                        format: valueFormat,
                      },
                    ]}
                    valueFormat={valueFormat}
                  />
                )
              }}
            />
          ) : null}
          <Bar
            dataKey="offset"
            stackId="waterfall"
            shape={WaterfallUnderlayShape}
            isAnimationActive={false}
            legendType="none"
          />
          <Bar
            dataKey="barHeight"
            stackId="waterfall"
            shape={WaterfallValueShape}
            isAnimationActive={false}
            legendType="none"
          >
            <LabelList
              content={(props) => (
                <WaterfallDeltaLabel {...props} rows={data} valueFormat={valueFormat} />
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}