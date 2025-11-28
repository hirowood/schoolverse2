import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assertRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { buildWeeklyReportContext } from "@/lib/report/contextBuilder";
import { generateWeeklyReportFromContext } from "@/lib/report/service";
import { mapWeeklyReportRecord } from "@/lib/report/serializers";
import { WeeklyReportGenerateSchema } from "@/lib/schemas/report";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/report/weekly:generate", 10, 60_000);
  } catch (error) {
    const err = error as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const validation = WeeklyReportGenerateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "invalid_week_start", details: validation.error.flatten() },
      { status: 400 },
    );
  }

  const context = await buildWeeklyReportContext(user.id, validation.data.weekStart);

  let payload;
  try {
    payload = await generateWeeklyReportFromContext(context);
  } catch (error) {
    console.error("Weekly report generation failed:", error);
    return NextResponse.json({ error: "ai_generation_failed" }, { status: 502 });
  }

  const weekStartDate = new Date(`${context.weekStart}T00:00:00.000Z`);
  const stored = await prisma.weeklyReport.upsert({
    where: {
      userId_weekStart: {
        userId: user.id,
        weekStart: weekStartDate,
      },
    },
    update: {
      conditionSummary: payload.conditionSummary,
      activitySummary: payload.activitySummary,
      aiAnalysis: payload.aiAnalysis,
      nextWeekFocus: payload.nextWeekFocus,
      supporterExport: payload.supporterExport,
    },
    create: {
      userId: user.id,
      weekStart: weekStartDate,
      conditionSummary: payload.conditionSummary,
      activitySummary: payload.activitySummary,
      aiAnalysis: payload.aiAnalysis,
      nextWeekFocus: payload.nextWeekFocus,
      supporterExport: payload.supporterExport,
    },
  });

  const report = mapWeeklyReportRecord(stored);
  return NextResponse.json({ report, context });
}
