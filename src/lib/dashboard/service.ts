import { prisma } from "@/lib/prisma";
import { DashboardSummary } from "@/lib/dashboard/types";
import { CREDO_ITEMS } from "@/features/credo/config";
import { getRequiredXpForLevel } from "@/lib/gamification/level-system";

const getJstDayRange = (baseDate = new Date()) => {
  const jp = new Date(baseDate.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const start = new Date(Date.UTC(jp.getFullYear(), jp.getMonth(), jp.getDate()));
  const end = new Date(Date.UTC(jp.getFullYear(), jp.getMonth(), jp.getDate() + 1));
  return { start, end };
};

const defaultGameProfile = {
  level: 1,
  currentXp: 0,
  requiredXp: getRequiredXpForLevel(1),
  coins: 0,
  gems: 0,
  streak: 0,
  rank: "beginner",
  name: undefined,
};

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const { start, end } = getJstDayRange();

  const [
    gameProfileRow,
    learningStats,
    quests,
    tasks,
    credoLogs,
    achievementsDone,
    claimableCount,
    achievementsNear,
    dailyCondition,
  ] = await Promise.all([
    prisma.userGameProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true } },
      },
    }),
    prisma.userLearningStats.findUnique({
      where: { userId },
    }),
    prisma.aIGeneratedQuest.findMany({
      where: { userId, date: { gte: start, lt: end } },
      orderBy: [{ priority: "desc" }, { order: "asc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        xpReward: true,
        estimatedMinutes: true,
        priority: true,
        order: true,
        acceptedAt: true,
        startedAt: true,
        completedAt: true,
        skippedAt: true,
      },
    }),
    prisma.studyTask.findMany({
      where: {
        userId,
        parentId: null,
        dueDate: { gte: start, lt: end },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
      },
    }),
    prisma.credoPracticeLog.findMany({
      where: { userId, date: start },
      include: { credo: { select: { title: true } } },
    }),
    prisma.userAchievement.findMany({
      where: { userId, isCompleted: true },
      orderBy: { completedAt: "desc" },
      take: 3,
      include: { achievement: { select: { name: true, icon: true, rarity: true } } },
    }),
    prisma.userAchievement.count({
      where: { userId, isCompleted: true, isRewardClaimed: false },
    }),
    prisma.userAchievement.findMany({
      where: { userId, isCompleted: false },
      take: 10,
      include: {
        achievement: { select: { name: true, conditionValue: true } },
      },
    }),
    prisma.dailyCondition.findFirst({
      where: { userId, date: start },
      select: {
        physicalCondition: true,
        mentalCondition: true,
        motivationLevel: true,
      },
    }),
  ]);

  const gameProfile = gameProfileRow
    ? {
        level: gameProfileRow.level,
        currentXp: gameProfileRow.currentXp,
        requiredXp: getRequiredXpForLevel(gameProfileRow.level),
        coins: gameProfileRow.coins,
        gems: gameProfileRow.gems,
        streak: learningStats?.currentStreak ?? 0,
        rank: gameProfileRow.rank,
        name: gameProfileRow.user?.name ?? undefined,
      }
    : defaultGameProfile;

  const todayQuests = {
    total: quests.length,
    completed: quests.filter((q) => q.status === "completed").length,
    inProgress: quests.filter((q) => q.status === "in_progress").length,
    pending: quests.filter((q) => q.status === "pending" || q.status === "accepted").length,
    skipped: quests.filter((q) => q.status === "skipped").length,
    totalXpEarned: quests.filter((q) => q.status === "completed").reduce((sum, q) => sum + (q.xpReward ?? 0), 0),
    totalXpPossible: quests.reduce((sum, q) => sum + (q.xpReward ?? 0), 0),
    completionRate: quests.length === 0 ? 0 : Math.round((quests.filter((q) => q.status === "completed").length / quests.length) * 100),

    quests: quests.map((q) => {
      const progressPercent =
        q.startedAt && q.estimatedMinutes
          ? Math.min(
              100,
              Math.round(
                (Math.max(
                  0,
                  Math.min(
                    q.estimatedMinutes,
                    Math.round((Date.now() - q.startedAt.getTime()) / 60000),
                  ),
                ) /
                  q.estimatedMinutes) *
                  100,
              ),
            )
          : undefined;
      return {
        id: q.id,
        title: q.title,
        category: q.category,
        status: q.status as DashboardSummary["todayQuests"]["quests"][number]["status"],
        xpReward: q.xpReward,
        progressPercent,
      };
    }),
  };

  const todayTasks = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "done").length,
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      dueDate: t.dueDate?.toISOString() ?? null,
    })),
  };

  const logsById = new Map<string, boolean>();
  credoLogs.forEach((log) => logsById.set(log.credoId, log.done));
  const credoProgress = {
    total: CREDO_ITEMS.length,
    practiced: credoLogs.filter((l) => l.done).length,
    items: CREDO_ITEMS.map((item) => ({
      id: item.id,
      title: item.title,
      done: logsById.get(item.id) ?? false,
    })),
  };

  const recentAchievements = {
    unlocked: achievementsDone.map((a) => ({
      id: a.id,
      name: a.achievement.name,
      icon: a.achievement.icon,
      rarity: a.achievement.rarity,
      completedAt: a.completedAt?.toISOString() ?? null,
    })),
    claimable: claimableCount,
    nearCompletion: achievementsNear
      .map((a) => {
        const percent = a.achievement.conditionValue
          ? Math.round((a.currentProgress / a.achievement.conditionValue) * 100)
          : 0;
        return {
          id: a.id,
          name: a.achievement.name,
          progressPercent: percent,
        };
      })
      .filter((a) => a.progressPercent >= 70)
      .sort((a, b) => b.progressPercent - a.progressPercent)
      .slice(0, 3),
  };

  return {
    gameProfile,
    todayQuests,
    todayTasks,
    credoProgress,
    recentAchievements,
    dailyCondition: dailyCondition
      ? {
          physicalCondition: dailyCondition.physicalCondition,
          mentalCondition: dailyCondition.mentalCondition,
          motivationLevel: dailyCondition.motivationLevel,
        }
      : undefined,
  };
}
