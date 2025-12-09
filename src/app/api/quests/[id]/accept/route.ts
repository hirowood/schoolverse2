import { NextResponse } from "next/server";
import { mockActionResponse } from "@/lib/quests/mock-data";

type Params = {
  params: { id: string };
};

export async function POST(_: Request, { params }: Params) {
  const { id } = params;
  const result = mockActionResponse(id, "accepted");
  if (!result.success) {
    return NextResponse.json({ success: false }, { status: 404 });
  }
  return NextResponse.json(result);
}
