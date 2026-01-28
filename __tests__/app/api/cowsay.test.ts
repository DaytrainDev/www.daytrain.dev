import { getServerSession } from 'next-auth';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock next/server to provide a testable NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      _data: data,
      status: init?.status || 200,
      async json() {
        return this._data;
      },
    }),
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Import after mocks are set up
import { POST } from '@/app/api/cowsay/route';

describe('POST /api/cowsay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockGetServerSession.mockResolvedValueOnce(null);

    const request = new Request('http://localhost:3000/api/cowsay', {
      method: 'POST',
      body: JSON.stringify({ cowsay: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('should return cowsay output when authenticated', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { name: 'Test User' },
      expires: '2025-01-01',
    });

    const request = new Request('http://localhost:3000/api/cowsay', {
      method: 'POST',
      body: JSON.stringify({ cowsay: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.output).toContain('Hello');
  });

  it('should return 400 when message is missing', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { name: 'Test User' },
      expires: '2025-01-01',
    });

    const request = new Request('http://localhost:3000/api/cowsay', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Message is required');
  });

  it('should use thinking mode when thinking is true', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { name: 'Test User' },
      expires: '2025-01-01',
    });

    const request = new Request('http://localhost:3000/api/cowsay', {
      method: 'POST',
      body: JSON.stringify({ cowsay: 'Thinking...', thinking: true }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.output).toContain('Thinking...');
  });

  it('should handle custom style', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { name: 'Test User' },
      expires: '2025-01-01',
    });

    const request = new Request('http://localhost:3000/api/cowsay', {
      method: 'POST',
      body: JSON.stringify({ cowsay: 'Moo!', style: 'tux' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.output).toContain('Moo!');
  });

  it('should return 500 on processing error', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { name: 'Test User' },
      expires: '2025-01-01',
    });

    const request = new Request('http://localhost:3000/api/cowsay', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process request');
  });
});
