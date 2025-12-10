import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { completeLesson } from "@/lib/curriculum/progress-service";

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // ignore
  }

  const timeSpentSec = typeof body.timeSpentSec === "number" ? body.timeSpentSec : 0;
  const score = typeof body.score === "number" ? body.score : undefined;
  const notes = typeof body.notes === "string" ? body.notes : undefined;
  const rating = typeof body.rating === "number" ? body.rating : undefined;

  try {
    const result = await completeLesson(user, params.slug, {
      timeSpentSec,
      score,
      notes,
      rating,
    });

    return NextResponse.json({
      success: true,
      data: {
        lessonId: result.lesson.id,
        lessonSlug: result.lesson.slug,
        status: result.progress.status,
        xpEarned: result.xpEarned,
        bonusXpEarned: result.bonusXpEarned,
        unlockedLessons: result.unlockedLessons,
        achievementsUnlocked: result.achievementsUnlocked,
        progress: result.progress,
        stats: result.stats,
        gamification: result.gamification,
      },
    });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "prerequisite_not_met") {
      return NextResponse.json({ success: false, error: "prerequisite_not_met" }, { status: 400 });
    }
    if (message === "lesson_not_found") {
      return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
    }

    console.error(`POST /api/curriculum/lessons/${params?.slug}/complete error`, error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
