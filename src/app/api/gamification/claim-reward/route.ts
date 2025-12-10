import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { ensureGameProfile, ensureUser, getProfile } from "@/lib/gamification/xp-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ success: false, message: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { achievementId?: string } | null;
  const achievementId = body?.achievementId;

  if (!achievementId) {
    return NextResponse.json({ success: false, message: "achievementId is required" }, { status: 400 });
  }

  try {
    await ensureUser(prisma, user.id, user.email, user.name);
    const achievement = await prisma.achievementDefinition.findUnique({ where: { slug: achievementId } });
    if (!achievement) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const profile = await ensureGameProfile(prisma, user.id);
    const userAchievement = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId: user.id, achievementId: achievement.id } },
    });

    if (!userAchievement || !userAchievement.isCompleted) {
      return NextResponse.json({ success: false, message: "not_completed" }, { status: 400 });
    }

    if (!userAchievement.isRewardClaimed) {
      await prisma.$transaction(async (tx) => {
        await tx.userAchievement.update({
          where: { id: userAchievement.id },
          data: { isRewardClaimed: true },
        });
        if ((achievement.coinReward ?? 0) > 0) {
          await tx.userGameProfile.update({
            where: { id: profile.id },
            data: { coins: { increment: achievement.coinReward ?? 0 } },
          });
        }
      });
    }

    const updatedProfile = await getProfile(user.id);

    return NextResponse.json({
      success: true,
      rewards: { xp: 0, coins: achievement.coinReward ?? 0, title: achievement.titleReward ?? null },
      updatedProfile,
      levelUp: false,
    });
  } catch (error) {
    console.error("POST /api/gamification/claim-reward error", error);
    return NextResponse.json({ success: false, message: "internal_error" }, { status: 500 });
  }
}
