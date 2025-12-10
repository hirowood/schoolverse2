import type { AchievementDefinition, PrismaClient, UserAchievement } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { AchievementWithProgress, AchievementSummary } from "@/types/gamification";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS, type AchievementDefinitionData } from "./achievements-data";
import { calculateProgressPercent } from "./leveling";
import { ensureGameProfile, ensureUser } from "./xp-service";

type TxClient = PrismaClient | Prisma.TransactionClient;

type CurriculumProgressSnapshot = {
  totalLessonsCompleted: number;
  totalTimeSpentSec: number;
  lineProgress: Record<string, { completed: number; total: number }>;
};

export type AchievementUnlock = {
  slug: string;
  name: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  titleReward?: string | null;
};

const CURRICULUM_CONDITIONS = new Set([
  "curriculum_lessons_completed",
  "curriculum_line_complete",
  "curriculum_time_spent",
]);

const toDefinitionCreate = (def: AchievementDefinitionData) => ({
  slug: def.slug,
  name: def.name,
  description: def.description,
  icon: def.icon,
  rarity: def.rarity,
  conditionType: def.conditionType,
  conditionValue: def.conditionValue,
  conditionJson: (def.conditionJson ?? Prisma.JsonNull) as Prisma.InputJsonValue,
  xpReward: def.xpReward,
  coinReward: def.coinReward ?? 0,
  titleReward: def.titleReward ?? null,
  category: def.category,
  order: def.order ?? 0,
  isHidden: def.isHidden ?? false,
  isActive: def.isActive ?? true,
});

export const syncAchievementDefinitions = async (tx: TxClient, definitions: AchievementDefinitionData[] = ACHIEVEMENTS) => {
  for (const def of definitions) {
    await tx.achievementDefinition.upsert({
      where: { slug: def.slug },
      update: toDefinitionCreate(def),
      create: toDefinitionCreate(def),
    });
  }
  return tx.achievementDefinition.findMany();
};

const toAchievementView = (row: UserAchievement & { achievement: AchievementDefinition }): AchievementWithProgress => {
  const progressPercent = calculateProgressPercent(row.currentProgress, row.achievement.conditionValue);
  return {
    id: row.achievementId,
    name: row.achievement.name,
    description: row.achievement.description,
    icon: row.achievement.icon,
    rarity: row.achievement.rarity as AchievementWithProgress["rarity"],
    rarityLabel: row.achievement.rarity,
    category: row.achievement.category as AchievementWithProgress["category"],
    categoryLabel: row.achievement.category,
    conditionType: row.achievement.conditionType,
    conditionValue: row.achievement.conditionValue,
    xpReward: row.achievement.xpReward,
    coinReward: row.achievement.coinReward ?? 0,
    titleReward: row.achievement.titleReward,
    isHidden: row.achievement.isHidden,
    currentProgress: row.currentProgress,
    progressPercent,
    isCompleted: row.isCompleted,
    completedAt: row.completedAt?.toISOString() ?? null,
    isRewardClaimed: row.isRewardClaimed,
    hint: null,
  };
};

export const getAchievements = async (
  userId: string,
  filters: { category?: string; status?: "all" | "in_progress" | "completed" | "unclaimed" } = {},
  txClient: TxClient = prisma,
) => {
  await ensureUser(txClient, userId);
  await ensureGameProfile(txClient, userId);
  await syncAchievementDefinitions(txClient);

  const rows = await txClient.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: [{ isCompleted: "desc" }, { updatedAt: "desc" }],
  });

  let items = rows.map(toAchievementView);
  if (filters.category && filters.category !== "all") {
    items = items.filter((item) => item.category === filters.category);
  }
  if (filters.status === "in_progress") {
    items = items.filter((item) => !item.isCompleted);
  } else if (filters.status === "completed") {
    items = items.filter((item) => item.isCompleted);
  } else if (filters.status === "unclaimed") {
    items = items.filter((item) => item.isCompleted && !item.isRewardClaimed);
  }

  const summary: AchievementSummary = {
    total: items.length,
    completed: items.filter((a) => a.isCompleted).length,
    inProgress: items.filter((a) => !a.isCompleted).length,
    unclaimed: items.filter((a) => a.isCompleted && !a.isRewardClaimed).length,
    completionRate: items.length === 0 ? 0 : Math.round((items.filter((a) => a.isCompleted).length / items.length) * 100),
  };

  return { achievements: items, summary };
};

