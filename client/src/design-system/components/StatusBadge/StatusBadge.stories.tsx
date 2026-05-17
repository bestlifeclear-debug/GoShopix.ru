import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Design System/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Success: Story = {
  args: { variant: 'success', label: 'В наличии' },
};

export const Warning: Story = {
  args: { variant: 'warning', label: 'Осталось мало' },
};

export const Error: Story = {
  args: { variant: 'error', label: 'Нет в наличии' },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <StatusBadge variant="success" label="Доставлен" />
      <StatusBadge variant="warning" label="Ожидает оплаты" />
      <StatusBadge variant="error" label="Отменён" />
      <StatusBadge variant="neutral" label="Черновик" />
    </div>
  ),
};
