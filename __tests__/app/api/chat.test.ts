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
    chat: {
      completions: {
        create: jest.fn(),
      },
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
import { POST } from '@/app/api/chat/route';

const mockOpenAI = OpenAI as jest.Mocked<typeof OpenAI>;

describe('POST /api/chat', () => {
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

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
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

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
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

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON body');
    });

    it('should return 400 when messages array is missing', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Messages array is required');
    });

    it('should return 400 when messages array is empty', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Messages array is required');
    });

    it('should return 400 for invalid message format', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user' }] }), // missing content
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Each message must have role and content');
    });

    it('should return 400 for invalid message role', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'invalid', content: 'Hello' }] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid message role. Must be system, user, or assistant');
    });
  });

  describe('Chat completion', () => {
    it('should return assistant message on success', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValueOnce({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?',
            },
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message.role).toBe('assistant');
      expect(data.message.content).toBe('Hello! How can I help you today?');
    });

    it('should use custom model when specified', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValueOnce({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Response from GPT-4',
            },
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'gpt-4',
        }),
      });

      await POST(request);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
        })
      );
    });

    it('should prepend system message if not present', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValueOnce({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Response',
            },
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      });

      await POST(request);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
          ]),
        })
      );
    });

    it('should return 500 when no response generated', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValueOnce({
        choices: [],
      });

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('No response generated');
    });

    it('should handle rate limit errors', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValueOnce(
        new Error('rate_limit exceeded')
      );

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded. Please try again later.');
    });

    it('should handle context length exceeded errors', async () => {
      mockGetServerSession.mockResolvedValueOnce(authenticatedSession);
      (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValueOnce(
        new Error('context_length_exceeded')
      );

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Conversation too long. Please start a new chat.');
    });
  });
});
