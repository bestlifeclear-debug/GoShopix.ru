import type { Meta, StoryObj } from '@storybook/react';
import { IconSearch } from '../../icons/Icons';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Design System/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Пароль',
    type: 'password',
    hint: 'Минимум 8 символов',
  },
};

export const WithError: Story = {
  args: {
    label: 'Телефон',
    defaultValue: '123',
    error: 'Введите корректный номер',
  },
};

export const WithSearchIcon: Story = {
  args: {
    placeholder: 'Поиск…',
    leftSlot: <IconSearch />,
  },
};
