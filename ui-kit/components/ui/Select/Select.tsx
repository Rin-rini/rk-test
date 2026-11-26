import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import styles from './Select.module.css'

export type SelectOption = {
  value: string
  label: string
}

type SelectBaseProps = {
  label?: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

type SingleSelectProps = SelectBaseProps & {
  multiple?: false
  value: string | null
  onChange: (value: string | null) => void
}

type MultiSelectProps = SelectBaseProps & {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
}

export type SelectProps = SingleSelectProps | MultiSelectProps

export function Select(props: SelectProps) {
  const { label, options, placeholder = 'Выберите…', disabled, className } = props
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const isMulti = props.multiple === true

  const multiLabels = isMulti
    ? options.filter((o) => props.value.includes(o.value)).map((o) => o.label)
    : []
  const singleLabel = !isMulti ? options.find((o) => o.value === props.value)?.label : undefined
  const hasSelection = isMulti ? props.value.length > 0 : Boolean(props.value)

  const triggerText = isMulti
    ? multiLabels.length > 0
      ? multiLabels.join(', ')
      : placeholder
    : singleLabel ?? placeholder

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const toggleMulti = (value: string) => {
    if (!isMulti) return
    const has = props.value.includes(value)
    const next = has ? props.value.filter((v) => v !== value) : [...props.value, value]
    props.onChange(next)
  }

  const pickSingle = (value: string) => {
    if (isMulti) return
    props.onChange(value)
    setOpen(false)
  }

  const isSelected = (value: string) =>
    isMulti ? props.value.includes(value) : props.value === value

  return (
    <div ref={rootRef} className={[styles.wrap, className].filter(Boolean).join(' ')}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <button
        type="button"
        className={styles.trigger}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={[styles.value, !hasSelection ? styles.placeholder : ''].join(' ')}>
          {triggerText}
        </span>
        <ChevronDown size={16} aria-hidden className={open ? styles.chevronOpen : undefined} />
      </button>
      {open ? (
        <ul id={listId} role="listbox" aria-multiselectable={isMulti || undefined} className={styles.list}>
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={isSelected(option.value)}>
              <button
                type="button"
                className={styles.option}
                onClick={() => (isMulti ? toggleMulti(option.value) : pickSingle(option.value))}
              >
                {isMulti ? (
                  <span className={[styles.checkbox, isSelected(option.value) ? styles.checkboxOn : ''].join(' ')} aria-hidden>
                    {isSelected(option.value) ? <Check size={12} /> : null}
                  </span>
                ) : null}
                <span>{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}