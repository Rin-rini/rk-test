import { ChartLegend } from '@ui-kit/components/ui/ChartLegend/ChartLegend.tsx'
import { ChartTooltip } from '@ui-kit/components/ui/ChartTooltip/ChartTooltip.tsx'
import { chartFactVar, chartPlanVar } from '@ui-kit/tokens/chartColors.ts'
import type { MetricFormat } from '@ui-kit/visualization/types.ts'
import { useMemo } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { maxAbsInDataRows } from '@ui-kit/visualization/chartAxisFormat.ts'
import {
  ChartDrillNav,
  useChartXDrill,
  type ChartXDrillConfig,
} from './chartXDrill.tsx'
import {
  chartCategoryBottomMargin,
  chartCategoryXAxisProps,
  chartGridStroke,
  chartValueYAxisOptions,
} from './chartTheme.tsx'
import { useChartLegendState } from './useChartLegendState.ts'
import styles from './charts.module.css'

export type ComboBarLineSeries = {
  key: string
  name: string
  color?: string
}

export type ComboBarLineChartProps = {
  data: Record<string, string | number>[]
  xKey: string
  bar: ComboBarLineSeries
  line: ComboBarLineSeries
  height?: number
  withTooltip?: boolean
  valueFormat?: MetricFormat
  drilldown?: ChartXDrillConfig
  legend?: boolean
  onLegendToggle?: (seriesId: string) => void
}

export function ComboBarLineChart({
  data,
  xKey,
  bar,
  line,
  height = 180,
  withTooltip = true,
  valueFormat = 'currencyCompact',
  drilldown,
  legend = true,
  onLegendToggle,
}: ComboBarLineChartProps) {
  const barColor = bar.color ?? chartFactVar
  const lineColor = line.color ?? chartPlanVar

  const legendSources = useMemo(
    () => [
      { id: bar.key, label: bar.name, color: barColor },
      { id: line.key, label: line.name, color: lineColor },
    ],
    [bar.key, bar.name, barColor, line.key, line.name, lineColor],
  )
  const { legendItems, handleLegendToggle, isHidden } = useChartLegendState(legendSources, {
    enabled: legend,
    onLegendToggle,
  })

  const barHidden = isHidden(bar.key)
  const lineHidden = isHidden(line.key)

  const { displayData, tryDrill, drillBack, isDrilled, canDrill, parentLabel } = useChartXDrill(
    data,
    xKey,
    drilldown,
  )

  const valueAxis = chartValueYAxisOptions(
    valueFormat,
    maxAbsInDataRows(displayData, [bar.key, line.key]),
  )

  const xAxis = chartCategoryXAxisProps(displayData.length, isDrilled)
  const chartBottomMargin = chartCategoryBottomMargin(displayData.length, isDrilled)

  const handleBarClick = (barRow: unknown) => {
    const row = barRow as { payload?: Record<string, string | number> } | undefined
    tryDrill(row?.payload)
  }

  return (
    <div className={styles.lineChartStack}>
      <ChartDrillNav
        drilldown={drilldown}
        isDrilled={isDrilled}
        parentLabel={parentLabel}
        onBack={drillBack}
      />
      <div className={styles.chartRoot}>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={displayData}
            margin={{ top: 4, right: 8, left: 0, bottom: chartBottomMargin }}
          >
            <CartesianGrid stroke={chartGridStroke} vertical={false} />
            <XAxis dataKey={xKey} {...xAxis} />
            <YAxis tick={valueAxis.tick} width={valueAxis.width} />
            {withTooltip ? <Tooltip content={<ChartTooltip valueFormat={valueFormat} />} cursor={false} /> : null}
            {!barHidden ? (
              <Bar
                dataKey={bar.key}
                name={bar.name}
                fill={barColor}
                radius={[4, 4, 0, 0]}
                maxBarSize={canDrill ? 28 : 36}
                isAnimationActive={false}
                cursor={canDrill ? 'pointer' : undefined}
                onClick={canDrill ? (row) => handleBarClick(row) : undefined}
              />
            ) : null}
            {!lineHidden ? (
              <Line
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={lineColor}
                strokeWidth={2}
                dot={
                  canDrill
                    ? (props) => {
                        const { cx, cy, payload } = props
                        if (cx === undefined || cy === undefined) return null
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={lineColor}
                            stroke="none"
                            style={{ cursor: 'pointer' }}
                            onClick={(event) => {
                              event.stopPropagation()
                              tryDrill(payload as Record<string, string | number>)
                            }}
                          />
                        )
                      }
                    : { r: 3, fill: lineColor, strokeWidth: 0 }
                }
                activeDot={canDrill ? { r: 6, cursor: 'pointer' } : { r: 4 }}
                isAnimationActive={false}
              />
            ) : null}
          </ComposedChart>
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