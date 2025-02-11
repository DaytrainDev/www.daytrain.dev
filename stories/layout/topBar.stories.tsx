import type { Meta, StoryObj } from '@storybook/react';
import { TopBarInner } from '@/lib/components/layout/topBar';
import { SessionProvider } from 'next-auth/react';

// Create a wrapper component for the stories
const TopBarWithSession = ({ session }: { session?: any }) => {
  return (
    <SessionProvider session={session}>
      <TopBarInner />
    </SessionProvider>
  );
};

const meta: Meta<typeof TopBarInner> = {
  title: 'Layout/TopBar',
  component: TopBarWithSession,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopBarInner>;
export const LoggedIn: Story = {
  render: () => (
    <TopBarWithSession session={{
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://www.daytrain.dev/_next/image?url=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F13439002%3Fv%3D4&w=48&q=75',
      },
      expires: '9999-12-31T00:00:00.000Z'
    }} />
  )
};

export const LoggedOut: Story = {
  render: () => <TopBarWithSession />
};
