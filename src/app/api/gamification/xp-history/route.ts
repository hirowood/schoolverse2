import { NextResponse } from "next/server";
import { mockXpHistoryResponse } from "@/lib/gamification/mock-data";

export async function GET() {
  return NextResponse.json(mockXpHistoryResponse);
}
