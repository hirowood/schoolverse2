import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { skipQuest } from "@/lib/quests/service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { reason?: string };

  try {
    const result = await skipQuest(userId, id, body.reason);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[quests/skip] error", error);
    if ((error as Error).message === "NOT_FOUND") return NextResponse.json({ error: "Not Found" }, { status: 404 });
    if ((error as Error).message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if ((error as Error).message === "INVALID_STATE") return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
