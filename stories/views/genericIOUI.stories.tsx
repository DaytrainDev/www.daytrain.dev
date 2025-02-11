import type { Meta, StoryObj } from '@storybook/react';
import { GenericIOUI } from '@/lib/components/views/genericIOUI';
import { SessionProvider } from 'next-auth/react';

const meta: Meta<typeof GenericIOUI> = {
  title: 'Views/GenericIOUI',
  component: GenericIOUI,
  decorators: [
    (Story) => (
      <SessionProvider session={{ user: { name: 'John Doe', email: 'john@example.com' }, expires: '9999-12-31T00:00:00.000Z' }}>
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
type Story = StoryObj<typeof GenericIOUI>;

export const Default: Story = {
  args: {
    inputs: [
      {
        id: 'name',
        name: 'name',
        prompt: 'Enter your name'
      },
      {
        id: 'email',
        name: 'email',
        prompt: 'Enter your email'
      }
    ],
    label: 'Submit',
    action: '/api/submit',
  },
};

export const WithOutput: Story = {
  args: {
    ...Default.args,
    output: 'Submission successful!',
  },
};
