import type { GroupedBarSeries } from '@ui-kit/components/ui/charts/GroupedBarChart.tsx'
import { chartFactVar, chartPlanVar } from '@ui-kit/tokens/chartColors.ts'

export const planFactGroupedBarSeries: GroupedBarSeries[] = [
  { key: 'plan', name: 'План', color: chartPlanVar },
  { key: 'fact', name: 'Факт', color: chartFactVar },
]