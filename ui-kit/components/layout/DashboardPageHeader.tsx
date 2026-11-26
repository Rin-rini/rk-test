import type { ReactNode } from 'react'
import grid from './dashboardGrid.module.css'

export type DashboardPageHeaderProps = {
  title: string
  lead?: ReactNode
  /** Короткие примечания под lead (маркированный список). */
  notes?: string[]
  actions?: ReactNode
  className?: string
}

export function DashboardPageHeader({ title, lead, notes, actions, className }: DashboardPageHeaderProps) {
  const hasNotes = notes && notes.length > 0

  return (
    <header className={[grid.header, className].filter(Boolean).join(' ')}>
      <div className={grid.titleBlock}>
        <h1>{title}</h1>
        {lead ? <p className={grid.lead}>{lead}</p> : null}
        {hasNotes ? (
          <ul className={grid.dataNotes}>
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {actions ? <div className={grid.actions}>{actions}</div> : null}
    </header>
  )
}