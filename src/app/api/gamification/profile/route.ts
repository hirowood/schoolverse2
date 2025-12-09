import { NextResponse } from "next/server";
import { mockProfileResponse } from "@/lib/gamification/mock-data";

export async function GET() {
  return NextResponse.json(mockProfileResponse);
}
