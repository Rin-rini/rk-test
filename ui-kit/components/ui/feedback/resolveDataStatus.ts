import type { DataStatus } from './types.ts'

type ResolveDataStatusOptions = {
  isLoading: boolean
  error: unknown
  /** Сколько строк в источнике (файл, API). */
  sourceCount: number
  /** Сколько строк осталось после фильтров. */
  resultCount: number
}

export function resolveDataStatus({
  isLoading,
  error,
  sourceCount,
  resultCount,
}: ResolveDataStatusOptions): DataStatus {
  if (isLoading) return 'loading'
  if (error) return 'error'
  if (sourceCount === 0) return 'empty'
  if (resultCount === 0) return 'empty'
  return 'ready'
}