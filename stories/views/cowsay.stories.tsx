import type { Meta, StoryObj } from '@storybook/react';
import { CowsayUI } from '@/lib/components/views/cowsay';
import { SessionProvider } from 'next-auth/react';
import { TopBarInner } from '@/lib/components/layout/header';

const meta: Meta<typeof CowsayUI> = {
  title: 'Views/Cowsay',
  component: CowsayUI,
  decorators: [
    (Story) => (
      <SessionProvider session={{ user: { name: 'John Doe', email: 'john@example.com' }, expires: '9999-12-31T00:00:00.000Z' }}>
        <TopBarInner />
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CowsayUI>;

export const Default: Story = {};
