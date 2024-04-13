import AiController from "@/lib/controllers/openai";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authConfig from "@/lib/config/auth";

export const GET = async (request: NextRequest) => {
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);
  
  const user = queryParams.get('user') ?? 'user';
  const prompt = queryParams.get('prompt');

  if (!prompt) {
    return new Response('Prompt is required.', { status: 400 });
  }

  const response = await AiController.imagine({ prompt, user });
  
  return NextResponse.json(response);
    return NextResponse.json(response);
};

export const POST = async (request: NextRequest) => {
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const data = await request.json();
  const response = await AiController.imagine(data);

  return NextResponse.json(response);
};