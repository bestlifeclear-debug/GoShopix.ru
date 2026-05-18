import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';

const meta: Meta<typeof ProductCard> = {
  title: 'Design System/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

const demoImages = [
  { url: 'https://picsum.photos/seed/demo-1/600/750', alt: 'Фото 1' },
  { url: 'https://picsum.photos/seed/demo-2/600/750', alt: 'Фото 2' },
  { url: 'https://picsum.photos/seed/demo-3/600/750', alt: 'Фото 3' },
];

export const Default: Story = {
  args: {
    productId: '1',
    title: 'Беспроводные наушники Pro',
    brand: 'SoundWave',
    price: 12990,
    compareAtPrice: 17990,
    discountPercent: 28,
    rating: 4.7,
    reviewCount: 891,
    specLines: ['Аудио', 'Доставка за 2 дня'],
    images: demoImages,
  },
};

export const LowStock: Story = {
  args: {
    productId: '2',
    title: 'Умные часы Fit',
    brand: 'FitTrack',
    price: 8490,
    compareAtPrice: 11990,
    discountPercent: 29,
    rating: 4.3,
    reviewCount: 412,
    specLines: ['Гаджеты', 'Доставка за 1 день'],
    images: demoImages,
  },
};
