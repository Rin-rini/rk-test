import type { ChartLegendSeries } from '@ui-kit/components/ui/ChartLegend/ChartLegend.tsx'
import { chartSeriesColors } from '@ui-kit/tokens/chartColors.ts'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type ChartLegendSource = {
  id: string
  label: string
  color?: string
}

type UseChartLegendStateOptions = {
  enabled?: boolean
  onLegendToggle?: (seriesId: string) => void
}

function defaultColor(index: number): string {
  return chartSeriesColors[index % chartSeriesColors.length]
}

function toLegendItems(sources: ChartLegendSource[], hidden: Map<string, boolean | undefined>): ChartLegendSeries[] {
  return sources.map((source, index) => ({
    id: source.id,
    label: source.label,
    color: source.color ?? defaultColor(index),
    hidden: hidden.get(source.id),
  }))
}

/** Состояние легенды графика: видимость серий и переключатели. */
export function useChartLegendState(sources: ChartLegendSource[], options: UseChartLegendStateOptions = {}) {
  const { enabled = true, onLegendToggle } = options
  const sourceKey = sources.map((s) => `${s.id}\t${s.label}\t${s.color ?? ''}`).join('\n')

  const [legendItems, setLegendItems] = useState<ChartLegendSeries[]>(() => toLegendItems(sources, new Map()))

  useEffect(() => {
    setLegendItems((prev) => {
      const hidden = new Map(prev.map((item) => [item.id, item.hidden]))
      return toLegendItems(sources, hidden)
    })
  }, [sourceKey, sources])

  const handleLegendToggle = useCallback(
    (seriesId: string) => {
      if (onLegendToggle) {
        onLegendToggle(seriesId)
        return
      }
      setLegendItems((prev) =>
        prev.map((item) => (item.id === seriesId ? { ...item, hidden: !item.hidden } : item)),
      )
    },
    [onLegendToggle],
  )

  const hiddenIds = useMemo(() => {
    if (!enabled) return new Set<string>()
    return new Set(legendItems.filter((item) => item.hidden).map((item) => item.id))
  }, [enabled, legendItems])

  const isHidden = useCallback((id: string) => hiddenIds.has(id), [hiddenIds])

  return { legendItems, handleLegendToggle, hiddenIds, isHidden }
}