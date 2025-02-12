import type { Meta, StoryObj } from '@storybook/react';
import { ChatUI } from '@/lib/components/views/chat';
import { SessionProvider } from 'next-auth/react';
import { TopBarInner } from '@/lib/components/layout/header';

const meta: Meta<typeof ChatUI> = {
  title: 'Views/Chat',
  component: ChatUI,
  decorators: [
    (Story) => (
      <SessionProvider session={{ user: { name: 'John Doe', email: 'john@example.com' }, expires: '9999-12-31T00:00:00.000Z' }}>
        <TopBarInner />
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatUI>;

export const Default: Story = {
  args: {
    handleSubmit: async (messages: any[], userId: string) => {
      return {
        content: 'This is a mock bot response',
        role: 'assistant'
      };
    },
  },
};
