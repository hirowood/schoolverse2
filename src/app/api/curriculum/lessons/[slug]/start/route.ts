import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { startLesson } from "@/lib/curriculum/progress-service";

type RouteParams = { params: Promise<{ slug: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await startLesson(user, slug);
    return NextResponse.json({
      success: true,
      data: {
        lesson: result.lesson,
        progress: result.progress,
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

    console.error(`POST /api/curriculum/lessons/${slug}/start error`, error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
