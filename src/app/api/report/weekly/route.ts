import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assertRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { buildWeeklyReportContext } from "@/lib/report/contextBuilder";
import { mapWeeklyReportRecord } from "@/lib/report/serializers";
import { WeeklyReportGenerateSchema } from "@/lib/schemas/report";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/report/weekly:get", 60, 60_000);
  } catch (error) {
    const err = error as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const query = new URL(request.url).searchParams.get("weekStart") ?? undefined;
  const validation = WeeklyReportGenerateSchema.safeParse({ weekStart: query });
  if (!validation.success) {
    return NextResponse.json({ error: "invalid_week_start" }, { status: 400 });
  }

  const context = await buildWeeklyReportContext(user.id, validation.data.weekStart);
  const targetWeek = validation.data.weekStart ?? context.weekStart;
  const weekStartDate = new Date(`${targetWeek}T00:00:00.000Z`);

  const stored = await prisma.weeklyReport.findUnique({
    where: {
      userId_weekStart: {
        userId: user.id,
        weekStart: weekStartDate,
      },
    },
  });

  const report = stored ? mapWeeklyReportRecord(stored) : null;

  return NextResponse.json({ report, context });
}
