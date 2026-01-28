import { search } from '@/lib/services/geocode';

describe('geocode service', () => {
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should return latitude and longitude for valid location', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ latt: '40.7128', longt: '-74.0060' }),
    });

    const result = await search('New York, NY');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('geocode.xyz')
    );
    expect(result).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    });
  });

  it('should return error when geocode returns NaN latitude', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ latt: 'Throttled', longt: 'Throttled' }),
    });

    const result = await search('Invalid Location');

    expect(result).toEqual({
      error: 'Geocode for Location not Found',
    });
  });

  it('should return error when geocode returns undefined coordinates', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({}),
    });

    const result = await search('Unknown Place');

    expect(result).toEqual({
      error: 'Geocode for Location not Found',
    });
  });

  it('should URL encode the search text', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ latt: '34.0522', longt: '-118.2437' }),
    });

    await search('Los Angeles, CA');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('Los%20Angeles%2C%20CA')
    );
  });

  it('should include US region in request', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ latt: '41.8781', longt: '-87.6298' }),
    });

    await search('Chicago');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("region='US'")
    );
  });
});
