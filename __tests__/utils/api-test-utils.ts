import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

// Re-export the mocked getServerSession for type safety
export const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Mock session data
export const mockAuthenticatedSession = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.png',
  },
  expires: '2099-12-31T23:59:59.999Z',
};

export const mockUnauthenticatedSession = null;

/**
 * Helper to set up an authenticated session for tests
 */
export function mockAuthenticated(session = mockAuthenticatedSession) {
  mockGetServerSession.mockResolvedValueOnce(session);
}

/**
 * Helper to set up an unauthenticated session for tests
 */
export function mockUnauthenticated() {
  mockGetServerSession.mockResolvedValueOnce(mockUnauthenticatedSession);
}

/**
 * Create a mock NextRequest for API testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = 'GET', body, searchParams } = options;

  let fullUrl = url;
  if (searchParams) {
    const params = new URLSearchParams(searchParams);
    fullUrl = `${url}?${params.toString()}`;
  }

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(fullUrl, requestInit);
}

/**
 * Create a Request object for API testing (used with non-NextRequest routes)
 */
export function createRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
  } = {}
): Request {
  const { method = 'GET', body } = options;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(url, requestInit);
}

/**
 * Extract JSON response data from NextResponse
 */
export async function getResponseData<T = unknown>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

/**
 * Common test assertions for auth-required endpoints
 */
export function expectUnauthorized(response: Response) {
  expect(response.status).toBe(401);
}

export function expectBadRequest(response: Response) {
  expect(response.status).toBe(400);
}

export function expectSuccess(response: Response) {
  expect(response.status).toBe(200);
}
