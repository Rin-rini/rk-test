import styles from './ChartLegend.module.css'

export type ChartLegendSeries = {
  id: string
  label: string
  color: string
  hidden?: boolean
}

export type ChartLegendLayout = 'horizontal' | 'vertical'

export type ChartLegendProps = {
  series: ChartLegendSeries[]
  onToggle?: (seriesId: string) => void
  /** `horizontal` — прокручиваемый ряд (графики); `vertical` — столбец (pie и узкие карточки). */
  layout?: ChartLegendLayout
  className?: string
}

export function ChartLegend({
  series,
  onToggle,
  layout = 'horizontal',
  className,
}: ChartLegendProps) {
  return (
    <ul
      className={[
        styles.list,
        layout === 'vertical' ? styles.listVertical : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {series.map((item) => (
        <li key={item.id} className={styles.entry}>
          {onToggle ? (
            <button
              type="button"
              className={[styles.item, item.hidden ? styles.muted : ''].join(' ')}
              aria-pressed={item.hidden ? false : true}
              onClick={() => onToggle(item.id)}
            >
              <span className={styles.swatch} style={{ background: item.color }} aria-hidden />
              <span className={styles.label}>{item.label}</span>
            </button>
          ) : (
            <span className={styles.itemStatic}>
              <span className={styles.swatch} style={{ background: item.color }} aria-hidden />
              <span className={styles.label}>{item.label}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}