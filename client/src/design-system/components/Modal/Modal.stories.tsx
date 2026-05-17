import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Design System/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: function ModalDemo() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Открыть модальное окно</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Товар добавлен"
          footer={
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Продолжить покупки
              </Button>
              <Button onClick={() => setOpen(false)}>Перейти в корзину</Button>
            </>
          }
        >
          <p>Наушники Pro добавлены в корзину. Оформите заказ или продолжите выбор товаров.</p>
        </Modal>
      </>
    );
  },
};
