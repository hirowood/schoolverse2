import type {
  CurriculumLesson,
  Prisma,
  PrismaClient,
  UserCurriculumStats,
  UserLessonProgress,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { addXp, ensureGameProfile } from "@/lib/gamification/xp-service";
import { evaluateCurriculumAchievements } from "@/lib/gamification/achievement-service";
import type { StaticLessonDefinition } from "./lessons-static";
import { STATIC_CURRICULUM_LESSONS } from "./lessons-static";

type TxClient = PrismaClient | Prisma.TransactionClient;

export type LessonProgressStatus = "locked" | "available" | "in_progress" | "completed";

export type UserIdentity = {
  id: string;
  email?: string | null;
  name?: string | null;
};

export type CompletionData = {
  timeSpentSec?: number;
  score?: number;
  notes?: string;
  rating?: number;
};

export type CompletionResult = {
  lesson: CurriculumLesson;
  progress: UserLessonProgress;
  xpEarned: number;
  bonusXpEarned: number;
  unlockedLessons: string[];
  stats: UserCurriculumStats;
  achievementsUnlocked: Array<{
    slug: string;
    name: string;
    icon: string;
    xpReward: number;
    coinReward: number;
    titleReward?: string | null;
  }>;
  gamification: {
    totalXpGained: number;
    levelUp: {
      occurred: boolean;
      previousLevel: number;
      newLevel: number;
      bonusXp: number;
    };
    achievementsUnlocked: Array<{
      slug: string;
      name: string;
      icon: string;
      xpReward: number;
      coinReward: number;
      titleReward?: string | null;
    }>;
  };
};

const toLessonRecord = (definition: StaticLessonDefinition) => ({
  lineId: definition.lineId,
  unitId: definition.unitId,
  slug: definition.slug,
  title: definition.title,
  description: definition.description,
  lessonType: definition.lessonType ?? "lecture",
  order: definition.order,
  estimatedMinutes: definition.estimatedMinutes,
  xpReward: definition.xpReward,
  bonusXp: definition.bonusXp ?? 0,
  prerequisites: definition.prerequisites ?? [],
  tags: definition.tags ?? [],
});

const ensureUser = async (tx: TxClient, user: UserIdentity) => {
  const email = user.email ?? `${user.id}@example.local`;
  const name = user.name ?? user.email ?? user.id;
  await tx.user.upsert({
    where: { id: user.id },
    update: { email, name },
    create: { id: user.id, email, name },
  });
};

const buildLessonMaps = (lessons: CurriculumLesson[]) => {
  const bySlug = new Map<string, CurriculumLesson>();
  const byId = new Map<string, CurriculumLesson>();
  lessons.forEach((lesson) => {
    bySlug.set(lesson.slug, lesson);
    byId.set(lesson.id, lesson);
  });
  return { bySlug, byId };
};

const prerequisitesMet = (
  lesson: CurriculumLesson,
  lessonsBySlug: Map<string, CurriculumLesson>,
  progressByLessonId: Map<string, UserLessonProgress>,
) => {
  if (!lesson.prerequisites.length) return true;
  return lesson.prerequisites.every((slug) => {
    const prereqLesson = lessonsBySlug.get(slug);
    if (!prereqLesson) return false;
    const prereqProgress = progressByLessonId.get(prereqLesson.id);
    return prereqProgress?.status === "completed";
  });
};

const startOfDayUtc = (value: Date) => {
  const d = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  return d.getTime();
};

const calculateStreak = (existing: UserCurriculumStats | null, activityAt?: Date | null) => {
  if (!activityAt) {
    return {
      currentStreak: existing?.currentStreak ?? 0,
      longestStreak: existing?.longestStreak ?? 0,
      lastStudiedAt: existing?.lastStudiedAt ?? null,
    };
  }

  const previousDate = existing?.lastStudiedAt ? new Date(existing.lastStudiedAt) : null;
  const currentBase = existing?.currentStreak ?? 0;
  const activityDay = startOfDayUtc(activityAt);
  const previousDay = previousDate ? startOfDayUtc(previousDate) : null;

  let currentStreak = 1;
  if (previousDay !== null) {
    const diffDays = Math.round((activityDay - previousDay) / 86_400_000);
    if (diffDays === 0) {
      currentStreak = currentBase || 1;
    } else if (diffDays === 1) {
      currentStreak = currentBase + 1;
    }
  }

  const longestStreak = Math.max(existing?.longestStreak ?? 0, currentStreak);
  return {
    currentStreak,
    longestStreak,
    lastStudiedAt: activityAt,
  };
};

export const calculateXp = (lesson: CurriculumLesson, timeSpentSec: number) => {
  const base = lesson.xpReward;
  const withinEstimate = timeSpentSec > 0 && timeSpentSec <= lesson.estimatedMinutes * 60;
  const bonus = withinEstimate ? lesson.bonusXp : 0;
  return { base, bonus };
};

export const syncStaticLessons = async (tx: TxClient = prisma) => {
  for (const lesson of STATIC_CURRICULUM_LESSONS) {
    await tx.curriculumLesson.upsert({
      where: { slug: lesson.slug },
      update: toLessonRecord(lesson),
      create: toLessonRecord(lesson),
    });
  }
  return tx.curriculumLesson.findMany({
    where: { isActive: true },
    orderBy: [{ lineId: "asc" }, { order: "asc" }, { createdAt: "asc" }],
  });
};

const unlockLessons = async (
  tx: TxClient,
  user: UserIdentity,
  lessons: CurriculumLesson[],
  progressMap: Map<string, UserLessonProgress>,
) => {
  const lessonsBySlug = new Map<string, CurriculumLesson>();
  lessons.forEach((lesson) => lessonsBySlug.set(lesson.slug, lesson));

  const unlocked: string[] = [];

  for (const lesson of lessons) {
    const current = progressMap.get(lesson.id);
    const canStart = prerequisitesMet(lesson, lessonsBySlug, progressMap);
    const targetStatus: LessonProgressStatus =
      current?.status === "completed"
        ? "completed"
        : canStart
          ? current?.status === "in_progress"
            ? "in_progress"
            : "available"
          : "locked";

    if (!current) {
      const created = await tx.userLessonProgress.create({
        data: {
          userId: user.id,
          lessonId: lesson.id,
          status: targetStatus,
        },
      });
      progressMap.set(lesson.id, created);
      if (targetStatus === "available") unlocked.push(lesson.slug);
      continue;
    }

    if (current.status === "locked" && targetStatus === "available") {
      const updated = await tx.userLessonProgress.update({
        where: { id: current.id },
        data: { status: "available" },
      });
      progressMap.set(lesson.id, updated);
      unlocked.push(lesson.slug);
    }
  }

  return unlocked;
};

const latestActivityAt = (progress: UserLessonProgress[]) => {
  const timestamps = progress
    .map((row) => row.completedAt ?? row.startedAt ?? row.updatedAt ?? row.createdAt)
    .filter((value): value is Date => !!value);
  return timestamps.sort((a, b) => b.getTime() - a.getTime())[0];
};

const updateStats = async (
  tx: TxClient,
  user: UserIdentity,
  lessons: CurriculumLesson[],
  progressRows: UserLessonProgress[],
  activityAt?: Date,
) => {
  const existing = await tx.userCurriculumStats.findUnique({ where: { userId: user.id } });
  const lessonsById = new Map<string, CurriculumLesson>();
  lessons.forEach((lesson) => lessonsById.set(lesson.id, lesson));

  const totalLessonsCompleted = progressRows.filter((row) => row.status === "completed").length;
  const totalTimeSpentSec = progressRows.reduce((sum, row) => sum + row.totalTimeSpent, 0);
  const totalXpFromCurriculum = progressRows.reduce((sum, row) => sum + row.xpEarned + row.bonusXpEarned, 0);

  const lineTotals: Record<string, number> = {};
  const lineCompleted: Record<string, number> = {};
  lessons.forEach((lesson) => {
    lineTotals[lesson.lineId] = (lineTotals[lesson.lineId] ?? 0) + 1;
  });
  progressRows.forEach((row) => {
    const lesson = lessonsById.get(row.lessonId);
    if (!lesson) return;
    if (row.status === "completed") {
      lineCompleted[lesson.lineId] = (lineCompleted[lesson.lineId] ?? 0) + 1;
    }
  });

  const lineProgress = Object.fromEntries(
    Object.entries(lineTotals).map(([lineId, total]) => [lineId, { completed: lineCompleted[lineId] ?? 0, total }]),
  );

  const latestActivity = activityAt ?? existing?.lastStudiedAt ?? latestActivityAt(progressRows);
  const streak = calculateStreak(existing, latestActivity ?? null);

  const payload = {
    totalLessonsCompleted,
    totalTimeSpentSec,
    totalXpFromCurriculum,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastStudiedAt: streak.lastStudiedAt,
    lineProgress,
  };

  const stats = await tx.userCurriculumStats.upsert({
    where: { userId: user.id },
    update: payload,
    create: { userId: user.id, ...payload },
  });

  return stats;
};

export const getLessonWithProgress = async (user: UserIdentity | null, slug: string) => {
  return prisma.$transaction(async (tx) => {
    if (user) {
      await ensureUser(tx, user);
    }
    const lessons = await syncStaticLessons(tx);
    const lesson = lessons.find((item) => item.slug === slug);
    if (!lesson) return null;

    if (!user) {
      return {
        lesson,
        progress: null,
        isUnlocked: false,
      };
    }

    const progressRows = await tx.userLessonProgress.findMany({ where: { userId: user.id } });
    const progressMap = new Map(progressRows.map((row) => [row.lessonId, row]));
    await unlockLessons(tx, user, lessons, progressMap);

    const currentProgress = progressMap.get(lesson.id) ?? null;
    const isUnlocked = currentProgress?.status !== "locked";
    return { lesson, progress: currentProgress, isUnlocked };
  });
};

export const getProgressOverview = async (user: UserIdentity) => {
  return prisma.$transaction(async (tx) => {
    await ensureUser(tx, user);
    const lessons = await syncStaticLessons(tx);
    const progressRows = await tx.userLessonProgress.findMany({ where: { userId: user.id } });
    const progressMap = new Map(progressRows.map((row) => [row.lessonId, row]));
    await unlockLessons(tx, user, lessons, progressMap);

    const stats = await updateStats(tx, user, lessons, Array.from(progressMap.values()));
    const progressByLine = Object.fromEntries(
      Object.entries(stats.lineProgress as Record<string, { completed: number; total: number }>).map(
        ([lineId, value]) => {
          const percentage = value.total === 0 ? 0 : Math.round((value.completed / value.total) * 100);
          return [lineId, { ...value, percentage }];
        },
      ),
    );

    const lessonProgress = lessons.map((lesson) => {
      const progress = progressMap.get(lesson.id);
      const status = progress?.status ?? ("locked" satisfies LessonProgressStatus);
      return {
        lesson,
        progress: progress ?? null,
        isUnlocked: status !== "locked",
      };
    });

    return { stats, lessons: lessonProgress, progressByLine };
  });
};

export const startLesson = async (user: UserIdentity, slug: string) => {
  return prisma.$transaction(async (tx) => {
    await ensureUser(tx, user);
    const lessons = await syncStaticLessons(tx);
    const { bySlug } = buildLessonMaps(lessons);
    const lesson = bySlug.get(slug);
    if (!lesson) throw new Error("lesson_not_found");

    const progressRows = await tx.userLessonProgress.findMany({ where: { userId: user.id } });
    const progressMap = new Map(progressRows.map((row) => [row.lessonId, row]));
    await unlockLessons(tx, user, lessons, progressMap);

    if (!prerequisitesMet(lesson, bySlug, progressMap)) {
      throw new Error("prerequisite_not_met");
    }

    const existing = progressMap.get(lesson.id);
    const startedAt = existing?.startedAt ?? new Date();
    const progress = await tx.userLessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      update: {
        status: "in_progress",
        startedAt,
        attempts: existing?.attempts ?? 0,
      },
      create: {
        userId: user.id,
        lessonId: lesson.id,
        status: "in_progress",
        startedAt,
        attempts: 0,
      },
    });

    return { lesson, progress };
  });
};

