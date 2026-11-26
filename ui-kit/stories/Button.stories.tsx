import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../components/ui/Button/Button.tsx'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: { children: 'Применить' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Сбросить' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Подробнее' },
}

export const Small: Story = {
  args: { size: 'sm', children: 'Месяц' },
}
