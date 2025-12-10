import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { ensureGameProfile, ensureUser, getProfile } from "@/lib/gamification/xp-service";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  }

  try {
    await ensureUser(prisma, user.id, user.email, user.name);
    const profile = await ensureGameProfile(prisma, user.id);
    const unclaimed = await prisma.userAchievement.findMany({
      where: { userId: user.id, isCompleted: true, isRewardClaimed: false },
      include: { achievement: true },
    });

    const totalCoins = unclaimed.reduce((sum, item) => sum + (item.achievement.coinReward ?? 0), 0);

    if (unclaimed.length > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.userAchievement.updateMany({
          where: { userId: user.id, isCompleted: true, isRewardClaimed: false },
          data: { isRewardClaimed: true },
        });
        if (totalCoins > 0) {
          await tx.userGameProfile.update({
            where: { id: profile.id },
            data: { coins: { increment: totalCoins } },
          });
        }
      });
    }

    const updatedProfile = await getProfile(user.id);

    return NextResponse.json({
      success: true,
      rewards: { xp: 0, coins: totalCoins },
      updatedProfile,
      levelUp: false,
    });
  } catch (error) {
    console.error("POST /api/gamification/claim-all-rewards error", error);
    return NextResponse.json({ success: false, message: "internal_error" }, { status: 500 });
  }
}
