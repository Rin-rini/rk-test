import type { ReactNode } from 'react'
import { Skeleton } from '@ui-kit/components/ui/Skeleton/Skeleton.tsx'
import { AsyncDataView } from '../feedback/AsyncDataView.tsx'
import type { DataStatus } from '../feedback/types.ts'
import styles from './ChartCard.module.css'

export type ChartCardProps = {
  title: string
  children?: ReactNode
  footer?: ReactNode
  status?: DataStatus
  onRetry?: () => void
  className?: string
}

export function ChartCard({
  title,
  children,
  footer,
  status = 'ready',
  onRetry,
  className,
}: ChartCardProps) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </header>
      <div className={styles.body}>
        <AsyncDataView
          status={status}
          onRetry={onRetry}
          loading={<Skeleton className={styles.chartSkel} />}
        >
          <>
            <div className={styles.plotArea}>{children}</div>
            {footer ? <div className={styles.footer}>{footer}</div> : null}
          </>
        </AsyncDataView>
      </div>
    </article>
  )
}