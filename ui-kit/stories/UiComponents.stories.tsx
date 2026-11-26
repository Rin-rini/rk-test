import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button, Badge, Input, Select, Tooltip } from '../components/ui/index.ts'

function UiShowcase() {
  const [dept, setDept] = useState<string[]>(['fin'])
  const [granularity, setGranularity] = useState<string | null>('month')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 520, padding: 24 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button>Применить</Button>
        <Button variant="secondary">Сбросить</Button>
        <Button variant="ghost" size="sm">
          Экспорт
        </Button>
      </div>
      <Input label="Комментарий" placeholder="Введите текст" />
      <Input label="С ошибкой" error="Обязательное поле" defaultValue="" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge>Нейтральный</Badge>
        <Badge variant="success">Успех</Badge>
        <Badge variant="warning">Внимание</Badge>
        <Badge variant="critical">Критично</Badge>
      </div>
      <Select
        label="Детализация"
        options={[
          { value: 'month', label: 'По месяцам' },
          { value: 'quarter', label: 'По кварталам' },
        ]}
        value={granularity}
        onChange={setGranularity}
      />
      <Select
        multiple
        label="Подразделения (мульти)"
        options={[
          { value: 'fin', label: 'Финансы' },
          { value: 'it', label: 'ИТ' },
          { value: 'hr', label: 'HR' },
        ]}
        value={dept}
        onChange={setDept}
      />
      <Tooltip content="Подсказка к метрике">
        <span tabIndex={0} style={{ textDecoration: 'underline dotted', cursor: 'help' }}>
          Наведите курсор
        </span>
      </Tooltip>
    </div>
  )
}

const meta = {
  title: 'UI/Базовые',
  component: UiShowcase,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof UiShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}