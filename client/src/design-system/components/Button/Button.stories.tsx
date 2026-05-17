import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Купить', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Подробнее', variant: 'secondary' },
};

export const Outline: Story = {
  args: { children: 'Отмена', variant: 'outline' },
};

export const Danger: Story = {
  args: { children: 'Удалить', variant: 'danger' },
};

export const Loading: Story = {
  args: { children: 'Оформление…', loading: true },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};
