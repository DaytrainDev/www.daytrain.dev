
import { search } from "@/lib/services/weather";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const searchText = `${request.nextUrl.searchParams?.get("search")}`;
  return NextResponse.json(await search(searchText));
};

export const POST = async (request: NextRequest) => {
  const searchText = (await request.json())?.search;
  return NextResponse.json(await search(searchText));
};