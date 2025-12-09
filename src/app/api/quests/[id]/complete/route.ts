import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { completeQuest } from "@/lib/quests/service";
import type { CompleteQuestPayload } from "@/types/quest";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = (await request.json().catch(() => ({}))) as CompleteQuestPayload;

  try {
    const result = await completeQuest(userId, params.id, payload);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[quests/complete] error", error);
    if ((error as Error).message === "NOT_FOUND") return NextResponse.json({ error: "Not Found" }, { status: 404 });
    if ((error as Error).message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if ((error as Error).message === "INVALID_STATE") return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
