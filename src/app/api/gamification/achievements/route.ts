import { NextRequest, NextResponse } from "next/server";
import { getAchievementsSummary, mockAchievementsResponse } from "@/lib/gamification/mock-data";
import type { AchievementCategory, AchievementStatusFilter } from "@/types/gamification";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = (searchParams.get("category") as AchievementCategory | null) ?? "all";
  const status = (searchParams.get("status") as AchievementStatusFilter | null) ?? "all";

  let items = [...mockAchievementsResponse.achievements];

  if (category && category !== "all") {
    items = items.filter((item) => item.category === category);
  }
  if (status === "in_progress") {
    items = items.filter((item) => !item.isCompleted);
  } else if (status === "completed") {
    items = items.filter((item) => item.isCompleted);
  } else if (status === "unclaimed") {
    items = items.filter((item) => item.isCompleted && !item.isRewardClaimed);
  }

  return NextResponse.json({
    summary: getAchievementsSummary(items),
    achievements: items,
  });
}
