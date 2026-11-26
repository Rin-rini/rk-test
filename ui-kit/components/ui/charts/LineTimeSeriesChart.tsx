import { chartSeriesColors } from '@ui-kit/tokens/chartColors.ts'
import { ChartLegend } from '@ui-kit/components/ui/ChartLegend/ChartLegend.tsx'
import { ChartTooltip } from '@ui-kit/components/ui/ChartTooltip/ChartTooltip.tsx'
import { maxAbsInDataRows } from '@ui-kit/visualization/chartAxisFormat.ts'
import type { MetricFormat } from '@ui-kit/visualization/types.ts'
import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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

export type LineSeriesConfig = {
  key: string
  name: string
  color?: string
}

export type LineTimeSeriesChartProps = {
  data: Record<string, string | number>[]
  xKey: string
  series: LineSeriesConfig[]
  height?: number
  withTooltip?: boolean
  valueFormat?: MetricFormat
  drilldown?: ChartXDrillConfig
  legend?: boolean
  onLegendToggle?: (seriesId: string) => void
}

export function LineTimeSeriesChart({
  data,
  xKey,
  series,
  height = 176,
  withTooltip = true,
  valueFormat = 'number',
  drilldown,
  legend = true,
  onLegendToggle,
}: LineTimeSeriesChartProps) {
  const legendSources = useMemo(
    () =>
      series.map((s, i) => ({
        id: s.key,
        label: s.name,
        color: s.color ?? chartSeriesColors[i % chartSeriesColors.length],
      })),
    [series],
  )
  const { legendItems, handleLegendToggle, isHidden } = useChartLegendState(legendSources, {
    enabled: legend,
    onLegendToggle,
  })

  const visibleSeries = series.filter((s) => !legend || !isHidden(s.key))

  const { displayData, tryDrill, drillBack, isDrilled, canDrill, parentLabel } = useChartXDrill(
    data,
    xKey,
    drilldown,
  )

  const valueAxis = chartValueYAxisOptions(
    valueFormat,
    maxAbsInDataRows(displayData, series.map((s) => s.key)),
  )

  const xAxis = chartCategoryXAxisProps(displayData.length, isDrilled)
  const chartBottomMargin = chartCategoryBottomMargin(displayData.length, isDrilled)

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
          <LineChart
            data={displayData}
            margin={{ top: 4, right: 8, left: 0, bottom: chartBottomMargin }}
          >
            <CartesianGrid stroke={chartGridStroke} vertical={false} />
            <XAxis dataKey={xKey} {...xAxis} />
            <YAxis tick={valueAxis.tick} width={valueAxis.width} />
            {withTooltip ? <Tooltip content={<ChartTooltip valueFormat={valueFormat} />} /> : null}
            {visibleSeries.map((s, i) => {
              const stroke = s.color ?? chartSeriesColors[i % chartSeriesColors.length]
              return (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={stroke}
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
                              fill={stroke}
                              stroke="none"
                              style={{ cursor: 'pointer' }}
                              onClick={(event) => {
                                event.stopPropagation()
                                tryDrill(payload as Record<string, string | number>)
                              }}
                            />
                          )
                        }
                      : isDrilled
                        ? { r: 3, fill: stroke }
                        : false
                  }
                  activeDot={canDrill ? { r: 6, cursor: 'pointer' } : { r: 4 }}
                />
              )
            })}
          </LineChart>
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