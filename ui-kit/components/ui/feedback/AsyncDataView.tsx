import type { ReactNode } from 'react'
import { EmptyDataState } from './EmptyDataState.tsx'
import { ErrorDataState } from './ErrorDataState.tsx'
import type { DataStatus } from './types.ts'

type AsyncDataViewProps = {
  status: DataStatus
  onRetry?: () => void
  loading?: ReactNode
  empty?: ReactNode
  error?: ReactNode
  children: ReactNode
}

export function AsyncDataView({
  status,
  onRetry,
  loading,
  empty,
  error,
  children,
}: AsyncDataViewProps) {
  if (status === 'loading') {
    return <>{loading}</>
  }
  if (status === 'empty') {
    return <>{empty ?? <EmptyDataState />}</>
  }
  if (status === 'error') {
    return <>{error ?? <ErrorDataState onRetry={onRetry} />}</>
  }
  return <>{children}</>
}