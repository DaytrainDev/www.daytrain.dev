import AiController from "@/lib/common/controllers/ai";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
    const response = await AiController.chatCompletionGet(request);
    return NextResponse.json(response);
};

export const POST = async (request: NextRequest) => {
    const response = await AiController.chatCompletionPost(request);
    return NextResponse.json(response);
};