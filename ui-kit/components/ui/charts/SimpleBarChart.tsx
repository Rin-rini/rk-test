import { ChartLegend, type ChartLegendSeries } from '@ui-kit/components/ui/ChartLegend/ChartLegend.tsx'
import { ChartTooltip } from '@ui-kit/components/ui/ChartTooltip/ChartTooltip.tsx'
import { chartSeriesColors } from '@ui-kit/tokens/chartColors.ts'
import { maxAbsInDataRows } from '@ui-kit/visualization/chartAxisFormat.ts'
import type { MetricFormat } from '@ui-kit/visualization/types.ts'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  chartCategoryBottomMargin,
  chartCategoryXAxisProps,
  chartGridStroke,
  chartTick,
  chartValueXAxisOptions,
  chartValueYAxisOptions,
} from './chartTheme.tsx'
import type { BarChartOrientation } from './barChartOrientation.ts'
import styles from './charts.module.css'

export type SimpleBarChartProps = {
  orientation?: BarChartOrientation
  data: Record<string, string | number>[]
  categoryKey: string
  valueKey: string
  name?: string
  color?: string
  height?: number
  withTooltip?: boolean
  valueFormat?: MetricFormat
  legend?: boolean
  onLegendToggle?: (seriesId: string) => void
  /** Ширина оси категорий (только `orientation="horizontal"`). */
  categoryAxisWidth?: number
}

export function SimpleBarChart({
  orientation = 'vertical',
  data,
  categoryKey,
  valueKey,
  name,
  color = chartSeriesColors[orientation === 'vertical' ? 0 : 1],
  height = 176,
  withTooltip = true,
  valueFormat = 'number',
  legend = false,
  onLegendToggle,
  categoryAxisWidth = 96,
}: SimpleBarChartProps) {
  const isHorizontal = orientation === 'horizontal'
  const seriesName = name ?? valueKey
  const legendItems: ChartLegendSeries[] =
    legend && !isHorizontal ? [{ id: valueKey, label: seriesName, color }] : []

  const valueMax = maxAbsInDataRows(data, [valueKey])
  const valueAxisY = chartValueYAxisOptions(valueFormat, valueMax)
  const valueAxisX = chartValueXAxisOptions(valueFormat, valueMax)
  const categoryX = chartCategoryXAxisProps(data.length, false)
  const chartBottomMargin = chartCategoryBottomMargin(data.length, false)

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isHorizontal ? 'vertical' : undefined}
        margin={
          isHorizontal
            ? { left: 12, right: 16, bottom: 0 }
            : { top: 4, right: 8, left: 0, bottom: chartBottomMargin }
        }
      >
        <CartesianGrid stroke={chartGridStroke} vertical={!isHorizontal} horizontal={isHorizontal} />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={valueAxisX.tick} height={valueAxisX.height} />
            <YAxis type="category" dataKey={categoryKey} tick={chartTick} width={categoryAxisWidth} />
          </>
        ) : (
          <>
            <XAxis dataKey={categoryKey} {...categoryX} />
            <YAxis tick={valueAxisY.tick} width={valueAxisY.width} />
          </>
        )}
        {withTooltip ? <Tooltip content={<ChartTooltip valueFormat={valueFormat} />} cursor={false} /> : null}
        <Bar
          dataKey={valueKey}
          name={seriesName}
          fill={color}
          radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )

  if (isHorizontal) {
    return <div className={styles.chartRoot}>{chart}</div>
  }

  return (
    <div className={styles.lineChartStack}>
      <div className={styles.chartRoot}>{chart}</div>
      {legend ? (
        <div className={[styles.legendScroller, 'kit-scrollbar'].join(' ')} role="region" aria-label="Легенда графика">
          <ChartLegend series={legendItems} onToggle={onLegendToggle} />
        </div>
      ) : null}
    </div>
  )
}

export type VerticalBarChartProps = Omit<SimpleBarChartProps, 'orientation'>

export function VerticalBarChart(props: VerticalBarChartProps) {
  return <SimpleBarChart {...props} orientation="vertical" />
}

export type HorizontalBarChartProps = Omit<SimpleBarChartProps, 'orientation' | 'legend' | 'onLegendToggle'>

export function HorizontalBarChart(props: HorizontalBarChartProps) {
  return <SimpleBarChart {...props} orientation="horizontal" legend={false} />
}