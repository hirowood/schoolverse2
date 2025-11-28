import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assertRateLimit } from "@/lib/rateLimit";
import { appendOcrToNote } from "@/lib/notes/service";
import { noteOcrSchema } from "@/lib/schemas/note";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/notes/[id]/ocr:post", 10, 60_000);
  } catch (error) {
    const err = error as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const validation = noteOcrSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "validation_error", details: validation.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const entries = await appendOcrToNote(params.id, validation.data, user.id);
    return NextResponse.json({ ocrTexts: entries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "note_not_found" }, { status: 404 });
  }
}
