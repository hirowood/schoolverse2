import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { CURRICULUM_LINES } from "@/lib/curriculum/lines-data";
import { getProgressOverview, syncStaticLessons } from "@/lib/curriculum/progress-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get("lineId");
    const qRaw = searchParams.get("q") ?? "";
    const terms = qRaw
      .split(/\s+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    let lines = CURRICULUM_LINES;

    if (lineId) {
      lines = lines.filter((l) => l.id === lineId);
    }

    if (terms.length > 0) {
      const match = (text?: string) => {
        if (!text) return false;
        const hay = text.toLowerCase();
        return terms.every((t) => hay.includes(t));
      };
      lines = lines.filter(
        (l) =>
          match(l.title) ||
          match(l.summary) ||
          l.units.some((u) => match(u.title) || match(u.description)) ||
          l.missions?.some((m) => match(m)) ||
          l.missionDetails?.some(
            (m) =>
              match(m.title) ||
              match(m.description) ||
              m.tags?.some((tag) => match(tag)) ||
              match(String(m.effortMinutes)),
          ),
      );
    }

    const sessionUser = await getSessionUser();
    let progressByLine: Record<string, { completed: number; total: number; percentage: number }> = {};

    if (sessionUser) {
      const overview = await getProgressOverview(sessionUser);
      progressByLine = overview.progressByLine;
    } else {
      const lessons = await syncStaticLessons();
      const totals: Record<string, number> = {};
      lessons.forEach((lesson) => {
        totals[lesson.lineId] = (totals[lesson.lineId] ?? 0) + 1;
      });
      progressByLine = Object.fromEntries(
        Object.entries(totals).map(([id, total]) => [id, { completed: 0, total, percentage: 0 }]),
      );
    }

    const linesWithProgress = lines.map((line) => ({
      ...line,
      progress: progressByLine[line.id] ?? { completed: 0, total: 0, percentage: 0 },
    }));

    return NextResponse.json({
      success: true,
      data: lineId ? linesWithProgress[0] ?? null : linesWithProgress,
    });
  } catch (error) {
    console.error("GET /api/curriculum/lines error", error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
