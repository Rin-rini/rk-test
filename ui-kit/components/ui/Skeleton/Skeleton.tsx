import { motion } from 'framer-motion'
import styles from './Skeleton.module.css'

type SkeletonProps = {
  className?: string
  rounded?: 'sm' | 'md' | 'lg'
}

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  return (
    <motion.div
      role="presentation"
      aria-hidden
      className={[styles.root, styles[rounded], className].filter(Boolean).join(' ')}
      animate={{ opacity: [0.45, 0.85, 0.45] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}