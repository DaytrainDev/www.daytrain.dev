import { signIn } from "@/lib/common/controllers/sso";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = signIn(request);

  return NextResponse.json(response);
}
