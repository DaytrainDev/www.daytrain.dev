import { search } from '@/lib/services/weather';

describe('weather service', () => {
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockGridpointResponse = {
    properties: {
      forecast: 'https://api.weather.gov/gridpoints/NYC/33,37/forecast',
      relativeLocation: {
        properties: {
          city: 'New York',
          state: 'NY',
        },
      },
    },
  };

  const mockForecastResponse = {
    properties: {
      periods: [
        {
          number: 1,
          name: 'Today',
          temperature: 72,
          shortForecast: 'Sunny',
        },
      ],
    },
  };

  it('should return empty object when latitude is missing', async () => {
    const result = await search({ longitude: -74.006 } as GeolocationCoordinates);

    expect(result).toEqual({});
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should return empty object when longitude is missing', async () => {
    const result = await search({ latitude: 40.71 } as GeolocationCoordinates);

    expect(result).toEqual({});
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should return forecast and location for valid coordinates', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => mockGridpointResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockForecastResponse,
      });

    const result = await search({ latitude: 40.7128, longitude: -74.006 } as GeolocationCoordinates);

    expect(result).toEqual({
      forecast: mockForecastResponse.properties,
      location: mockGridpointResponse.properties.relativeLocation.properties,
    });
  });

  it('should round coordinates to 2 decimal places', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => mockGridpointResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockForecastResponse,
      });

    await search({ latitude: 40.71289876, longitude: -74.00601234 } as GeolocationCoordinates);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.weather.gov/points/40.71,-74.01'
    );
  });

  it('should return error when gridpoint API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({}),
    });

    const result = await search({ latitude: 40.71, longitude: -74.01 } as GeolocationCoordinates);

    expect(result).toEqual({ error: 'Gridpoint Server could not be reached' });
  });

  it('should return error when forecast endpoint is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        properties: {
          relativeLocation: { properties: {} },
        },
      }),
    });

    const result = await search({ latitude: 40.71, longitude: -74.01 } as GeolocationCoordinates);

    expect(result).toEqual({ error: 'Gridpoints for Location not found' });
  });

  it('should return error when forecast API returns empty', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => mockGridpointResponse,
      })
      .mockResolvedValueOnce({
        json: async () => null,
      });

    const result = await search({ latitude: 40.71, longitude: -74.01 } as GeolocationCoordinates);

    expect(result).toEqual({ error: 'Forecast Server could not be reached' });
  });

  it('should return error when forecast properties are missing', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => mockGridpointResponse,
      })
      .mockResolvedValueOnce({
        json: async () => ({}),
      });

    const result = await search({ latitude: 40.71, longitude: -74.01 } as GeolocationCoordinates);

    expect(result).toEqual({ error: 'Forecast for Location not found' });
  });
});
