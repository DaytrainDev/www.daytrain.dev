import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock OpenAI service
jest.mock('@/lib/services/openai', () => ({
  __esModule: true,
  default: {
    images: {
      generate: jest.fn(),
    },
  },
}));

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    private _body: string;
    constructor(_url: string, init?: { method?: string; body?: string }) {
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

import OpenAI from '@/lib/services/openai';
import { POST } from '@/app/api/imagen/route';

const mockOpenAI = OpenAI as jest.Mocked<typeof OpenAI>;

describe('POST /api/imagen', () => {
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

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 401 when session has no email', async () => {
      mockGetServerSession.mockResolvedValueOnce({
        user: { name: 'Test User' },
        expires: '2099-12-31',
      });

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('Request validation', () => {
    it('should return 400 for invalid JSON body', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON body');
    });

    it('should return 400 when prompt is missing', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required');
    });

    it('should return 400 when prompt is empty', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: '   ' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt is required');
    });

    it('should return 400 when prompt exceeds 4000 characters', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'a'.repeat(4001) }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Prompt must be 4000 characters or less');
    });

    it('should return 400 for invalid size', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset', size: '100x100' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid size. Must be 256x256, 512x512, or 1024x1024');
    });
  });

  describe('Image generation', () => {
    it('should return image URL on success', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.images.generate as jest.Mock).mockResolvedValueOnce({
        data: [
          {
            url: 'https://example.com/generated-image.png',
            revised_prompt: 'A beautiful sunset over the ocean',
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe('https://example.com/generated-image.png');
      expect(data.revised_prompt).toBe('A beautiful sunset over the ocean');
    });

    it('should use default size of 512x512', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.images.generate as jest.Mock).mockResolvedValueOnce({
        data: [{ url: 'https://example.com/image.png' }],
      });

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset' }),
      });

      await POST(request);

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          size: '512x512',
        })
      );
    });

    it('should use custom size when specified', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.images.generate as jest.Mock).mockResolvedValueOnce({
        data: [{ url: 'https://example.com/image.png' }],
      });

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset', size: '1024x1024' }),
      });

      await POST(request);

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          size: '1024x1024',
        })
      );
    });

    it('should clamp n value between 1-4', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.images.generate as jest.Mock).mockResolvedValueOnce({
        data: [{ url: 'https://example.com/image.png' }],
      });

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset', n: 10 }),
      });

      await POST(request);

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          n: 4, // clamped to max
        })
      );
    });

    it('should return 500 when no image generated', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.images.generate as jest.Mock).mockResolvedValueOnce({
        data: [],
      });

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('No image generated');
    });

    it('should handle content policy violation', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.images.generate as jest.Mock).mockRejectedValueOnce(
        new Error('content_policy_violation')
      );

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Inappropriate content' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        'Your request was rejected due to content policy. Please try a different prompt.'
      );
    });

    it('should handle rate limit errors', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.images.generate as jest.Mock).mockRejectedValueOnce(
        new Error('rate_limit exceeded')
      );

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded. Please try again later.');
    });

    it('should handle generic errors', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.images.generate as jest.Mock).mockRejectedValueOnce(
        new Error('Unknown error')
      );

      const request = new NextRequest('http://localhost:3000/api/imagen', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A sunset' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate image. Please try again.');
    });
  });
});
