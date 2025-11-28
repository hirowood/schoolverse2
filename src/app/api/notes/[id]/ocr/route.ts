import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addOcrTextToNote } from "@/lib/notes/service";
import { ocrTextSchema } from "@/lib/schemas/note";

// POST: OCRテキスト追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = ocrTextSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
  }

  try {
    const ocrTexts = await addOcrTextToNote(id, session.user.id, validation.data);
    return NextResponse.json({ ocrTexts });
  } catch (error) {
    if (error instanceof Error && error.message === "Note not found") {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    throw error;
  }
}
