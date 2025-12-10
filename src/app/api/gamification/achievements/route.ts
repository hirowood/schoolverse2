import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { getAchievements } from "@/lib/gamification/achievement-service";
import type { AchievementCategory, AchievementStatusFilter } from "@/types/gamification";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = (searchParams.get("category") as AchievementCategory | null) ?? "all";
  const status = (searchParams.get("status") as AchievementStatusFilter | null) ?? "all";

  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const { achievements, summary } = await getAchievements(user.id, { category, status });
    return NextResponse.json({ summary, achievements });
  } catch (error) {
    console.error("GET /api/gamification/achievements error", error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
