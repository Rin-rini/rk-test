import { Filter } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@ui-kit/components/ui/Input/Input.tsx'
import { Button } from '@ui-kit/components/ui/Button/Button.tsx'
import type { ColumnFilterEntry } from './types.ts'
import styles from './ColumnFilterMenu.module.css'

type ColumnFilterMenuProps = {
  header: string
  value: ColumnFilterEntry
  onChange: (entry: ColumnFilterEntry) => void
  disabled?: boolean
}

/** Попап фильтра рендерится в document.body, чтобы не обрезался overflow таблицы. */
export function ColumnFilterMenu({ header, value, onChange, disabled }: ColumnFilterMenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const isActive = value.query.trim().length > 0

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const panelWidth = 260
    const left = Math.min(Math.max(8, rect.right - panelWidth), window.innerWidth - panelWidth - 8)
    const top = rect.bottom + 6
    setCoords({ top, left })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const clear = () => {
    onChange({ query: '' })
    setOpen(false)
  }

  const popover = open ? (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      className={styles.popover}
      style={{ top: coords.top, left: coords.left }}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Input
        value={value.query}
        placeholder="Содержит или /regex/"
        onChange={(e) => onChange({ query: e.target.value })}
        aria-label={`Фильтр для ${header}`}
      />
      <div className={styles.actions}>
        <Button type="button" variant="ghost" size="sm" onClick={clear}>
          Сбросить
        </Button>
        <Button type="button" size="sm" onClick={() => setOpen(false)}>
          Готово
        </Button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[styles.trigger, isActive ? styles.triggerActive : ''].filter(Boolean).join(' ')}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Фильтр: ${header}`}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <Filter size={14} aria-hidden />
        {isActive ? <span className={styles.dot} aria-hidden /> : null}
      </button>
      {popover ? createPortal(popover, document.body) : null}
    </>
  )
}

export function isColumnFilterActive(entry: ColumnFilterEntry | undefined): boolean {
  return Boolean(entry?.query.trim())
}