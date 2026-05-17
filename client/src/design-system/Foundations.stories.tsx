import type { Meta, StoryObj } from '@storybook/react';
import styles from './Foundations.module.css';

const meta: Meta = {
  title: 'Design System/Foundations',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

const colors = [
  { name: 'Primary', token: '--color-primary', hex: '#E31837' },
  { name: 'Secondary', token: '--color-secondary', hex: '#6A0DAD' },
  { name: 'Background', token: '--color-bg', hex: '#FFFFFF' },
  { name: 'Background Subtle', token: '--color-bg-subtle', hex: '#F5F5F7' },
  { name: 'Inverse', token: '--color-bg-inverse', hex: '#000000' },
  { name: 'Text', token: '--color-text', hex: '#1D1D1F' },
  { name: 'Text Muted', token: '--color-text-muted', hex: '#86868B' },
  { name: 'Success', token: '--color-success', hex: '#34C759' },
  { name: 'Warning', token: '--color-warning', hex: '#FF9500' },
  { name: 'Error', token: '--color-error', hex: '#FF3B30' },
];

const typeScale = [
  { label: '48px / 3xl', size: 'var(--font-size-3xl)', sample: 'GoShopix' },
  { label: '32px / 2xl', size: 'var(--font-size-2xl)', sample: 'Заголовок H1' },
  { label: '24px / xl', size: 'var(--font-size-xl)', sample: 'Заголовок H2' },
  { label: '20px / lg', size: 'var(--font-size-lg)', sample: 'Заголовок H3' },
  { label: '16px / md', size: 'var(--font-size-md)', sample: 'Основной текст' },
  { label: '14px / sm', size: 'var(--font-size-sm)', sample: 'Вторичный текст' },
  { label: '12px / xs', size: 'var(--font-size-xs)', sample: 'Подпись' },
];

export const Colors: Story = {
  render: () => (
    <div className={styles.grid}>
      {colors.map((c) => (
        <div key={c.token} className={styles.swatch}>
          <div className={styles.swatchColor} style={{ background: `var(${c.token})` }} />
          <div>
            <strong>{c.name}</strong>
            <p className={styles.muted}>
              {c.hex} · {c.token}
            </p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className={styles.typeList}>
      {typeScale.map((t) => (
        <div key={t.label} className={styles.typeRow}>
          <span className={styles.muted}>{t.label}</span>
          <p style={{ fontSize: t.size, margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
            {t.sample}
          </p>
        </div>
      ))}
    </div>
  ),
};
