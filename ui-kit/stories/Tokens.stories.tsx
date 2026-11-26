import type { Meta, StoryObj } from '@storybook/react-vite'
import { chartSeriesColors } from '../tokens/chartColors.ts'
import styles from './Tokens.module.css'

const brandSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

function TokensShowcase() {
  return (
    <div className={styles.page}>
      <header className={styles.section}>
        <h1 className="typ-h1">Дизайн-токены</h1>
      </header>

      <section className={styles.section}>
        <h2 className="typ-h3">Бренд</h2>
        <div className={styles.swatches} aria-label="brand palette">
          {brandSteps.map((step) => (
            <div
              key={step}
              className={styles.swatch}
              style={{ background: `var(--brand-${step})` }}
            >
              <span>{step}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="typ-h3">Фоны и текст</h2>
        <div className={styles.row}>
          <div className={styles.card} data-tone="app">
            <span>--bg-app</span>
          </div>
          <div className={styles.card} data-tone="panel">
            <span>--bg-panel</span>
          </div>
          <div className={styles.card} data-tone="card">
            <span>--bg-card</span>
          </div>
        </div>
        <div className={styles.typeRow}>
          <span className={styles.textPrimary}>text-primary</span>
          <span className={styles.textSecondary}>text-secondary</span>
          <span className={styles.textMuted}>text-muted</span>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="typ-h3">Статусы и графики</h2>
        <div className={styles.row}>
          <span className={styles.pill} data-status="success">
            success
          </span>
          <span className={styles.pill} data-status="warning">
            warning
          </span>
          <span className={styles.pill} data-status="critical">
            critical
          </span>
        </div>
        <div className={styles.swatches}>
          {chartSeriesColors.map((color, i) => (
            <div key={color} className={styles.swatch} style={{ background: color }}>
              <span>{i + 1}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="typ-h3">Типографика и KPI</h2>
        <p className="typ-h2">Заголовок h2</p>
        <p className="typ-kpi-lg">12 450 000 ₽</p>
        <p className="typ-kpi">−8,3 %</p>
      </section>

      <section className={styles.section}>
        <h2 className="typ-h3">Отступы (4 px)</h2>
        <div className={styles.spaceList}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className={styles.spaceItem}>
              <span>{`--space-${i + 1}`}</span>
              <span className={styles.spaceBar} aria-hidden />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="typ-h3">Скругления</h2>
        <div className={styles.row}>
          <div className={styles.radius} data-radius="sm" title="radius-sm" />
          <div className={styles.radius} data-radius="md" title="radius-md" />
          <div className={styles.radius} data-radius="lg" title="radius-lg" />
        </div>
      </section>
    </div>
  )
}

const meta = {
  title: 'Foundation/Tokens',
  component: TokensShowcase,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TokensShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}