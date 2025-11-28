import { prisma } from "@/lib/prisma";
import { CREDO_ITEMS } from "@/features/credo/config";
import { buildCredoSummary } from "@/lib/credoSummary";
import type { WeeklyReportContext } from "./types";
import {
  buildWeekDays,
  buildWeekLabel,
  endOfWeek,
  formatDayLabel,
  getEffectiveSeconds,
  startOfWeek,
  toIsoDate,
} from "./utils";

const HEALTH_KEYWORDS = ["睡眠", "体調", "休息", "疲労", "食事"];

function getHealthCredoIds() {
  return CREDO_ITEMS.filter((item) => {
    const haystack = `${item.category}${item.title}${item.description}`;
    return HEALTH_KEYWORDS.some((kw) => haystack.includes(kw)) || item.category === "睡眠と体調";
  }).map((item) => item.id);
}

function buildConditionHighlights(credoSummary: WeeklyReportContext["credoSummary"]) {
  const healthIds = getHealthCredoIds();
  const healthTitles = healthIds
    .map((id) => {
      const item = CREDO_ITEMS.find((c) => c.id === id);
      if (!item) return null;
      const practiced = credoSummary.ranking.some((r) => r.id === id);
      if (!practiced) return null;
      return `体調系: ${item.title}`;
    })
    .filter((title): title is string => Boolean(title));

  const highlights = [...credoSummary.highlights, ...healthTitles].slice(0, 3);
  if (highlights.length === 0) {
    highlights.push("今週はクレド実践ログがありません");
  }
  return highlights;
}

export async function buildWeeklyReportContext(userId: string, weekStartIso?: string): Promise<WeeklyReportContext> {
  const parsedReference = weekStartIso ? new Date(weekStartIso) : new Date();
  const reference = Number.isNaN(parsedReference.getTime()) ? new Date() : parsedReference;
  const weekStart = startOfWeek(reference);
  const weekEnd = endOfWeek(weekStart);

  const [profileRow, userRow] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ]);

  const tasks = await prisma.studyTask.findMany({
    where: {
      userId,
      OR: [
        {
          dueDate: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        {
          createdAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      ],
    },
  });

  const now = new Date();
  const dailyMap = new Map<string, number>();
  const statusCounts = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    paused: 0,
    done: 0,
  };
  const scoredTasks: Array<{ id: string; title: string; status: string; dueDate: Date | null; seconds: number }> = [];
  let totalSeconds = 0;

  for (const task of tasks) {
    const seconds = getEffectiveSeconds(
      {
        totalWorkTime: task.totalWorkTime,
        status: task.status,
        lastStartedAt: task.lastStartedAt,
      },
      now
    );
    totalSeconds += seconds;
    const dayKey = task.dueDate ? toIsoDate(task.dueDate) : null;
    if (dayKey) {
      dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + seconds);
    }
    switch (task.status) {
      case "in_progress":
        statusCounts.inProgress += 1;
        break;
      case "paused":
        statusCounts.paused += 1;
        break;
      case "done":
        statusCounts.done += 1;
        break;
      default:
        statusCounts.todo += 1;
        break;
    }
    scoredTasks.push({
      id: task.id,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate ?? null,
      seconds,
    });
  }

  const weekDays = buildWeekDays(weekStart);
  const daily = weekDays.map((date) => ({
    date,
    label: formatDayLabel(date),
    seconds: dailyMap.get(date) ?? 0,
  }));

  const topTasks = scoredTasks
    .sort((a, b) => b.seconds - a.seconds || a.title.localeCompare(b.title))
    .slice(0, 3)
    .map((task) => ({
      title: task.title,
      status: task.status,
      seconds: task.seconds,
      dueDate: task.dueDate ? toIsoDate(task.dueDate) : null,
    }));

  const credoSummary = await buildCredoSummary(userId, weekStart, weekEnd);
  const conditionHighlights = buildConditionHighlights(credoSummary);

  return {
    weekLabel: buildWeekLabel(weekStart, weekEnd),
    weekStart: toIsoDate(weekStart),
    weekEnd: toIsoDate(weekEnd),
    profile: {
      name: userRow?.name ?? null,
      weeklyGoal: profileRow?.weeklyGoal ?? null,
      coachTone: profileRow?.coachTone ?? null,
      activeHours: profileRow?.activeHours ?? null,
    },
    summary: {
      totalSeconds,
      daily,
      statusCounts,
      topTasks,
    },
    credoSummary,
    conditionHighlights,
  };
}
