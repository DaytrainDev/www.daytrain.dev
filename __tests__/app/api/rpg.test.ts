import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock Neon database
jest.mock('@/lib/db/neon', () => ({
  getSql: jest.fn(),
}));

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    nextUrl: URL;
    private _body: string;
    constructor(url: string, init?: { method?: string; body?: string }) {
      this.nextUrl = new URL(url);
      this._body = init?.body || '';
    }
    async json() {
      return JSON.parse(this._body);
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

import { getSql } from '@/lib/db/neon';
import { GET, POST } from '@/app/api/rpg/[[...path]]/route';

const mockGetSql = getSql as jest.MockedFunction<typeof getSql>;

describe('RPG API', () => {
  const authenticatedSession = {
    user: { name: 'Test User', email: 'test@example.com', image: 'https://example.com/avatar.png' },
    expires: '2099-12-31',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET endpoints', () => {
    describe('/api/rpg/session', () => {
      it('should return unauthenticated when no session', async () => {
        mockGetServerSession.mockResolvedValueOnce(null);

        const request = new NextRequest('http://localhost:3000/api/rpg/session');
        const response = await GET(request, { params: { path: ['session'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.authenticated).toBe(false);
        expect(data.user).toBeNull();
      });

      it('should return user info when authenticated', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

        const request = new NextRequest('http://localhost:3000/api/rpg/session');
        const response = await GET(request, { params: { path: ['session'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.authenticated).toBe(true);
        expect(data.user.name).toBe('Test User');
        expect(data.user.image).toBe('https://example.com/avatar.png');
      });
    });

    describe('/api/rpg/config', () => {
      it('should return config and server time', async () => {
        mockGetServerSession.mockResolvedValueOnce(null);

        const request = new NextRequest('http://localhost:3000/api/rpg/config');
        const response = await GET(request, { params: { path: ['config'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.version).toBe('1.0.0');
        expect(data.serverTime).toBeDefined();
      });
    });

    describe('/api/rpg/ping', () => {
      it('should return pong with timestamp', async () => {
        mockGetServerSession.mockResolvedValueOnce(null);

        const request = new NextRequest('http://localhost:3000/api/rpg/ping');
        const response = await GET(request, { params: { path: ['ping'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.pong).toBe(true);
        expect(data.timestamp).toBeDefined();
      });
    });

    describe('/api/rpg/saves', () => {
      it('should return 401 when not authenticated', async () => {
        mockGetServerSession.mockResolvedValueOnce(null);

        const request = new NextRequest('http://localhost:3000/api/rpg/saves');
        const response = await GET(request, { params: { path: ['saves'] } });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Authentication required');
      });

      it('should return user saves when authenticated', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
        const mockSql = jest.fn().mockResolvedValueOnce([
          { slot: 1, playtime: 3600, updated_at: '2024-01-01T00:00:00Z' },
          { slot: 2, playtime: 7200, updated_at: '2024-01-02T00:00:00Z' },
        ]);
        mockGetSql.mockReturnValueOnce(mockSql as unknown as ReturnType<typeof getSql>);

        const request = new NextRequest('http://localhost:3000/api/rpg/saves');
        const response = await GET(request, { params: { path: ['saves'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.saves).toHaveLength(2);
        expect(data.saves[0].slot).toBe(1);
      });
    });

    describe('/api/rpg/global', () => {
      it('should return 400 when key is missing', async () => {
        mockGetServerSession.mockResolvedValueOnce(null);

        const request = new NextRequest('http://localhost:3000/api/rpg/global');
        const response = await GET(request, { params: { path: ['global'] } });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Key parameter required');
      });

      it('should return global data for key', async () => {
        mockGetServerSession.mockResolvedValueOnce(null);
        const mockSql = jest.fn().mockResolvedValueOnce([
          { value: { leaderboard: [{ name: 'Player1', score: 100 }] } },
        ]);
        mockGetSql.mockReturnValueOnce(mockSql as unknown as ReturnType<typeof getSql>);

        const request = new NextRequest('http://localhost:3000/api/rpg/global?key=leaderboard');
        const response = await GET(request, { params: { path: ['global'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.key).toBe('leaderboard');
        expect(data.value.leaderboard).toBeDefined();
      });

      it('should return null for non-existent key', async () => {
        mockGetServerSession.mockResolvedValueOnce(null);
        const mockSql = jest.fn().mockResolvedValueOnce([]);
        mockGetSql.mockReturnValueOnce(mockSql as unknown as ReturnType<typeof getSql>);

        const request = new NextRequest('http://localhost:3000/api/rpg/global?key=nonexistent');
        const response = await GET(request, { params: { path: ['global'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.key).toBe('nonexistent');
        expect(data.value).toBeNull();
      });
    });

    describe('/api/rpg/unknown', () => {
      it('should return 404 for unknown endpoint', async () => {
        mockGetServerSession.mockResolvedValueOnce(null);

        const request = new NextRequest('http://localhost:3000/api/rpg/unknown');
        const response = await GET(request, { params: { path: ['unknown'] } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Endpoint not found');
      });
    });
  });

  describe('POST endpoints', () => {
    describe('Authentication', () => {
      it('should return 401 for all POST requests when not authenticated', async () => {
        mockGetServerSession.mockResolvedValueOnce(null);

        const request = new NextRequest('http://localhost:3000/api/rpg/save', {
          method: 'POST',
          body: JSON.stringify({ data: {} }),
        });
        const response = await POST(request, { params: { path: ['save'] } });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Authentication required');
      });
    });

    describe('/api/rpg/save', () => {
      it('should return 400 when data is missing', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

        const request = new NextRequest('http://localhost:3000/api/rpg/save', {
          method: 'POST',
          body: JSON.stringify({}),
        });
        const response = await POST(request, { params: { path: ['save'] } });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Save data required');
      });

      it('should save game data successfully', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
        const mockSql = jest.fn().mockResolvedValueOnce([]);
        mockGetSql.mockReturnValueOnce(mockSql as unknown as ReturnType<typeof getSql>);

        const request = new NextRequest('http://localhost:3000/api/rpg/save', {
          method: 'POST',
          body: JSON.stringify({ slot: 1, data: { level: 5 }, playtime: 3600 }),
        });
        const response = await POST(request, { params: { path: ['save'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.slot).toBe(1);
      });
    });

    describe('/api/rpg/load', () => {
      it('should return save data when found', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
        const mockSql = jest.fn().mockResolvedValueOnce([
          { save_data: { level: 5, gold: 100 }, playtime: 3600, updated_at: '2024-01-01T00:00:00Z' },
        ]);
        mockGetSql.mockReturnValueOnce(mockSql as unknown as ReturnType<typeof getSql>);

        const request = new NextRequest('http://localhost:3000/api/rpg/load', {
          method: 'POST',
          body: JSON.stringify({ slot: 1 }),
        });
        const response = await POST(request, { params: { path: ['load'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.level).toBe(5);
        expect(data.playtime).toBe(3600);
      });

      it('should return null when no save found', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
        const mockSql = jest.fn().mockResolvedValueOnce([]);
        mockGetSql.mockReturnValueOnce(mockSql as unknown as ReturnType<typeof getSql>);

        const request = new NextRequest('http://localhost:3000/api/rpg/load', {
          method: 'POST',
          body: JSON.stringify({ slot: 1 }),
        });
        const response = await POST(request, { params: { path: ['load'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeNull();
        expect(data.message).toBe('No save found');
      });
    });

    describe('/api/rpg/delete', () => {
      it('should delete save successfully', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
        const mockSql = jest.fn().mockResolvedValueOnce([]);
        mockGetSql.mockReturnValueOnce(mockSql as unknown as ReturnType<typeof getSql>);

        const request = new NextRequest('http://localhost:3000/api/rpg/delete', {
          method: 'POST',
          body: JSON.stringify({ slot: 1 }),
        });
        const response = await POST(request, { params: { path: ['delete'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Save deleted');
      });
    });

    describe('/api/rpg/event', () => {
      it('should return 400 when event type is missing', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

        const request = new NextRequest('http://localhost:3000/api/rpg/event', {
          method: 'POST',
          body: JSON.stringify({}),
        });
        const response = await POST(request, { params: { path: ['event'] } });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Event type required');
      });

      it('should log event successfully', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
        const mockSql = jest.fn().mockResolvedValueOnce([]);
        mockGetSql.mockReturnValueOnce(mockSql as unknown as ReturnType<typeof getSql>);

        const request = new NextRequest('http://localhost:3000/api/rpg/event', {
          method: 'POST',
          body: JSON.stringify({ type: 'level_up', data: { level: 5 } }),
        });
        const response = await POST(request, { params: { path: ['event'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.logged).toBe(true);
      });
    });

    describe('/api/rpg/global (POST)', () => {
      it('should return 400 when key is missing', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

        const request = new NextRequest('http://localhost:3000/api/rpg/global', {
          method: 'POST',
          body: JSON.stringify({ value: {} }),
        });
        const response = await POST(request, { params: { path: ['global'] } });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Key required');
      });

      it('should set global data successfully', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
        const mockSql = jest.fn().mockResolvedValueOnce([]);
        mockGetSql.mockReturnValueOnce(mockSql as unknown as ReturnType<typeof getSql>);

        const request = new NextRequest('http://localhost:3000/api/rpg/global', {
          method: 'POST',
          body: JSON.stringify({ key: 'config', value: { maxPlayers: 100 } }),
        });
        const response = await POST(request, { params: { path: ['global'] } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.key).toBe('config');
      });
    });

    describe('Invalid JSON', () => {
      it('should return 400 for invalid JSON body', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

        const request = new NextRequest('http://localhost:3000/api/rpg/save', {
          method: 'POST',
          body: 'invalid json',
        });
        const response = await POST(request, { params: { path: ['save'] } });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid JSON body');
      });
    });

    describe('Unknown endpoint', () => {
      it('should return 404 for unknown POST endpoint', async () => {
        mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

        const request = new NextRequest('http://localhost:3000/api/rpg/unknown', {
          method: 'POST',
          body: JSON.stringify({}),
        });
        const response = await POST(request, { params: { path: ['unknown'] } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Endpoint not found');
      });
    });
  });
});
