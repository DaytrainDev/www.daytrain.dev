
import { search } from "@/lib/services/weather";
import { NextRequest, NextResponse } from "next/server";
import authConfig from "@/lib/config/auth";
import { getServerSession } from "next-auth";

export const GET = async (request: NextRequest) => {
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const searchText = `${request.nextUrl.searchParams?.get("search")}`;
  return NextResponse.json(await search(searchText));
};

export const POST = async (request: NextRequest) => {
  const session = await getServerSession(authConfig);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const searchText = (await request.json())?.search;
  return NextResponse.json(await search(searchText));
};