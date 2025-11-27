// src/app/api/coach/plan/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCredoSummary } from "@/lib/credoSummary";
import { assertRateLimit } from "@/lib/rateLimit";
import { PlanRequestSchema } from "@/lib/schemas/coachPlan";
import { buildPlanContext } from "@/lib/coach/contextBuilder";
import { generateStudyPlan } from "@/lib/coach/studyPlanService";

type FallbackPlanResult = {
  date: string;
  focus: string;
  tasks: Array<{
    title: string;
    durationMinutes: number;
    timeSlot: string;
    note?: string;
  }>;
  coachMessage: string;
};

// 日付ユーティリティ
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

// フォールバック用のルールベースプラン生成
const makeFallbackPlan = async (params: {
  userId: string;
  date: string;
  userName?: string | null;
}): Promise<FallbackPlanResult> => {
  const { userId, date, userName } = params;
  const { from, to } = getWeekRange(date);

  const [summary, profile, chatMessages] = await Promise.all([
    buildCredoSummary(userId, from, to),
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { message: true },
    }),
  ]);

  const tone = profile?.coachTone ?? "gentle";
  const timeMap: Record<string, string> = {
    morning: "朝（6-9時）",
    day: "昼（12-15時）",
    evening: "夕方〜夜（18-21時）",
  };
  const recommendedTime = timeMap[profile?.activeHours ?? "day"] ?? "昼（12-15時）";
  const lastMsg = chatMessages[0]?.message ?? "";
  const name = userName || "あなた";

  const tasks = [
    {
      title: `クレドTop項目「${summary.ranking[0]?.title ?? "好きなクレド"}」を5分で実践`,
      durationMinutes: 5,
      timeSlot: recommendedTime.includes("朝") ? "7:00-7:05" : recommendedTime.includes("昼") ? "12:00-12:05" : "19:00-19:05",
      note: "ノートに一言書いてみよう",
    },
    {
      title: profile?.weeklyGoal
        ? `週目標「${profile.weeklyGoal.slice(0, 20)}」に向けて15分作業`
        : "今週やりたいことを15分で1つだけ進める",
      durationMinutes: 15,
      timeSlot: recommendedTime.includes("朝") ? "7:30-7:45" : recommendedTime.includes("昼") ? "13:00-13:15" : "19:30-19:45",
    },
    {
      title: lastMsg
        ? `直近の相談「${lastMsg.slice(0, 20)}...」を振り返り、次の一歩を決める`
        : "今日の振り返りを5分で書く",
      durationMinutes: 5,
      timeSlot: recommendedTime.includes("朝") ? "8:00-8:05" : recommendedTime.includes("昼") ? "14:00-14:05" : "20:00-20:05",
    },
  ];

  const focus =
    summary.ranking[0]?.title ??
    (profile?.weeklyGoal ? `週目標「${profile.weeklyGoal.slice(0, 15)}」` : "小さな行動を確実に続ける");

  const message =
    tone === "logical"
      ? `${name}さん、今日の実践率は${summary.practicedRate}%。短時間の行動を積み重ねよう。${recommendedTime}に集中する時間を確保して。`
      : `${name}さん、実践率は${summary.practicedRate}%だね。小さく始めれば十分。${recommendedTime}の15分をつかまえて、できたら自分をほめよう。`;

  return {
    date,
    focus,
    tasks,
    coachMessage: message,
  };
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/coach/plan", 10, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 }
    );
  }

  // リクエストボディのパース
  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    // bodyが空の場合は無視
  }

  // zodバリデーション
  const parseResult = PlanRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "invalid_request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const targetDate = parseResult.data.date ?? getTodayIso();

  // LLMでプラン生成
  let plan: FallbackPlanResult;
  try {
    // ANTHROPIC_API_KEYが設定されているか確認
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY is not set, using fallback plan");
      plan = await makeFallbackPlan({
        userId: user.id,
        date: targetDate,
        userName: user.name,
      });
    } else {
      const context = await buildPlanContext(user.id, new Date(targetDate));
      const generatedPlan = await generateStudyPlan(context);
      plan = generatedPlan;
    }
  } catch (error) {
    console.error("Plan generation error:", error);
    // LLMエラー時はフォールバック
    plan = await makeFallbackPlan({
      userId: user.id,
      date: targetDate,
      userName: user.name,
    });
  }

  return NextResponse.json({ plan });
}
