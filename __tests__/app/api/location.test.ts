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
import { GET } from '@/app/api/location/route';

const mockGeo = mockGeoSearch as jest.MockedFunction<typeof mockGeoSearch>;

describe('GET /api/location', () => {
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

      const request = new NextRequest('http://localhost:3000/api/location?q=Denver');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('Query parameter validation', () => {
    it('should return 400 when no query provided', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/location');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please provide a search query (q parameter)');
    });

    it('should return 400 when query is too short', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/location?q=A');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Please provide a search query (q parameter)');
    });
  });

  describe('Location search', () => {
    it('should return location data for valid query', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      mockGeo.mockResolvedValueOnce({
        latitude: 39.7392,
        longitude: -104.9903,
        display_name: 'Denver, Colorado, USA',
      });

      const request = new NextRequest('http://localhost:3000/api/location?q=Denver,CO');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.latitude).toBe(39.7392);
      expect(data.longitude).toBe(-104.9903);
      expect(data.display_name).toBe('Denver, Colorado, USA');
      expect(mockGeo).toHaveBeenCalledWith('Denver,CO');
    });

    it('should return error when location not found', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      mockGeo.mockResolvedValueOnce({
        error: 'Location not found',
      });

      const request = new NextRequest('http://localhost:3000/api/location?q=InvalidLocation12345');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Location not found');
    });

    it('should handle geocode service errors', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      mockGeo.mockResolvedValueOnce({
        error: 'Geocoding service unavailable',
      });

      const request = new NextRequest('http://localhost:3000/api/location?q=Denver');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Geocoding service unavailable');
    });
  });
});
