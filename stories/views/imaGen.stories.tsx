import type { Meta, StoryObj } from '@storybook/react';
import { ImaGenUI } from '@/lib/components/views/imaGen';
import { SessionProvider } from 'next-auth/react';
import { TopBarInner } from '@/lib/components/layout/topBar';

const meta: Meta<typeof ImaGenUI> = {
  title: 'Views/ImaGen',
  component: ImaGenUI,
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
type Story = StoryObj<typeof ImaGenUI>;

export const Default: Story = {
  args: {
    handleSubmit: async (prompt: string, userId: string) => {
      return {
        url: 'https://via.placeholder.com/512',
      };
    },
  },
};

export const WithGeneratedImage: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    nextauth: {
      session: {
        status: 'authenticated',
        data: {
          user: {
            email: 'user@example.com',
          },
        },
      },
    },
  },
};
