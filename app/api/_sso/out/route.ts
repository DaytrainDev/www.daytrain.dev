import { signOut } from "@/lib/common/controllers/sso";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = signOut(request);

  return NextResponse.json(response);
}
