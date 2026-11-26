export type DateRangeValue = {
  from: string
  to: string
}

export type DateRangePresetId =
  | 'last30'
  | 'thisWeek'
  | 'thisMonth'
  | 'last3Months'
  | 'lastYear'
  | 'thisQuarter'

export type DateRangePreset = {
  id: DateRangePresetId
  label: string
}

/** От короткого окна к длинному — так же в UI под календарём. */
export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { id: 'thisWeek', label: 'Эта неделя' },
  { id: 'thisMonth', label: 'В этом месяце' },
  { id: 'thisQuarter', label: 'Текущий квартал' },
  { id: 'last30', label: 'Последние 30 дней' },
  { id: 'last3Months', label: 'Последние 3 месяца' },
  { id: 'lastYear', label: 'Последний год' },
]

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/** Если конец раньше начала — меняем местами. */
export function normalizeDateRange(from: string, to: string): DateRangeValue {
  if (!from || !to) return { from, to }
  const a = parseISODate(from)
  const b = parseISODate(to)
  if (!a || !b) return { from, to }
  if (b.getTime() < a.getTime()) return { from: to, to: from }
  return { from, to }
}

export function formatRangeLabel(range: DateRangeValue): string {
  if (!range.from && !range.to) return 'Выберите период'
  const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
  const from = range.from ? fmt.format(parseISODate(range.from) ?? new Date()) : '…'
  const to = range.to ? fmt.format(parseISODate(range.to) ?? new Date()) : '…'
  return `${from} — ${to}`
}

function startOfWeek(date: Date): Date {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return end
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function startOfQuarter(date: Date): Date {
  const q = Math.floor(date.getMonth() / 3) * 3
  return new Date(date.getFullYear(), q, 1)
}

export function presetToRange(id: DateRangePresetId, now = new Date()): DateRangeValue {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (id) {
    case 'last30': {
      const from = new Date(today)
      from.setDate(from.getDate() - 29)
      return { from: toISODate(from), to: toISODate(today) }
    }
    case 'thisWeek':
      return { from: toISODate(startOfWeek(today)), to: toISODate(endOfWeek(today)) }
    case 'thisMonth':
      return { from: toISODate(startOfMonth(today)), to: toISODate(endOfMonth(today)) }
    case 'thisQuarter': {
      const from = startOfQuarter(today)
      const end = new Date(from.getFullYear(), from.getMonth() + 3, 0)
      return { from: toISODate(from), to: toISODate(end) }
    }
    case 'last3Months': {
      const from = new Date(today.getFullYear(), today.getMonth() - 2, 1)
      return { from: toISODate(from), to: toISODate(today) }
    }
    case 'lastYear': {
      const from = new Date(today)
      from.setFullYear(from.getFullYear() - 1)
      from.setDate(from.getDate() + 1)
      return { from: toISODate(from), to: toISODate(today) }
    }
    default:
      return { from: toISODate(today), to: toISODate(today) }
  }
}

export function isDateInRange(iso: string, range: DateRangeValue): boolean {
  const day = parseISODate(iso)
  const from = parseISODate(range.from)
  const to = parseISODate(range.to)
  if (!day || !from || !to) return false
  const t = day.getTime()
  return t >= from.getTime() && t <= to.getTime()
}

export function compareISODate(a: string, b: string): number {
  const da = parseISODate(a)?.getTime() ?? 0
  const db = parseISODate(b)?.getTime() ?? 0
  return da - db
}