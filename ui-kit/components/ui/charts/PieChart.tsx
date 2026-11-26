import { ChartLegend } from '@ui-kit/components/ui/ChartLegend/ChartLegend.tsx'
import { chartSeriesColors } from '@ui-kit/tokens/chartColors.ts'
import { formatPercent } from '@ui-kit/visualization/index.ts'
import { useMemo } from 'react'
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer } from 'recharts'
import { useChartLegendState } from './useChartLegendState.ts'
import styles from './charts.module.css'

export type PieSlice = {
  id: string
  label: string
  value: number
  color?: string
}

export type PieChartProps = {
  slices: PieSlice[]
  height?: number
  /** Легенда с переключением сегментов; по умолчанию включена. */
  legend?: boolean
  onLegendToggle?: (seriesId: string) => void
}

export function PieChart({
  slices,
  height = 176,
  legend = true,
  onLegendToggle,
}: PieChartProps) {
  const enriched = useMemo(() => {
    const total = slices.reduce((sum, slice) => sum + slice.value, 0)
    return slices.map((slice, index) => {
      const color = slice.color ?? chartSeriesColors[index % chartSeriesColors.length]
      const ratio = total > 0 ? slice.value / total : null
      return { ...slice, color, ratio }
    })
  }, [slices])

  const legendSources = useMemo(
    () =>
      enriched.map((slice) => {
        const share = slice.ratio !== null ? formatPercent(slice.ratio) : '—'
        return {
          id: slice.id,
          label: `${slice.label} · ${share}`,
          color: slice.color,
        }
      }),
    [enriched],
  )
  const { legendItems, handleLegendToggle, hiddenIds } = useChartLegendState(legendSources, {
    enabled: legend,
    onLegendToggle,
  })

  const visibleSlices = enriched.filter((slice) => !hiddenIds.has(slice.id))
  const data = visibleSlices.map((s) => ({ name: s.label, value: s.value, id: s.id }))

  return (
    <div
      className={[styles.chartRoot, styles.pieWithLegend, legend ? '' : styles.pieSolo]
        .filter(Boolean)
        .join(' ')}
      style={legend ? { height } : undefined}
      role="group"
      aria-label="Круговая диаграмма"
    >
      <div className={styles.piePlot} style={legend ? undefined : { height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius="88%"
              paddingAngle={visibleSlices.length > 1 ? 1 : 0}
              stroke="var(--bg-card)"
              strokeWidth={1}
              isAnimationActive={false}
            >
              {visibleSlices.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
      {legend ? (
        <div
          className={[styles.pieLegendAside, 'kit-scrollbar'].join(' ')}
          role="region"
          aria-label="Легенда графика"
        >
          <ChartLegend
            series={legendItems}
            onToggle={handleLegendToggle}
            layout="vertical"
          />
        </div>
      ) : null}
    </div>
  )
}