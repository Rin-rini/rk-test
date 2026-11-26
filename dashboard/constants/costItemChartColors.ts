import { chartSeriesColors } from '@ui-kit/tokens/chartColors.ts'

/** Фиксированные цвета статей — одинаковые на stacked bar и круговой диаграмме. */
const COST_ITEM_COLOR: Record<string, string> = {
  'ФОТ': chartSeriesColors[3],
  'Аренда и коммуналка': chartSeriesColors[0],
  'Закупки материалов': chartSeriesColors[1],
  'IT-инфраструктура': chartSeriesColors[4],
  'Обучение и развитие': chartSeriesColors[2],
}

const FALLBACK = [...chartSeriesColors]

export function costItemChartColor(costItem: string, fallbackIndex = 0): string {
  return COST_ITEM_COLOR[costItem] ?? FALLBACK[fallbackIndex % FALLBACK.length]
}