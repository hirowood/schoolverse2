import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { acceptQuest } from "@/lib/quests/service";

type Params = { params: { id: string } };

export async function POST(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await acceptQuest(userId, params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[quests/accept] error", error);
    if ((error as Error).message === "NOT_FOUND") return NextResponse.json({ error: "Not Found" }, { status: 404 });
    if ((error as Error).message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if ((error as Error).message === "INVALID_STATE") return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
