import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCredoSummary } from "@/lib/credoSummary";
import { assertRateLimit } from "@/lib/rateLimit";

type PlanResult = {
  tasks: string[];
  focus: string;
  message: string;
  recommendedTime: string;
};

const getTodayIso = () => new Date().toISOString().slice(0, 10);

const getWeekRange = (isoDate: string) => {
  const d = new Date(isoDate);
  const day = d.getDay(); // 0 Sun - 6 Sat
  const diffToMonday = (day + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: start, to: end };
};

const makePlan = (params: {
  date: string;
  summary: Awaited<ReturnType<typeof buildCredoSummary>>;
  profile: {
    weeklyGoal?: string | null;
    activeHours?: string | null;
    coachTone?: string | null;
    name?: string | null;
  };
  chatMessages: { role: string; message: string }[];
}): PlanResult => {
  const { summary, profile, chatMessages } = params;
  const tone = profile.coachTone ?? "gentle";
  const timeMap: Record<string, string> = {
    morning: "朝（6-9時）",
    day: "昼（12-15時）",
    evening: "夕方〜夜（18-21時）",
  };
  const recommendedTime = timeMap[profile.activeHours ?? "day"] ?? "昼（12-15時）";
  const lastMsg = chatMessages.at(-1)?.message ?? "";
  const name = profile.name || "あなた";
  const tasks = [
    `クレドTop項目「${summary.ranking[0]?.title ?? "好きなクレド"}」を5分で実践し、ノートに一言書く`,
    profile.weeklyGoal
      ? `週目標「${profile.weeklyGoal}」に直結する小タスクを15分で1つ進める`
      : "今週やりたいことを15分で1つだけ進める",
    lastMsg ? `コーチとの最新チャット「${lastMsg.slice(0, 30)}…」を読み返し、次の一歩を5分で決める` : "今日の振り返りを5分で書く",
  ];

  const focus =
    summary.ranking[0]?.title ??
    (profile.weeklyGoal ? `週目標「${profile.weeklyGoal}」に沿った行動` : "小さな行動を確実に続ける");

  const message =
    tone === "logical"
      ? `${name}、今日の実践率は${summary.practicedRate}%。短時間の行動を積み重ねよう。${recommendedTime}に集中する時間を確保して。`
      : `${name}、実践率は${summary.practicedRate}%だね。小さく始めれば十分。${recommendedTime}の15分をつかまえて、できたら自分をほめよう。`;

  return { tasks, focus, message, recommendedTime };
};

export async function POST() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/coach/plan", 10, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const today = getTodayIso();
  const { from, to } = getWeekRange(today);

  const [summary, profile, chatMessages] = await Promise.all([
    buildCredoSummary(user.id, from, to),
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { role: true, message: true },
    }),
  ]);

  const plan = makePlan({
    date: today,
    summary,
    profile: { ...profile, name: user.name },
    chatMessages: chatMessages.reverse(),
  });

  return NextResponse.json({ plan });
}
