import AiController from "@/lib/controllers/openai";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authConfig from "@/lib/config/auth";
import { CreateImageRequestSizeEnum } from "openai-edge";

export const GET = async (request: NextRequest) => {
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);
  
  const user = queryParams.get('user') ?? session.user?.email ?? session.user?.discord?.id;
  const prompt = queryParams.get('prompt');

  if (!prompt) {
    return new Response('Prompt is required.', { status: 400 });
  }

  const response = await AiController.imagen({ prompt, user, size: CreateImageRequestSizeEnum._1024x1024 });
  
  return NextResponse.json(response);
};

export const POST = async (request: NextRequest) => {
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const data = await request.json();
  data.user = data.user ?? session.user?.email ?? session.user?.discord?.id;
  
  const response = await AiController.imagen(data);

  return NextResponse.json(response);
};