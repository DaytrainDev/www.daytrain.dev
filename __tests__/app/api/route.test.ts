import { GET } from '@/app/api/route';

describe('GET /api', () => {
  it('should return "API is Live!" message', async () => {
    const request = new Request('http://localhost:3000/api');
    const response = await GET(request);

    expect(response).toBeInstanceOf(Response);
    const text = await response.text();
    expect(text).toBe('API is Live!');
  });
});