export const completeLesson = async (user: UserIdentity, slug: string, data: CompletionData) => {
  const { timeSpentSec = 0, score, notes, rating } = data;

  return prisma.$transaction(async (tx) => {
    await ensureUser(tx, user);
    const lessons = await syncStaticLessons(tx);
    const { bySlug } = buildLessonMaps(lessons);
    const lesson = bySlug.get(slug);
    if (!lesson) throw new Error("lesson_not_found");

    const progressRows = await tx.userLessonProgress.findMany({ where: { userId: user.id } });
    const progressMap = new Map(progressRows.map((row) => [row.lessonId, row]));
    if (!prerequisitesMet(lesson, bySlug, progressMap)) {
      throw new Error("prerequisite_not_met");
    }

    const now = new Date();
    const current = progressMap.get(lesson.id);
    if (current?.status === "completed") {
      const stats = await updateStats(tx, user, lessons, Array.from(progressMap.values()), current.completedAt ?? now);
      const profile = await ensureGameProfile(tx, user.id);
      return {
        lesson,
        progress: current,
        xpEarned: current.xpEarned,
        bonusXpEarned: current.bonusXpEarned,
        unlockedLessons: [],
        stats,
        achievementsUnlocked: [],
        gamification: {
          totalXpGained: 0,
          levelUp: {
            occurred: false,
            previousLevel: profile.level,
            newLevel: profile.level,
            bonusXp: 0,
          },
          achievementsUnlocked: [],
        },
      };
    }

    const xp = calculateXp(lesson, timeSpentSec);
    const updated = await tx.userLessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      update: {
        status: "completed",
        startedAt: current?.startedAt ?? now,
        completedAt: now,
        totalTimeSpent: (current?.totalTimeSpent ?? 0) + timeSpentSec,
        attempts: (current?.attempts ?? 0) + 1,
        score: typeof score === "number" ? score : current?.score,
        notes: typeof notes === "string" ? notes : current?.notes,
        rating: typeof rating === "number" ? rating : current?.rating,
        xpEarned: xp.base,
        bonusXpEarned: xp.bonus,
      },
      create: {
        userId: user.id,
        lessonId: lesson.id,
        status: "completed",
        startedAt: now,
        completedAt: now,
        totalTimeSpent: timeSpentSec,
        attempts: 1,
        score: typeof score === "number" ? score : null,
        notes: typeof notes === "string" ? notes : null,
        rating: typeof rating === "number" ? rating : null,
        xpEarned: xp.base,
        bonusXpEarned: xp.bonus,
      },
    });

    progressMap.set(lesson.id, updated);
    const unlockedLessons = await unlockLessons(tx, user, lessons, progressMap);
    const stats = await updateStats(tx, user, lessons, Array.from(progressMap.values()), now);

    const xpResult = await addXp(
      user.id,
      xp.base + xp.bonus,
      {
        source: "curriculum_complete",
        sourceId: lesson.id,
        category: lesson.lineId,
        description: `Lesson: ${lesson.title}`,
      },
      tx,
    );

    const achievementResult = await evaluateCurriculumAchievements(
      user,
      {
        totalLessonsCompleted: stats.totalLessonsCompleted,
        totalTimeSpentSec: stats.totalTimeSpentSec,
        lineProgress: stats.lineProgress as Record<string, { completed: number; total: number }>,
      },
      tx,
    );

    let achievementXpResult:
      | {
          totalXpGained: number;
          levelUp: { occurred: boolean; previousLevel: number; newLevel: number; bonusXp: number };
          profile: { level: number };
        }
      | null = null;
    if (achievementResult.totalXpReward > 0) {
      achievementXpResult = await addXp(
        user.id,
        achievementResult.totalXpReward,
        {
          source: "achievement_unlock",
          description: "カリキュラム実績",
        },
        tx,
      );
    }

    const levelUp = achievementXpResult?.levelUp.occurred ? achievementXpResult.levelUp : xpResult.levelUp;
    const totalXpGained = xpResult.totalXpGained + (achievementXpResult?.totalXpGained ?? 0);

    return {
      lesson,
      progress: updated,
      xpEarned: xp.base,
      bonusXpEarned: xp.bonus,
      unlockedLessons,
      stats,
      achievementsUnlocked: achievementResult.unlocked,
      gamification: {
        totalXpGained,
        levelUp,
        achievementsUnlocked: achievementResult.unlocked,
      },
    };
  });
};
