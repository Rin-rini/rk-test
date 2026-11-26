import { Button } from '@ui-kit/components/ui/Button/Button.tsx'
import { useEffect, useState } from 'react'
import styles from './charts.module.css'

export type ChartXDrillConfig = {
  /** Поле строки с идентификатором уровня (например, `month`: YYYY-MM). */
  drillKey: string
  getDetailData: (
    drillValue: string,
    row: Record<string, string | number>,
  ) => Record<string, string | number>[] | null | undefined
  backLabel?: string
  /** Подсказка на корневом уровне. */
  rootHint?: string
}

type DrillFrame = {
  data: Record<string, string | number>[]
  parentLabel: string
}

export function useChartXDrill(
  rootData: Record<string, string | number>[],
  xKey: string,
  drilldown?: ChartXDrillConfig,
) {
  const [frame, setFrame] = useState<DrillFrame | null>(null)

  useEffect(() => {
    setFrame(null)
  }, [rootData, drilldown])

  const displayData = frame?.data ?? rootData
  const isDrilled = frame !== null
  const canDrill = Boolean(drilldown) && !isDrilled

  const tryDrill = (row: Record<string, string | number> | undefined) => {
    if (!drilldown || !row || isDrilled) return
    const drillValue = String(row[drilldown.drillKey] ?? '')
    if (!drillValue) return
    const next = drilldown.getDetailData(drillValue, row)
    if (!next?.length) return
    const label = String(row[xKey]) ?? drillValue
    const parentLabel = `${label.slice(0, label.length - 2)} 20${label.slice(label.length - 2)}`
    setFrame({ data: next, parentLabel })
  }

  const drillBack = () => setFrame(null)

  return {
    displayData,
    tryDrill,
    drillBack,
    isDrilled,
    canDrill,
    parentLabel: frame?.parentLabel ?? null,
  }
}

type ChartDrillNavProps = {
  drilldown?: ChartXDrillConfig
  isDrilled: boolean
  parentLabel: string | null
  onBack: () => void
}

export function ChartDrillNav({ drilldown, isDrilled, parentLabel, onBack }: ChartDrillNavProps) {
  if (!drilldown) return null

  if (isDrilled && parentLabel) {
    return (
      <div className={styles.drillNav}>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          {drilldown.backLabel ?? 'Назад'}
        </Button>
        <span className={styles.drillContext}>{parentLabel}</span>
      </div>
    )
  }

  if (drilldown.rootHint) {
    return (
      <div className={styles.drillNav}>
        <span className={styles.drillHint}>{drilldown.rootHint}</span>
      </div>
    )
  }

  return null
}

/** Интервал подписей категорий по оси X. */
export function chartXAxisInterval(
  pointCount: number,
  isDrilled: boolean,
): number | 'preserveStartEnd' {
  if (isDrilled) {
    if (pointCount <= 12) return 0
    if (pointCount <= 22) return 1
    return 2
  }
  if (pointCount <= 6) return 0
  if (pointCount <= 12) return 1
  return 'preserveStartEnd'
}

