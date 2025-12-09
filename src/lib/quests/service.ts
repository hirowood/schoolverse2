import { prisma } from "@/lib/prisma";
import { QUEST_CATEGORIES, type QuestCategory } from "@/lib/constants/quest-categories";
import type {
  CompleteQuestPayload,
  QuestActionResponse,
  QuestDifficulty,
  TodayQuest,
  TodayQuestsResponse,
} from "@/types/quest";
import { addDays } from "@/features/plan/utils/date";
import { getRequiredXpForLevel } from "@/lib/gamification/level-system";

const DIFFICULTY_META: Record<QuestDifficulty, { label: string }> = {
  easy: { label: "かんたん" },
  medium: { label: "ふつう" },
  hard: { label: "むずかしい" },
};

const getJstRange = (base = new Date()) => {
  const jp = new Date(base.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const start = new Date(Date.UTC(jp.getFullYear(), jp.getMonth(), jp.getDate()));
  const end = new Date(Date.UTC(jp.getFullYear(), jp.getMonth(), jp.getDate() + 1));
  return { start, end };
};

const toTodayQuest = (quest: any): TodayQuest => {
  const category = (quest.category ?? "learning") as QuestCategory;
  const catMeta = QUEST_CATEGORIES[category];
  const difficulty = (quest.difficulty ?? "easy") as QuestDifficulty;
  const diffMeta = DIFFICULTY_META[difficulty] ?? DIFFICULTY_META.easy;

  const startedAt = quest.startedAt ? new Date(quest.startedAt).toISOString() : undefined;
  const elapsedMinutes =
    startedAt && quest.estimatedMinutes
      ? Math.max(
          0,
          Math.min(
            quest.estimatedMinutes,
            Math.round((Date.now() - new Date(quest.startedAt).getTime()) / 60000),
          ),
        )
      : undefined;
  const progressPercent =
    quest.progressPercent ??
    (quest.estimatedMinutes && elapsedMinutes !== undefined
      ? Math.min(100, Math.round((elapsedMinutes / quest.estimatedMinutes) * 100))
      : undefined);

  return {
    id: quest.id,
    title: quest.title,
    description: quest.description,
    category,
    categoryLabel: catMeta?.name ?? "クエスト",
    categoryIcon: catMeta?.icon ?? "🎯",
    difficulty,
    difficultyLabel: diffMeta.label,
    estimatedMinutes: quest.estimatedMinutes ?? 0,
    xpReward: quest.xpReward ?? 0,
    bonusXp: quest.bonusXp ?? undefined,
    reason: quest.reason ?? undefined,
    tips: quest.tips ?? undefined,
    relatedGoal: quest.relatedGoal ?? undefined,
    relatedCredo: quest.relatedCredo ?? undefined,
    priority: quest.priority ?? 0,
    order: quest.order ?? 0,
    status: quest.status,
    acceptedAt: quest.acceptedAt ? new Date(quest.acceptedAt).toISOString() : undefined,
    startedAt,
    completedAt: quest.completedAt ? new Date(quest.completedAt).toISOString() : undefined,
    skippedAt: quest.skippedAt ? new Date(quest.skippedAt).toISOString() : undefined,
    completionNote: quest.completionNote ?? undefined,
    completionRating: quest.completionRating ?? undefined,
    actualMinutes: quest.actualMinutes ?? undefined,
    skippedReason: quest.skippedReason ?? undefined,
    elapsedMinutes,
    progressPercent,
  };
};

export async function getTodayQuests(userId: string): Promise<TodayQuestsResponse> {
  const { start, end } = getJstRange();

  const [quests, learningStats] = await Promise.all([
    prisma.aIGeneratedQuest.findMany({
      where: { userId, date: { gte: start, lt: end } },
      orderBy: [{ priority: "desc" }, { order: "asc" }],
    }),
    prisma.userLearningStats.findUnique({ where: { userId } }),
  ]);

  const questsMapped = quests.map(toTodayQuest);
  const total = questsMapped.length;
  const completed = questsMapped.filter((q) => q.status === "completed").length;
  const inProgress = questsMapped.filter((q) => q.status === "in_progress").length;
  const pending = questsMapped.filter((q) => q.status === "pending" || q.status === "accepted").length;
  const skipped = questsMapped.filter((q) => q.status === "skipped").length;
  const totalXpEarned = questsMapped.filter((q) => q.status === "completed").reduce((sum, q) => sum + (q.xpReward ?? 0), 0);
  const totalXpPossible = questsMapped.reduce((sum, q) => sum + (q.xpReward ?? 0), 0);
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const jpNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const remainingHours = Math.max(0, 24 - jpNow.getHours());

  return {
    quests: questsMapped,
    summary: {
      total,
      completed,
      inProgress,
      pending,
      skipped,
      totalXpEarned,
      totalXpPossible,
      completionRate,
      streak: learningStats?.currentStreak ?? 0,
      remainingHours,
    },
    generatedAt: start.toISOString(),
    canRegenerate: true,
    regenerateRemaining: 3,
  };
}

const ensureOwnQuest = async (userId: string, questId: string) => {
  const quest = await prisma.aIGeneratedQuest.findUnique({ where: { id: questId } });
  if (!quest) throw new Error("NOT_FOUND");
  if (quest.userId !== userId) throw new Error("FORBIDDEN");
  return quest;
};

export async function acceptQuest(userId: string, questId: string): Promise<QuestActionResponse> {
  const quest = await ensureOwnQuest(userId, questId);
  if (quest.status !== "pending") throw new Error("INVALID_STATE");
  const updated = await prisma.aIGeneratedQuest.update({
    where: { id: questId },
    data: { status: "accepted", acceptedAt: new Date() },
  });
  return { success: true, quest: toTodayQuest(updated) };
}

export async function startQuest(userId: string, questId: string): Promise<QuestActionResponse> {
  const quest = await ensureOwnQuest(userId, questId);
  if (quest.status === "completed" || quest.status === "skipped") throw new Error("INVALID_STATE");
  if (quest.status === "in_progress") return { success: true, quest: toTodayQuest(quest) };
  const updated = await prisma.aIGeneratedQuest.update({
    where: { id: questId },
    data: { status: "in_progress", startedAt: new Date() },
  });
  return { success: true, quest: toTodayQuest(updated) };
}

const applyXp = async (userId: string, xp: number, quest: { id: string; title: string; category: string }) => {
  return prisma.$transaction(async (tx) => {
    const profile = await tx.userGameProfile.findUnique({ where: { userId } });
    const current = profile ?? (await tx.userGameProfile.create({ data: { userId } }));
    let level = current.level;
    let currentXp = current.currentXp + xp;
    let totalXp = current.totalXp + xp;
    let requiredXp = getRequiredXpForLevel(level);
    let levelUp = false;
    while (currentXp >= requiredXp) {
      currentXp -= requiredXp;
      level += 1;
      requiredXp = getRequiredXpForLevel(level);
      levelUp = true;
    }
    await tx.userGameProfile.update({
      where: { userId },
      data: {
        level,
        currentXp,
        totalXp,
        rank: current.rank,
        coins: current.coins,
        gems: current.gems,
      },
    });
    await tx.xpTransaction.create({
      data: {
        userId,
        amount: xp,
        source: "quest_complete",
        sourceId: quest.id,
        category: quest.category,
        description: quest.title,
      },
    });
    return { levelUp, level };
  });
};

export async function completeQuest(
  userId: string,
  questId: string,
  payload?: CompleteQuestPayload,
): Promise<QuestActionResponse> {
  const quest = await ensureOwnQuest(userId, questId);
  if (quest.status === "completed") return { success: true, quest: toTodayQuest(quest) };
  const updated = await prisma.aIGeneratedQuest.update({
    where: { id: questId },
    data: {
      status: "completed",
      completedAt: new Date(),
      completionNote: payload?.note ?? undefined,
      completionRating: payload?.rating ?? undefined,
      actualMinutes: payload?.actualMinutes ?? undefined,
    },
  });

  const xpEarned = (quest.xpReward ?? 0) + (quest.bonusXp ?? 0);
  const xpResult = await applyXp(userId, xpEarned, { id: quest.id, title: quest.title, category: quest.category });

  return {
    success: true,
    quest: toTodayQuest(updated),
    xpEarned,
    levelUp: xpResult.levelUp,
    newLevel: xpResult.levelUp ? xpResult.level : undefined,
    newAchievements: [],
  };
}

export async function skipQuest(userId: string, questId: string, reason?: string): Promise<QuestActionResponse> {
  const quest = await ensureOwnQuest(userId, questId);
  if (quest.status === "completed") throw new Error("INVALID_STATE");
  const updated = await prisma.aIGeneratedQuest.update({
    where: { id: questId },
    data: { status: "skipped", skippedAt: new Date(), skippedReason: reason ?? undefined },
  });
  return { success: true, quest: toTodayQuest(updated) };
}
