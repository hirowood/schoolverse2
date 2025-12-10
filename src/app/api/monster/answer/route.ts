import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { answerEncounter } from "@/lib/virtual-classroom/encounter-service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { encounterId, answer } = (body as Record<string, unknown>) ?? {};
  if (typeof encounterId !== "string" || typeof answer !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await answerEncounter({
    userId: user.id,
    encounterId,
    answer,
  });

  if (!result) {
    return NextResponse.json({ success: false, error: "encounter_not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: result });
}
