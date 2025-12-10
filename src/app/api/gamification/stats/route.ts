import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { ensureUser } from "@/lib/gamification/xp-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    await ensureUser(prisma, user.id, user.email, user.name);
    const statsRow = await prisma.userCurriculumStats.findUnique({ where: { userId: user.id } });
    return NextResponse.json({
      stats: {
        currentStreak: statsRow?.currentStreak ?? 0,
        longestStreak: statsRow?.longestStreak ?? 0,
        totalTasksCompleted: 0,
        totalNotesCreated: 0,
        totalChatMessages: 0,
        totalLearningMinutes: Math.floor((statsRow?.totalTimeSpentSec ?? 0) / 60),
      },
    });
  } catch (error) {
    console.error("GET /api/gamification/stats error", error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
