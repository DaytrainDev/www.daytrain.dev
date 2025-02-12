import type { Meta, StoryObj } from '@storybook/react';
import { WeatherUI } from '@/lib/components/views/weather';
import { SessionProvider } from 'next-auth/react';
import { TopBarInner } from '@/lib/components/layout/header';

const meta: Meta<typeof WeatherUI> = {
  title: 'Views/Weather',
  component: WeatherUI,
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
type Story = StoryObj<typeof WeatherUI>;

const mockForecast = {
  periods: [
    {
      number: 1,
      name: "Today",
      startTime: "2025-02-11T12:00:00-06:00",
      temperature: 72,
      shortForecast: "Sunny",
      icon: "https://api.weather.gov/icons/land/day/few?size=medium"
    },
    {
      number: 2,
      name: "Tonight",
      startTime: "2025-02-11T18:00:00-06:00",
      temperature: 55,
      shortForecast: "Clear",
      icon: "https://api.weather.gov/icons/land/night/few?size=medium"
    },
    {
      number: 3,
      name: "Tomorrow",
      startTime: "2025-02-12T06:00:00-06:00",
      temperature: 75,
      shortForecast: "Partly Cloudy",
      icon: "https://api.weather.gov/icons/land/day/sct?size=medium"
    }
  ]
};

export const Default: Story = {
  args: {
    handleGeoSearch: async (searchText: string) => {
      return {
        latitude: 44.9778,
        longitude: -93.2650
      };
    },
    handleWeatherSearch: async (geoCode: GeolocationCoordinates) => {
      return mockForecast;
    }
  }
};

export const Loading: Story = {
  args: {
    ...Default.args,
    handleGeoSearch: async (searchText: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        latitude: 44.9778,
        longitude: -93.2650
      };
    }
  }
};

export const Error: Story = {
  args: {
    ...Default.args,
    handleGeoSearch: async (searchText: string) => {
      return {
        error: "Location not found"
      };
    }
  }
};
