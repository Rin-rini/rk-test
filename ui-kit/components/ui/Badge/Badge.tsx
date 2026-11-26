import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import styles from './Badge.module.css'

const badge = cva(styles.root, {
  variants: {
    variant: {
      neutral: styles.neutral,
      brand: styles.brand,
      success: styles.success,
      warning: styles.warning,
      critical: styles.critical,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
    },
  },
  defaultVariants: {
    variant: 'neutral',
    size: 'md',
  },
})

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={[badge({ variant, size }), className].filter(Boolean).join(' ')} {...props} />
}