const computeProgressForCurriculum = (
  def: AchievementDefinition,
  stats: CurriculumProgressSnapshot,
): { progress: number; achieved: boolean } => {
  switch (def.conditionType) {
    case "curriculum_lessons_completed": {
      const progress = stats.totalLessonsCompleted;
      return { progress, achieved: progress >= def.conditionValue };
    }
    case "curriculum_line_complete": {
      const linesCompleted = Object.values(stats.lineProgress ?? {}).filter((p) => p.total > 0 && p.completed >= p.total).length;
      return { progress: linesCompleted, achieved: linesCompleted >= def.conditionValue };
    }
    case "curriculum_time_spent": {
      const progress = stats.totalTimeSpentSec;
      return { progress, achieved: progress >= def.conditionValue };
    }
    default:
      return { progress: 0, achieved: false };
  }
};

export const evaluateCurriculumAchievements = async (
  user: { id: string; email?: string | null; name?: string | null },
  stats: CurriculumProgressSnapshot,
  txClient: TxClient = prisma,
): Promise<{ unlocked: AchievementUnlock[]; totalXpReward: number }> => {
  const tx = txClient;
  await ensureUser(tx, user.id, user.email, user.name);
  const profile = await ensureGameProfile(tx, user.id);

  const curriculumDefs = ACHIEVEMENTS.filter((def) => CURRICULUM_CONDITIONS.has(def.conditionType));
  await syncAchievementDefinitions(tx, curriculumDefs);

  const defs = await tx.achievementDefinition.findMany({
    where: { slug: { in: curriculumDefs.map((d) => d.slug) } },
  });

  const userAchievements = await tx.userAchievement.findMany({
    where: { userId: user.id, achievementId: { in: defs.map((d) => d.id) } },
  });
  const byAchievementId = new Map(userAchievements.map((a) => [a.achievementId, a]));

  const unlocked: AchievementUnlock[] = [];
  let totalXpReward = 0;

  for (const def of defs) {
    const progressResult = computeProgressForCurriculum(def, stats);
    const existing = byAchievementId.get(def.id);
    const alreadyCompleted = existing?.isCompleted ?? false;
    const shouldComplete = progressResult.achieved;

    if (!existing) {
      const created = await tx.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: def.id,
          gameProfileId: profile.id,
          currentProgress: progressResult.progress,
          isCompleted: shouldComplete,
          completedAt: shouldComplete ? new Date() : null,
          isRewardClaimed: shouldComplete,
        },
      });
      if (shouldComplete) {
        unlocked.push({
          slug: def.slug,
          name: def.name,
          icon: def.icon,
          xpReward: def.xpReward,
          coinReward: def.coinReward ?? 0,
          titleReward: def.titleReward,
        });
        totalXpReward += def.xpReward ?? 0;
      }
      byAchievementId.set(def.id, created);
      continue;
    }

    const needsUpdate =
      existing.currentProgress !== progressResult.progress || existing.isCompleted !== shouldComplete || existing.isRewardClaimed !== shouldComplete;
    if (needsUpdate) {
      await tx.userAchievement.update({
        where: { id: existing.id },
        data: {
          currentProgress: progressResult.progress,
          isCompleted: shouldComplete,
          completedAt: shouldComplete ? existing.completedAt ?? new Date() : null,
          isRewardClaimed: shouldComplete ? true : existing.isRewardClaimed,
        },
      });
    }

    if (shouldComplete && !alreadyCompleted) {
      unlocked.push({
        slug: def.slug,
        name: def.name,
        icon: def.icon,
        xpReward: def.xpReward,
        coinReward: def.coinReward ?? 0,
        titleReward: def.titleReward,
      });
      totalXpReward += def.xpReward ?? 0;
    }
  }

  return { unlocked, totalXpReward };
};
