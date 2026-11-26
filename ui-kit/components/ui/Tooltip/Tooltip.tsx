import { useId, useState, type ReactNode } from 'react'
import styles from './Tooltip.module.css'

type TooltipProps = {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  return (
    <span
      className={[styles.root, className].filter(Boolean).join(' ')}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? tooltipId : undefined} tabIndex={0} className={styles.trigger}>
        {children}
      </span>
      {open ? (
        <span id={tooltipId} role="tooltip" className={[styles.popover, styles[side]].join(' ')}>
          {content}
        </span>
      ) : null}
    </span>
  )
}