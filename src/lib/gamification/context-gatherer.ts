import { prisma } from "@/lib/prisma";
import { QuestGenerationContext } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function trend(values: number[]): "improving" | "stable" | "declining" {
  if (values.length < 2) return "stable";
  const first = values[0];
  const last = values[values.length - 1];
  if (last > first + 0.5) return "improving";
  if (last < first - 0.5) return "declining";
  return "stable";
}

export async function gatherQuestGenerationContext(
  userId: string,
  opts?: { now?: Date; lookbackDays?: number },
): Promise<QuestGenerationContext> {
  const now = opts?.now ?? new Date();
  const lookbackDays = opts?.lookbackDays ?? 7;
  const fromDate = new Date(now.getTime() - lookbackDays * DAY_MS);
  const from = startOfDay(fromDate);

  const [user, goals, todayCondition, lifeLogs, attitudeLogs, noteLogs, habits, completions, gameProfile] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } }),
      prisma.userGoals.findUnique({ where: { userId } }),
      prisma.dailyCondition.findUnique({ where: { userId_date: { userId, date: startOfDay(now) } } }),
      prisma.dailyLifeLog.findMany({
        where: { userId, date: { gte: from } },
        orderBy: { date: "asc" },
      }),
      prisma.learningAttitudeLog.findMany({
        where: { userId, date: { gte: from } },
        orderBy: { date: "asc" },
      }),
      prisma.noteQualityLog.findMany({
        where: { userId, createdAt: { gte: from } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.habitTracker.findMany({ where: { userId, isActive: true } }),
      prisma.habitCompletion.findMany({
        where: { userId, date: { gte: from } },
        orderBy: { date: "asc" },
      }),
      prisma.userGameProfile.findUnique({ where: { userId } }),
    ]);

  const safeUser = user ?? { id: userId, name: "ユーザー" };

  const lifeHabitsAnalysis = (() => {
    const sleepHours = lifeLogs.map((l) => l.actualSleepHours).filter((n): n is number => n != null);
    const sleepQuality = lifeLogs.map((l) => l.sleepQuality).filter((n): n is number => n != null);
    const breakfastRate = lifeLogs.length === 0 ? 0 : lifeLogs.filter((l) => l.hadBreakfast).length / lifeLogs.length;
    const lunchRate = lifeLogs.length === 0 ? 0 : lifeLogs.filter((l) => l.hadLunch).length / lifeLogs.length;
    const dinnerRate = lifeLogs.length === 0 ? 0 : lifeLogs.filter((l) => l.hadDinner).length / lifeLogs.length;
    const water = lifeLogs.map((l) => l.waterIntakeMl).filter((n): n is number => n != null);
    const exercise = lifeLogs.map((l) => l.exerciseMinutes).filter((n): n is number => n != null && n > 0);
    const screen = lifeLogs.map((l) => l.totalScreenTimeMin).filter((n): n is number => n != null);

    const issues: string[] = [];
    if (average(sleepHours) < 6) issues.push("睡眠時間が不足気味です");
    if (breakfastRate < 0.5) issues.push("朝食の欠食が多いです");
    if (average(exercise) < 15) issues.push("運動時間が少なめです");

    const improvements: string[] = [];
    if (sleepQuality.length >= 2 && trend(sleepQuality) === "improving") improvements.push("睡眠の質が改善傾向です");

    return {
      avgSleepHours: average(sleepHours),
      sleepQualityTrend: trend(sleepQuality),
      breakfastRate,
      lunchRate,
      dinnerRate,
      avgWaterIntake: average(water),
      avgExerciseMinutes: average(exercise),
      exerciseFrequency: exercise.length,
      avgScreenTime: average(screen),
      roomCleanRate: lifeLogs.length === 0 ? 0 : lifeLogs.filter((l) => l.roomCleaned).length / lifeLogs.length,
      wentOutsideRate: lifeLogs.length === 0 ? 0 : lifeLogs.filter((l) => l.wentOutside).length / lifeLogs.length,
      issues,
      improvements,
    };
  })();

  const learningAttitudeAnalysis = (() => {
    const focusMinutes = attitudeLogs.map((l) => l.totalFocusMinutes);
    const pomodoros = attitudeLogs.map((l) => l.focusSessionsCount);
    const distractions = attitudeLogs.map((l) => l.distractionCount);

    const rate = (count: number) => (attitudeLogs.length === 0 ? 0 : count / attitudeLogs.length);

    const previewRate = rate(attitudeLogs.filter((l) => l.didPreview).length);
    const reviewRate = rate(attitudeLogs.filter((l) => l.didReview).length);
    const reflectionRate = rate(attitudeLogs.filter((l) => l.didReflection).length);
    const selfTestRate = rate(attitudeLogs.filter((l) => l.didSelfTest).length);
    const goalSettingRate = rate(attitudeLogs.filter((l) => l.setDailyGoal).length);
    const goalAchievementRate = rate(attitudeLogs.filter((l) => l.achievedDailyGoal).length);

    return {
      avgFocusMinutes: average(focusMinutes),
      avgPomodoroCount: average(pomodoros),
      longestFocus: Math.max(0, ...attitudeLogs.map((l) => l.longestFocusMinutes)),
      avgDistractions: average(distractions),
      previewRate,
      reviewRate,
      reflectionRate,
      selfTestRate,
      goalSettingRate,
      goalAchievementRate,
      avgQuestionsAsked: average(attitudeLogs.map((l) => l.questionsAsked)),
      strengths: [],
      weaknesses: [],
      focusTrend: trend(focusMinutes),
    };
  })();

  const noteQualityAnalysis = (() => {
    const notesCreated = noteLogs.length;
    const wordCounts = noteLogs.map((n) => n.wordCount ?? 0);
    const structureScores = noteLogs
      .map((n) => n.overallScore ?? n.aiQualityScore)
      .filter((n): n is number => n != null);
    const templateUsage = noteLogs.filter((n) => n.usedTemplate != null).length;
    const tagCounts = noteLogs.map((n) => n.tagCount ?? 0);
    const reviewRate =
      noteLogs.length === 0 ? 0 : noteLogs.filter((n) => (n.reviewCount ?? 0) > 0).length / noteLogs.length;

    return {
      notesCreated,
      avgWordCount: average(wordCounts),
      avgStructureScore: average(structureScores),
      templateUsageRate: noteLogs.length === 0 ? 0 : templateUsage / noteLogs.length,
      avgTagCount: average(tagCounts),
      reviewRate,
      avgAiQualityScore: structureScores.length ? average(structureScores) : null,
      strengths: [],
      weaknesses: [],
    };
  })();

  const credoAnalysis = {
    strongCredos: [],
    weakCredos: [],
    streakDays: 0,
    todayProgress: 0,
    weeklyAverage: 0,
  };

  const habitsAnalysis = (() => {
    const overallCompletionRate =
      completions.length === 0
        ? 0
        : completions.filter((c) => c.completed).length / Math.max(1, completions.length);
    const activeHabits = habits.map((h) => {
      const records = completions.filter((c) => c.habitId === h.id);
      const rate = records.length === 0 ? 0 : records.filter((r) => r.completed).length / records.length;
      return {
        name: h.name,
        category: h.category,
        completionRate: rate,
        currentStreak: h.currentStreak,
      };
    });
    const strugglingHabits = activeHabits.filter((h) => h.completionRate < 0.4).map((h) => h.name);

    return { activeHabits, strugglingHabits, overallCompletionRate };
  })();

  const gameProgress = {
    level: gameProfile?.level ?? 1,
    totalXp: gameProfile?.totalXp ?? 0,
    xpToNextLevel: (gameProfile?.totalXp ?? 0) + 100,
    rank: gameProfile?.rank ?? "beginner",
    questCompletionRate: 0,
    recentCompletedQuests: [],
    favoriteCategories: [],
    avoidedCategories: [],
  };

  return {
    user: {
      id: safeUser.id,
      name: safeUser.name ?? "ユーザー",
      grade: goals?.grade ?? null,
      strongSubjects: goals?.strongSubjects ?? [],
      weakSubjects: goals?.weakSubjects ?? [],
    },
    goals: {
      dreamJob: goals?.dreamJob ?? null,
      targetSchool: goals?.targetSchool ?? null,
      yearlyGoal: goals?.yearlyGoal ?? null,
      monthlyGoal: goals?.monthlyGoal ?? null,
      weeklyGoal: goals?.weeklyGoal ?? null,
    },
    todayCondition: todayCondition
      ? {
          physical: todayCondition.physicalCondition,
          mental: todayCondition.mentalCondition,
          motivation: todayCondition.motivationLevel,
          energy: todayCondition.energyLevel,
          sleepHours: todayCondition.sleepHours,
          hasImportantEvent: todayCondition.hasImportantEvent,
          eventDescription: todayCondition.eventDescription,
        }
      : null,
    lifeHabitsAnalysis,
    learningAttitudeAnalysis,
    noteQualityAnalysis,
    credoAnalysis,
    habitsAnalysis,
    gameProgress,
    temporal: {
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
      isWeekend: [0, 6].includes(now.getDay()),
      isHoliday: false,
      currentHour: now.getHours(),
    },
  };
}
