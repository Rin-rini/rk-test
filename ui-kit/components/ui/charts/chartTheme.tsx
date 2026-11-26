import {
  formatChartAxisTick,
  resolveChartValueScale,
  type ChartValueScale,
} from '@ui-kit/visualization/chartAxisFormat.ts'
import { metricDisplayClass } from '@ui-kit/visualization/index.ts'
import type { MetricFormat } from '@ui-kit/visualization/types.ts'
import { chartXAxisInterval } from './chartXDrill.tsx'
import type { XAxisProps, XAxisTickContentProps, YAxisTickContentProps } from 'recharts'

export const chartTick = { fill: 'var(--text-muted)', fontSize: 11 }

export const chartGridStroke = 'var(--border-muted)'

function axisTickCoords(x: string | number | undefined, y: string | number | undefined) {
  if (x === undefined || y === undefined) return null
  const tickX = typeof x === 'number' ? x : Number(x)
  const tickY = typeof y === 'number' ? y : Number(y)
  if (!Number.isFinite(tickX) || !Number.isFinite(tickY)) return null
  return { tickX, tickY }
}

export function chartValueYAxisTick(format: MetricFormat, scale: ChartValueScale) {
  const numericClass = metricDisplayClass(format)

  return function ChartValueYAxisTick({ x, y, payload, textAnchor }: YAxisTickContentProps) {
    if (payload === undefined) return null
    const coords = axisTickCoords(x, y)
    if (!coords) return null

    return (
      <text
        x={coords.tickX}
        y={coords.tickY}
        dy={4}
        textAnchor={textAnchor}
        fill="var(--text-muted)"
        fontSize={12}
        className={numericClass}
      >
        {formatChartAxisTick(payload.value, scale)}
      </text>
    )
  }
}

export function chartValueXAxisTick(format: MetricFormat, scale: ChartValueScale) {
  const numericClass = metricDisplayClass(format)

  return function ChartValueXAxisTick({ x, y, payload }: XAxisTickContentProps) {
    if (payload === undefined) return null
    const coords = axisTickCoords(x, y)
    if (!coords) return null

    return (
      <text
        x={coords.tickX}
        y={coords.tickY}
        dy={16}
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize={12}
        className={numericClass}
      >
        {formatChartAxisTick(payload.value, scale)}
      </text>
    )
  }
}

export type ChartValueYAxisOptions = {
  tick: ReturnType<typeof chartValueYAxisTick>
  width: number
  label?: {
    value: string
    angle: number
    position: 'insideLeft'
    dx: number
    fill: string
    fontSize: number
  }
}

export type ChartValueXAxisOptions = {
  tick: ReturnType<typeof chartValueXAxisTick>
  height: number
  label?: {
    value: string
    position: 'insideBottom'
    offset: number
    fill: string
    fontSize: number
  }
}

export function chartValueYAxisOptions(format: MetricFormat, maxAbsValue: number): ChartValueYAxisOptions {
  const scale = resolveChartValueScale(maxAbsValue, format)

  const width =
    scale === 'billions'
      ? 60
      : scale === 'millions' || scale === 'thousands'
        ? 56
        : scale === 'rubles'
          ? 52
          : 40

  return {
    tick: chartValueYAxisTick(format, scale),
    width,
    label: undefined,
  }
}

export function chartValueXAxisOptions(format: MetricFormat, maxAbsValue: number): ChartValueXAxisOptions {
  const scale = resolveChartValueScale(maxAbsValue, format)

  return {
    tick: chartValueXAxisTick(format, scale),
    height: 28,
    label: undefined,
  }
}

/** Подписи категорий (месяцы и т.д.) для line/combo — только горизонтально. */
export function chartCategoryXAxisProps(pointCount: number, isDrilled: boolean): Pick<
  XAxisProps,
  'tick' | 'interval' | 'angle' | 'textAnchor' | 'height'
> {
  const dense = !isDrilled && pointCount > 8
  return {
    tick: { ...chartTick, fontSize: dense ? 10 : 11 },
    interval: chartXAxisInterval(pointCount, isDrilled),
    angle: 0,
    textAnchor: 'middle',
    height: dense ? 30 : 28,
  }
}

/** Нижний отступ ComposedChart снизу; подписи X уже учитываются в `height` оси X. */
export function chartCategoryBottomMargin(_pointCount: number, isDrilled: boolean): number {
  return isDrilled ? 4 : 0
}