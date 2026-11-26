import { AlertCircle } from 'lucide-react'
import { Button } from '@ui-kit/components/ui/Button/Button.tsx'
import styles from './DataState.module.css'

type ErrorDataStateProps = {
  message?: string
  onRetry?: () => void
}

export function ErrorDataState({
  message = 'Не удалось загрузить данные',
  onRetry,
}: ErrorDataStateProps) {
  return (
    <div className={styles.state} role="alert">
      <span className={[styles.iconWrap, styles.iconError].filter(Boolean).join(' ')} aria-hidden>
        <AlertCircle size={28} />
      </span>
      <p className={styles.title}>{message}</p>
      {onRetry ? (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          Повторить
        </Button>
      ) : null}
    </div>
  )
}