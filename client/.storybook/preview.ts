import type { Preview } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '../src/design-system/styles/global.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'centered',
    backgrounds: {
      default: 'subtle',
      values: [
        { name: 'subtle', value: '#F5F5F7' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'dark', value: '#000000' },
      ],
    },
  },
};

export default preview;
