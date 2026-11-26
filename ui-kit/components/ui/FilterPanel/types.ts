import type { SelectOption } from '@ui-kit/components/ui/Select/Select.tsx'
import type { DateRangeValue } from '@ui-kit/components/ui/DateRangePicker/dateRangeUtils.ts'

export type { DateRangeValue }

export type DateRangeFilterConfig = {
  kind: 'dateRange'
  id: string
  label: string
}

export type SingleSelectFilterConfig = {
  kind: 'singleSelect'
  id: string
  label: string
  options: SelectOption[]
}

export type MultiSelectFilterConfig = {
  kind: 'multiSelect'
  id: string
  label: string
  options: SelectOption[]
}

export type FilterConfig = DateRangeFilterConfig | SingleSelectFilterConfig | MultiSelectFilterConfig

export type FilterPanelValues = Record<string, DateRangeValue | string[] | string | null | undefined>