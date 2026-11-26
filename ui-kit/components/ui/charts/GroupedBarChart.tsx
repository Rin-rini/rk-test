import { ChartLegend } from '@ui-kit/components/ui/ChartLegend/ChartLegend.tsx'
import { ChartTooltip } from '@ui-kit/components/ui/ChartTooltip/ChartTooltip.tsx'
import { chartSeriesColors } from '@ui-kit/tokens/chartColors.ts'
import { maxAbsInDataRows } from '@ui-kit/visualization/chartAxisFormat.ts'
import type { MetricFormat } from '@ui-kit/visualization/types.ts'
import { useMemo } from 'react'
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
import { useChartLegendState } from './useChartLegendState.ts'
import styles from './charts.module.css'

export type GroupedBarSeries = {
  key: string
  name: string
  color?: string
}

export type GroupedBarChartProps = {
  orientation?: BarChartOrientation
  data: Record<string, string | number>[]
  categoryKey: string
  series: GroupedBarSeries[]
  height?: number
  withTooltip?: boolean
  valueFormat?: MetricFormat
  categoryAxisWidth?: number
  legend?: boolean
  onLegendToggle?: (seriesId: string) => void
}

export function GroupedBarChart({
  orientation = 'horizontal',
  data,
  categoryKey,
  series,
  height = 176,
  withTooltip = true,
  valueFormat = 'currencyCompact',
  categoryAxisWidth = 128,
  legend = true,
  onLegendToggle,
}: GroupedBarChartProps) {
  const isHorizontal = orientation === 'horizontal'

  const legendSources = useMemo(
    () =>
      series.map((s, i) => ({
        id: s.key,
        label: s.name,
        color: s.color ?? chartSeriesColors[i % chartSeriesColors.length],
      })),
    [series],
  )
  const { legendItems, handleLegendToggle, hiddenIds } = useChartLegendState(legendSources, {
    enabled: legend,
    onLegendToggle,
  })

  const valueKeys = series.map((s) => s.key)
  const valueMax = maxAbsInDataRows(data, valueKeys)
  const valueAxisY = chartValueYAxisOptions(valueFormat, valueMax)
  const valueAxisX = chartValueXAxisOptions(valueFormat, valueMax)
  const categoryX = chartCategoryXAxisProps(data.length, false)
  const chartBottomMargin = chartCategoryBottomMargin(data.length, false)

  return (
    <div className={styles.lineChartStack}>
      <div className={styles.chartRoot}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout={isHorizontal ? 'vertical' : undefined}
            margin={
              isHorizontal
                ? { left: 4, right: 16, bottom: 0 }
                : { top: 4, right: 8, left: 0, bottom: chartBottomMargin }
            }
            barCategoryGap={isHorizontal ? '18%' : '20%'}
            barGap={isHorizontal ? 6 : 4}
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
            {series.map((s, i) => {
              if (hiddenIds.has(s.key)) return null
              const fill = s.color ?? chartSeriesColors[i % chartSeriesColors.length]
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  fill={fill}
                  radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                  maxBarSize={isHorizontal ? 22 : 32}
                  isAnimationActive={false}
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {legend ? (
        <div className={[styles.legendScroller, 'kit-scrollbar'].join(' ')} role="region" aria-label="Легенда графика">
          <ChartLegend series={legendItems} onToggle={handleLegendToggle} />
        </div>
      ) : null}
    </div>
  )
}

export type HorizontalGroupedBarChartProps = Omit<GroupedBarChartProps, 'orientation'>
export type VerticalGroupedBarChartProps = Omit<GroupedBarChartProps, 'orientation'>

export function HorizontalGroupedBarChart(props: HorizontalGroupedBarChartProps) {
  return <GroupedBarChart {...props} orientation="horizontal" />
}

export function VerticalGroupedBarChart(props: VerticalGroupedBarChartProps) {
  return <GroupedBarChart {...props} orientation="vertical" />
}