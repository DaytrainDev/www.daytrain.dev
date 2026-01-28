import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock geocode service
jest.mock('@/lib/services/geocode', () => ({
  search: jest.fn(),
}));

// Mock weather service
jest.mock('@/lib/services/weather', () => ({
  search: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    nextUrl: URL;
    constructor(url: string) {
      this.nextUrl = new URL(url);
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      _data: data,
      status: init?.status || 200,
      async json() {
        return this._data;
      },
    }),
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

import { search as mockGeoSearch } from '@/lib/services/geocode';
import { search as mockWeatherSearch } from '@/lib/services/weather';
import { GET } from '@/app/api/weather/route';

const mockGeo = mockGeoSearch as jest.MockedFunction<typeof mockGeoSearch>;
const mockWeather = mockWeatherSearch as jest.MockedFunction<typeof mockWeatherSearch>;

describe('GET /api/weather', () => {
  const authenticatedSession = {
    user: { name: 'Test User', email: 'test@example.com' },
    expires: '2099-12-31',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/weather?lat=39.7&lon=-104.9');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('Query parameter validation', () => {
    it('should return 400 when no parameters provided', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/weather');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Provide either lat/lon coordinates or q (search query)');
    });

    it('should return 400 for invalid coordinates', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/weather?lat=invalid&lon=-104.9');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid coordinates. lat and lon must be numbers.');
    });
  });

  describe('Coordinate-based weather', () => {
    it('should return weather data for valid coordinates', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      mockWeather.mockResolvedValueOnce({
        temperature: 72,
        description: 'Sunny',
      });

      const request = new NextRequest('http://localhost:3000/api/weather?lat=39.7392&lon=-104.9903');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.temperature).toBe(72);
      expect(mockWeather).toHaveBeenCalledWith({ latitude: 39.7392, longitude: -104.9903 });
    });

    it('should return error when weather service fails', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      mockWeather.mockResolvedValueOnce({
        error: 'Weather data unavailable',
      });

      const request = new NextRequest('http://localhost:3000/api/weather?lat=39.7392&lon=-104.9903');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Weather data unavailable');
    });
  });

  describe('Location search-based weather', () => {
    it('should return weather for a location search', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      mockGeo.mockResolvedValueOnce({
        latitude: 39.7392,
        longitude: -104.9903,
        display_name: 'Denver, CO',
      });
      mockWeather.mockResolvedValueOnce({
        temperature: 68,
        description: 'Partly Cloudy',
      });

      const request = new NextRequest('http://localhost:3000/api/weather?q=Denver,CO');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.temperature).toBe(68);
      expect(mockGeo).toHaveBeenCalledWith('Denver,CO');
    });

    it('should return error when location not found', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      mockGeo.mockResolvedValueOnce({
        error: 'Location not found',
      });

      const request = new NextRequest('http://localhost:3000/api/weather?q=InvalidLocation12345');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Location not found');
    });
  });
});
