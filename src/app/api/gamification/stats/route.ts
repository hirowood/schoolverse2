import { NextResponse } from "next/server";
import { mockStats } from "@/lib/gamification/mock-data";

export async function GET() {
  return NextResponse.json({ stats: mockStats });
}
