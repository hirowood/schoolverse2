import { NextResponse } from "next/server";
import { mockTodayQuestsResponse } from "@/lib/quests/mock-data";

export async function GET() {
  return NextResponse.json(mockTodayQuestsResponse);
}
