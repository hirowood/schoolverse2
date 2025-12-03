import { NextResponse } from "next/server";
import { CURRICULUM_MAP } from "@/lib/curriculum/map";

export async function GET() {
  return NextResponse.json({ success: true, data: CURRICULUM_MAP });
}
