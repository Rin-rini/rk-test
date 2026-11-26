import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import grid from './dashboardGrid.module.css'

const PAGE_ENTRANCE = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
} as const

export type DashboardPageProps = {
  children: ReactNode
  className?: string
  /** Анимация появления при монтировании (по умолчанию включена). */
  animateEntrance?: boolean
} & Omit<HTMLMotionProps<'main'>, 'children' | 'className'>

export function DashboardPage({
  children,
  className,
  animateEntrance = true,
  initial,
  animate,
  transition,
  ...rest
}: DashboardPageProps) {
  const entrance = animateEntrance
    ? {
        initial: initial ?? PAGE_ENTRANCE.initial,
        animate: animate ?? PAGE_ENTRANCE.animate,
        transition: transition ?? PAGE_ENTRANCE.transition,
      }
    : { initial, animate, transition }

  return (
    <motion.main className={[grid.page, className].filter(Boolean).join(' ')} {...entrance} {...rest}>
      {children}
    </motion.main>
  )
}