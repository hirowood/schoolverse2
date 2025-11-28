import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { noteUpdateSchema } from "@/lib/schemas/note";
import { toNoteRecord, normalizeTags } from "@/lib/notes/service";
import { Prisma } from "@prisma/client";

// GET: ノート詳細
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ note: toNoteRecord(note) });
}

// PATCH: ノート更新
export async function PATCH(
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

  const validation = noteUpdateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
  }

  // 既存ノートの確認
  const existing = await prisma.note.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  // 更新データを構築
  const updateData: Prisma.NoteUpdateInput = {};
  
  if (validation.data.title !== undefined) updateData.title = validation.data.title;
  if (validation.data.content !== undefined) updateData.content = validation.data.content;
  if (validation.data.templateType !== undefined) updateData.templateType = validation.data.templateType;
  if (validation.data.isShareable !== undefined) updateData.isShareable = validation.data.isShareable;
  if (validation.data.relatedTaskId !== undefined) updateData.relatedTaskId = validation.data.relatedTaskId;
  if (validation.data.relatedTaskTitle !== undefined) updateData.relatedTaskTitle = validation.data.relatedTaskTitle;
  
  if (validation.data.drawingData !== undefined) {
    updateData.drawingData = validation.data.drawingData ?? Prisma.JsonNull;
  }
  if (validation.data.templateData !== undefined) {
    updateData.templateData = validation.data.templateData ?? Prisma.JsonNull;
  }
  if (validation.data.tags !== undefined) {
    updateData.tags = normalizeTags(validation.data.tags) ?? Prisma.JsonNull;
  }
  if (validation.data.imageFiles !== undefined) {
    updateData.imageFiles = validation.data.imageFiles ?? Prisma.JsonNull;
  }
  if (validation.data.ocrTexts !== undefined) {
    updateData.ocrTexts = validation.data.ocrTexts ?? Prisma.JsonNull;
  }

  const note = await prisma.note.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ note: toNoteRecord(note) });
}

// DELETE: ノート削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.note.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.note.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
