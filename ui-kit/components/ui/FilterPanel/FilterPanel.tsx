import { Button } from '@ui-kit/components/ui/Button/Button.tsx'
import { DateRangePicker } from '@ui-kit/components/ui/DateRangePicker/DateRangePicker.tsx'
import type { DateRangeValue } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'
import { Select } from '@ui-kit/components/ui/Select/Select.tsx'
import type { FilterConfig, FilterPanelValues } from './types.ts'
import styles from './FilterPanel.module.css'

export type FilterPanelLayout = 'vertical' | 'horizontal'

export type FilterPanelProps = {
  filters: FilterConfig[]
  value: FilterPanelValues
  onChange: (value: FilterPanelValues) => void
  /** Начальные значения для кнопки «Сбросить»; если не переданы — кнопка не показывается. */
  defaultValues?: FilterPanelValues
  /** `vertical` — колонка для сайдбара; по умолчанию горизонтальная панель сверху. */
  layout?: FilterPanelLayout
  className?: string
}

export function FilterPanel({
  filters,
  value,
  onChange,
  defaultValues,
  layout = 'horizontal',
  className,
}: FilterPanelProps) {
  return (
    <section
      className={[
        styles.panel,
        layout === 'vertical' ? styles.panelVertical : styles.panelHorizontal,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Фильтры"
    >
      {filters.map((filter) => {
        if (filter.kind === 'dateRange') {
          const range = (value[filter.id] as DateRangeValue | undefined) ?? { from: '', to: '' }
          return (
            <DateRangePicker
              key={filter.id}
              label={filter.label}
              value={range}
              onChange={(next) => onChange({ ...value, [filter.id]: next })}
              className={styles.dateField}
            />
          )
        }

        if (filter.kind === 'singleSelect') {
          const selected = (value[filter.id] as string | null | undefined) ?? null
          return (
            <Select
              key={filter.id}
              label={filter.label}
              options={filter.options}
              value={selected}
              onChange={(next) => onChange({ ...value, [filter.id]: next })}
              className={styles.selectField}
            />
          )
        }

        const selected = (value[filter.id] as string[] | undefined) ?? []
        return (
          <Select
            key={filter.id}
            multiple
            label={filter.label}
            options={filter.options}
            value={selected}
            onChange={(next) => onChange({ ...value, [filter.id]: next })}
            className={styles.selectField}
          />
        )
      })}
      {defaultValues ? (
        <div className={styles.resetWrap}>
          <Button type="button" variant="secondary" onClick={() => onChange(defaultValues)}>
            Сбросить
          </Button>
        </div>
      ) : null}
    </section>
  )
}