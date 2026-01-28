import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from '@/lib/services/openai';

export interface ImagenRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024';
  n?: number;
}

export interface ImagenResponse {
  url?: string;
  revised_prompt?: string;
  error?: string;
}

/**
 * Image Generation API endpoint
 *
 * POST /api/imagen
 * Body: { prompt: string, size?: '256x256' | '512x512' | '1024x1024', n?: number }
 *
 * Returns: { url: string, revised_prompt?: string } or { error: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse<ImagenResponse>> {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  let body: ImagenRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { prompt, size = '512x512', n = 1 } = body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: 'Prompt is required' },
      { status: 400 }
    );
  }

  if (prompt.length > 4000) {
    return NextResponse.json(
      { error: 'Prompt must be 4000 characters or less' },
      { status: 400 }
    );
  }

  const validSizes = ['256x256', '512x512', '1024x1024'];
  if (!validSizes.includes(size)) {
    return NextResponse.json(
      { error: 'Invalid size. Must be 256x256, 512x512, or 1024x1024' },
      { status: 400 }
    );
  }

  try {
    const response = await OpenAI.images.generate({
      prompt: prompt.trim(),
      n: Math.min(Math.max(1, n), 4), // Clamp between 1-4
      size: size,
      user: session.user.email,
    });

    const image = response.data?.[0];

    if (!image?.url) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: image.url,
      revised_prompt: image.revised_prompt,
    });
  } catch (err) {
    console.error('[Imagen API] Error:', err);

    // Handle OpenAI specific errors
    if (err instanceof Error) {
      if (err.message.includes('content_policy_violation')) {
        return NextResponse.json(
          { error: 'Your request was rejected due to content policy. Please try a different prompt.' },
          { status: 400 }
        );
      }
      if (err.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
}
