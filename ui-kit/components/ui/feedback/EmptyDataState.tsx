import { Inbox } from 'lucide-react'
import styles from './DataState.module.css'

type EmptyDataStateProps = {
  title?: string
  subtitle?: string
}

export function EmptyDataState({
  title = 'Нет данных за выбранный период',
  subtitle = 'Измените фильтры или проверьте источник',
}: EmptyDataStateProps) {
  return (
    <div className={styles.state} role="status">
      <span className={styles.iconWrap} aria-hidden>
        <Inbox size={28} />
      </span>
      <p className={styles.title}>{title}</p>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  )
}