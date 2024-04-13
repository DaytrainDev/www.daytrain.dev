import AiController from "@/lib/controllers/openai";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionRequestMessage } from "openai-edge";
import authConfig from "@/lib/config/auth";

export const GET = async (request: NextRequest) => {
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);
  
  const user = queryParams.get('user') ?? 'user';
  const messagesRaw = queryParams.get('messages');

  if (!messagesRaw) {
    return new Response('Messages are required.', { status: 400 });
  }

  const messages: ChatCompletionRequestMessage[] = JSON.parse(messagesRaw);
  const response = await AiController.chat({ messages, user });

  return NextResponse.json(response);
};

export const POST = async (request: NextRequest) => {
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const data = await request.json();
  const response = await AiController.chat(data);
  
  return NextResponse.json(response);
};