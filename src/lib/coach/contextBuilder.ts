// src/lib/coach/contextBuilder.ts
import { prisma } from "@/lib/prisma";
import { buildCredoSummary, CredoSummary } from "@/lib/credoSummary";

// 日付ユーティリティ（date-fnsの代わりにネイティブ実装）
function startOfWeek(date: Date, options?: { weekStartsOn?: number }): Date {
  const d = new Date(date);
  const day = d.getDay();
  const weekStartsOn = options?.weekStartsOn ?? 0;
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date, options?: { weekStartsOn?: number }): Date {
  const d = startOfWeek(date, options);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export interface ChatContext {
  profile: {
    name: string | null;
    weeklyGoal: string | null;
    activeHours: string | null;
    coachTone: string | null;
  };
  credoSummary: CredoSummary;
  recentMessages: Array<{
    role: string;
    message: string;
    createdAt: Date;
  }>;
}

export interface PlanContext extends ChatContext {
  targetDate: Date;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    dueDate: Date | null;
  }>;
}

export async function buildChatContext(userId: string): Promise<ChatContext> {
  const [user, profile, recentMessages] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { role: true, message: true, createdAt: true },
    }),
  ]);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const credoSummary = await buildCredoSummary(userId, weekStart, weekEnd);

  return {
    profile: {
      name: user?.name ?? null,
      weeklyGoal: profile?.weeklyGoal ?? null,
      activeHours: profile?.activeHours ?? null,
      coachTone: profile?.coachTone ?? null,
    },
    credoSummary,
    recentMessages: recentMessages.reverse(),
  };
}

export async function buildPlanContext(
  userId: string,
  targetDate: Date
): Promise<PlanContext> {
  const chatContext = await buildChatContext(userId);

  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);

  const tasks = await prisma.studyTask.findMany({
    where: {
      userId,
      status: { in: ["todo", "in_progress", "paused"] },
      OR: [
        { dueDate: { gte: dayStart, lt: dayEnd } },
        { dueDate: null },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      dueDate: true,
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  return {
    ...chatContext,
    targetDate,
    tasks,
  };
}
