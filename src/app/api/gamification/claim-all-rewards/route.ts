import { NextResponse } from "next/server";
import { mockAchievementsResponse, mockProfileResponse } from "@/lib/gamification/mock-data";

export async function POST() {
  const unclaimed = mockAchievementsResponse.achievements.filter(
    (item) => item.isCompleted && !item.isRewardClaimed
  );

  const totalXp = unclaimed.reduce((sum, item) => sum + (item.xpReward ?? 0), 0);
  const totalCoins = unclaimed.reduce((sum, item) => sum + (item.coinReward ?? 0), 0);

  const updatedProfile = {
    ...mockProfileResponse.profile,
    currentXp: mockProfileResponse.profile.currentXp + totalXp,
    totalXp: mockProfileResponse.profile.totalXp + totalXp,
    coins: mockProfileResponse.profile.coins + totalCoins,
  };

  return NextResponse.json({
    success: true,
    rewards: { xp: totalXp, coins: totalCoins },
    updatedProfile,
    levelUp: false,
  });
}
