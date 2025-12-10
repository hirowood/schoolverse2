import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { getLessonWithProgress } from "@/lib/curriculum/progress-service";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const user = await getSessionUser();
    const result = await getLessonWithProgress(user, params.slug);
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
    console.error(`GET /api/curriculum/lessons/${params?.slug} error`, error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
