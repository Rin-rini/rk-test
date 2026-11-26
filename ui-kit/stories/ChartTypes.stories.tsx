import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ChartCard,
  ComboBarLineChart,
  PieChart,
  HorizontalBarChart,
  HorizontalGroupedBarChart,
  LineTimeSeriesChart,
  VerticalBarChart,
  VerticalGroupedBarChart,
  WaterfallChart,
} from '../components/ui/index.ts'
import { dashboardGrid } from '../components/layout/index.ts'
import { chartFactVar, chartPlanVar } from '../tokens/chartColors.ts'

const months = [
  { month: 'янв', plan: 10, spent: 9.2 },
  { month: 'фев', plan: 10.2, spent: 10.1 },
  { month: 'мар', plan: 10.5, spent: 8.4 },
]

const depts = [
  { dept: 'Финансы', value: 11.2 },
  { dept: 'ИТ', value: 8.9 },
  { dept: 'HR', value: 3.4 },
]

const costItems = [
  { costItem: 'ФОТ', plan: 82_000_000, fact: 79_500_000 },
  { costItem: 'Закупки', plan: 45_000_000, fact: 48_200_000 },
  { costItem: 'IT-инфраструктура', plan: 18_000_000, fact: 17_100_000 },
]

const salesByMonth = [
  { month: 'янв', sales: 38_500_000, plan: 40_000_000 },
  { month: 'фев', sales: 41_200_000, plan: 40_500_000 },
  { month: 'мар', sales: 44_800_000, plan: 42_000_000 },
  { month: 'апр', sales: 39_100_000, plan: 43_000_000 },
]

const salesWaterfall = [
  { label: 'Q3', value: 184_000_000, kind: 'start' as const },
  { label: 'Новые клиенты', value: 26_000_000, kind: 'delta' as const },
  { label: 'Средний чек', value: 12_000_000, kind: 'delta' as const },
  { label: 'Возвраты', value: -18_000_000, kind: 'delta' as const },
  { label: 'Акции', value: -9_000_000, kind: 'delta' as const },
  { label: 'Q4', value: 195_000_000, kind: 'total' as const },
]

function ChartTypesShowcase() {
  return (
    <div className={dashboardGrid.page}>
      <section className={dashboardGrid.charts} aria-label="Типы графиков UI kit">
        <ChartCard title="Линейный" className={dashboardGrid.chartHalf}>
          <LineTimeSeriesChart
            data={months}
            xKey="month"
            series={[
              { key: 'plan', name: 'План' },
              { key: 'spent', name: 'Исполнение' },
            ]}
            height={200}
          />
        </ChartCard>
        <ChartCard title="Продажи и план (combo)" className={dashboardGrid.chartHalf}>
          <ComboBarLineChart
            height={220}
            data={salesByMonth}
            xKey="month"
            bar={{ key: 'sales', name: 'Продажи' }}
            line={{ key: 'plan', name: 'План' }}
          />
        </ChartCard>

        <ChartCard title="Вертикальная гистограмма" className={dashboardGrid.chartHalf}>
          <VerticalBarChart data={depts} categoryKey="dept" valueKey="value" height={220} />
        </ChartCard>
        <ChartCard title="Горизонтальная гистограмма" className={dashboardGrid.chartHalf}>
          <HorizontalBarChart data={depts} categoryKey="dept" valueKey="value" height={220} />
        </ChartCard>

        <ChartCard title="Групповая горизонтальная (план / факт)" className={dashboardGrid.chartHalf}>
          <HorizontalGroupedBarChart
            data={costItems}
            categoryKey="costItem"
            series={[
              { key: 'plan', name: 'План', color: chartPlanVar },
              { key: 'fact', name: 'Факт', color: chartFactVar },
            ]}
            height={220}
            categoryAxisWidth={120}
          />
        </ChartCard>
        <ChartCard title="Групповая вертикальная (план / факт)" className={dashboardGrid.chartHalf}>
          <VerticalGroupedBarChart
            data={costItems.slice(0, 3)}
            categoryKey="costItem"
            series={[
              { key: 'plan', name: 'План', color: chartPlanVar },
              { key: 'fact', name: 'Факт', color: chartFactVar },
            ]}
            height={220}
          />
        </ChartCard>

        <ChartCard title="Анализ продаж (каскад)" className={dashboardGrid.chartHalf}>
          <WaterfallChart height={240} steps={salesWaterfall} />
        </ChartCard>
        <ChartCard title="Круговая диаграмма (pie)" className={dashboardGrid.chartHalf}>
          <PieChart
            height={176}
            slices={[
              { id: '1', label: 'Финансы', value: 45 },
              { id: '2', label: 'ИТ', value: 35 },
              { id: '3', label: 'HR', value: 20 },
            ]}
          />
        </ChartCard>
      </section>
    </div>
  )
}

const meta = {
  title: 'UI/Типы графиков',
  component: ChartTypesShowcase,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ChartTypesShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}