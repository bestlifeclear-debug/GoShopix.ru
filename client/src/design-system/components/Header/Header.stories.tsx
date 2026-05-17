import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchBox } from '../../../components/SearchBox/SearchBox';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Design System/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    cartCount: 2,
    searchSlot: <SearchBox value="" onChange={() => undefined} onSubmit={() => undefined} />,
    navLinks: [
      { label: 'Электроника', to: '/catalog' },
      { label: 'Акции', to: '/catalog' },
    ],
  },
};

export const Interactive: Story = {
  render: function InteractiveHeader() {
    const [query, setQuery] = useState('');
    return (
      <Header
        searchSlot={<SearchBox value={query} onChange={setQuery} onSubmit={() => undefined} />}
        cartCount={3}
        onCatalogToggle={() => undefined}
      />
    );
  },
};
