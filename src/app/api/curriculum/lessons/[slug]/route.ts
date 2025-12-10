import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { getLessonWithProgress } from "@/lib/curriculum/progress-service";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  try {
    const user = await getSessionUser();
    const result = await getLessonWithProgress(user, slug);
    if (!result) {
      return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        lesson: result.lesson,
        progress: result.progress,
        isUnlocked: result.isUnlocked,
      },
    });
  } catch (error) {
    console.error(`GET /api/curriculum/lessons/${slug} error`, error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
