import { NextResponse } from "next/server";
import { mockActionResponse } from "@/lib/quests/mock-data";
import type { CompleteQuestPayload } from "@/types/quest";

type Params = {
  params: { id: string };
};

export async function POST(request: Request, { params }: Params) {
  const { id } = params;
  const _payload = (await request.json().catch(() => ({}))) as CompleteQuestPayload;
  const result = mockActionResponse(id, "completed");
  if (!result.success) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  return NextResponse.json(result);
}
