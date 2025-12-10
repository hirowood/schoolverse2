import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { getProgressOverview } from "@/lib/curriculum/progress-service";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const overview = await getProgressOverview(user);
    return NextResponse.json({
      success: true,
      data: {
        stats: overview.stats,
        progressByLine: overview.progressByLine,
        lessons: overview.lessons.map(({ lesson, progress, isUnlocked }) => ({
          lesson: {
            slug: lesson.slug,
            lineId: lesson.lineId,
            title: lesson.title,
            description: lesson.description,
            estimatedMinutes: lesson.estimatedMinutes,
            xpReward: lesson.xpReward,
            bonusXp: lesson.bonusXp,
            prerequisites: lesson.prerequisites,
            tags: lesson.tags,
            order: lesson.order,
          },
          progress,
          isUnlocked,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/curriculum/progress error", error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
