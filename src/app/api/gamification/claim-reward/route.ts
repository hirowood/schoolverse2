import { NextResponse } from "next/server";
import { mockAchievementsResponse, mockProfileResponse } from "@/lib/gamification/mock-data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { achievementId?: string } | null;
  const achievementId = body?.achievementId;

  if (!achievementId) {
    return NextResponse.json({ success: false, message: "achievementId is required" }, { status: 400 });
  }

  const target = mockAchievementsResponse.achievements.find((item) => item.id === achievementId);
  if (!target) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const xpGain = target.xpReward ?? 0;
  const coinGain = target.coinReward ?? 0;

  let level = mockProfileResponse.profile.level;
  let currentXp = mockProfileResponse.profile.currentXp + xpGain;
  let xpToNextLevel = mockProfileResponse.profile.xpToNextLevel;
  const totalXp = mockProfileResponse.profile.totalXp + xpGain;

  if (currentXp >= xpToNextLevel) {
    level += 1;
    currentXp -= xpToNextLevel;
    xpToNextLevel += 300;
  }

  const updatedProfile = {
    ...mockProfileResponse.profile,
    level,
    currentXp,
    totalXp,
    xpToNextLevel,
    coins: mockProfileResponse.profile.coins + coinGain,
  };

  return NextResponse.json({
    success: true,
    rewards: { xp: xpGain, coins: coinGain, title: target.titleReward ?? null },
    updatedProfile,
    levelUp: level > mockProfileResponse.profile.level,
  });
}
