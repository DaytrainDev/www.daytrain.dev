import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from '@/lib/services/openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
}

export interface ChatResponse {
  message?: ChatMessage;
  error?: string;
}

const SYSTEM_PROMPT = process.env.OPENAI_BASE_PROMPT || 'You are a helpful assistant.';

/**
 * Chat API endpoint
 *
 * POST /api/chat
 * Body: { messages: ChatMessage[], model?: string }
 *
 * Returns: { message: ChatMessage } or { error: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { messages, model = 'gpt-3.5-turbo' } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'Messages array is required' },
      { status: 400 }
    );
  }

  // Validate message format
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return NextResponse.json(
        { error: 'Each message must have role and content' },
        { status: 400 }
      );
    }
    if (!['system', 'user', 'assistant'].includes(msg.role)) {
      return NextResponse.json(
        { error: 'Invalid message role. Must be system, user, or assistant' },
        { status: 400 }
      );
    }
  }

  // Prepend system message if not already present
  const messagesWithSystem: ChatMessage[] = messages[0]?.role === 'system'
    ? messages
    : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

  try {
    const response = await OpenAI.chat.completions.create({
      model,
      messages: messagesWithSystem,
      user: session.user.email,
      max_tokens: 1000,
    });

    const assistantMessage = response.choices?.[0]?.message;

    if (!assistantMessage?.content) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: assistantMessage.content,
      },
    });
  } catch (err) {
    console.error('[Chat API] Error:', err);

    if (err instanceof Error) {
      if (err.message.includes('context_length_exceeded')) {
        return NextResponse.json(
          { error: 'Conversation too long. Please start a new chat.' },
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
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}
