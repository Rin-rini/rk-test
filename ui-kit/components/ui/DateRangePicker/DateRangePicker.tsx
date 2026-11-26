import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  compareISODate,
  DATE_RANGE_PRESETS,
  formatRangeLabel,
  isDateInRange,
  normalizeDateRange,
  parseISODate,
  presetToRange,
  toISODate,
  type DateRangePresetId,
  type DateRangeValue,
} from './dateRangeUtils.ts'
import styles from './DateRangePicker.module.css'

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

export type DateRangePickerProps = {
  label?: string
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  className?: string
}

function monthMatrix(year: number, month: number): string[] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: string[] = []
  for (let i = 0; i < offset; i += 1) cells.push('')
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(toISODate(new Date(year, month, d)))
  }
  while (cells.length % 7 !== 0) cells.push('')
  return cells
}

export function DateRangePicker({ label, value, onChange, className }: DateRangePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [rangeStart, setRangeStart] = useState<string | null>(null)

  const anchor = parseISODate(value.from) ?? new Date()
  const [viewYear, setViewYear] = useState(anchor.getFullYear())
  const [viewMonth, setViewMonth] = useState(anchor.getMonth())

  const displayRange = useMemo(() => {
    if (rangeStart) {
      return normalizeDateRange(rangeStart, value.to || rangeStart)
    }
    return normalizeDateRange(value.from, value.to)
  }, [rangeStart, value.from, value.to])

  const days = useMemo(() => monthMatrix(viewYear, viewMonth), [viewYear, viewMonth])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const onDayClick = (iso: string) => {
    if (!rangeStart) {
      setRangeStart(iso)
      onChange({ from: iso, to: iso })
      return
    }
    const normalized = normalizeDateRange(rangeStart, iso)
    onChange(normalized)
    setRangeStart(null)
  }

  const applyPreset = (id: DateRangePresetId) => {
    onChange(presetToRange(id))
    setRangeStart(null)
  }

  const monthLabel = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(
    new Date(viewYear, viewMonth, 1),
  )

  return (
    <div ref={rootRef} className={[styles.wrap, className].filter(Boolean).join(' ')}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <button type="button" className={styles.trigger} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {formatRangeLabel(displayRange)}
      </button>
      {open ? (
        <div className={styles.popover}>
          <div className={styles.calHeader}>
            <button
              type="button"
              className={styles.nav}
              aria-label="Предыдущий месяц"
              onClick={() => {
                if (viewMonth === 0) {
                  setViewMonth(11)
                  setViewYear((y) => y - 1)
                } else setViewMonth((m) => m - 1)
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className={styles.monthTitle}>{monthLabel}</span>
            <button
              type="button"
              className={styles.nav}
              aria-label="Следующий месяц"
              onClick={() => {
                if (viewMonth === 11) {
                  setViewMonth(0)
                  setViewYear((y) => y + 1)
                } else setViewMonth((m) => m + 1)
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className={styles.weekdays}>
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className={styles.grid}>
            {days.map((iso, index) => {
              if (!iso) return <span key={`empty-${index}`} className={styles.empty} />
              const inRange = isDateInRange(iso, displayRange)
              const isStart = displayRange.from && compareISODate(iso, displayRange.from) === 0
              const isEnd = displayRange.to && compareISODate(iso, displayRange.to) === 0
              return (
                <button
                  key={iso}
                  type="button"
                  className={[
                    styles.day,
                    inRange ? styles.inRange : '',
                    isStart ? styles.rangeStart : '',
                    isEnd ? styles.rangeEnd : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onDayClick(iso)}
                >
                  {parseISODate(iso)?.getDate()}
                </button>
              )
            })}
          </div>
          <div className={styles.presets}>
            {DATE_RANGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={styles.preset}
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}