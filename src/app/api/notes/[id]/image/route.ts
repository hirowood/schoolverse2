import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addImageToNote } from "@/lib/notes/service";
import { imageFileSchema } from "@/lib/schemas/note";
import { randomUUID } from "crypto"; // ★ 追加

// POST: 画像追加
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

  const validation = imageFileSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.flatten() },
      { status: 400 }
    );
  }

  try {
    // ★ ここで id を必ず string に確定させる
    const imageFile = {
      ...validation.data,
      id: validation.data.id ?? randomUUID(),
    };

    const imageFiles = await addImageToNote(id, session.user.id, imageFile);
    return NextResponse.json({ imageFiles });
  } catch (error) {
    if (error instanceof Error && error.message === "Note not found") {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    throw error;
  }
}
