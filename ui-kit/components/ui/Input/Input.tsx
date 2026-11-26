import { cva, type VariantProps } from 'class-variance-authority'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

const field = cva(styles.input, {
  variants: {
    tone: {
      default: styles.toneDefault,
      invalid: styles.toneInvalid,
    },
  },
  defaultVariants: { tone: 'default' },
})

type InputProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof field> & {
    label?: string
    hint?: string
    error?: string
  }

export function Input({
  className,
  label,
  hint,
  error,
  tone,
  id,
  ...props
}: InputProps) {
  const fieldId = id ?? (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  const resolvedTone = error ? 'invalid' : tone

  return (
    <label className={[styles.wrap, className].filter(Boolean).join(' ')} htmlFor={fieldId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input
        id={fieldId}
        className={field({ tone: resolvedTone })}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${fieldId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${fieldId}-hint`} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </label>
  )
}