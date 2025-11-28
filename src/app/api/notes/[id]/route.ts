import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assertRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { notePatchSchema } from "@/lib/schemas/note";
import { mapNoteRecord, normalizeTags } from "@/lib/notes/service";

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/notes/[id]:get", 120, 60_000);
  } catch (error) {
    const err = error as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: user.id },
    include: { relatedTask: { select: { title: true } } },
  });
  if (!note) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ note: mapNoteRecord(note) });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/notes/[id]:patch", 60, 60_000);
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

  const validation = notePatchSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "validation_error", details: validation.error.flatten() },
      { status: 400 },
    );
  }

  const note = await prisma.note.findUnique({ where: { id: params.id } });
  if (!note || note.userId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (validation.data.relatedTaskId) {
    const task = await prisma.studyTask.findUnique({
      where: { id: validation.data.relatedTaskId },
    });
    if (!task || task.userId !== user.id) {
      return NextResponse.json({ error: "invalid_related_task" }, { status: 400 });
    }
  }

  const updated = await prisma.note.update({
    where: { id: params.id },
    data: {
      ...(validation.data.title !== undefined ? { title: validation.data.title ?? null } : {}),
      ...(validation.data.content !== undefined ? { content: validation.data.content ?? null } : {}),
      ...(validation.data.drawingData !== undefined ? { drawingData: validation.data.drawingData ?? null } : {}),
      ...(validation.data.templateType !== undefined ? { templateType: validation.data.templateType ?? null } : {}),
      ...(validation.data.templateData !== undefined
        ? { templateData: validation.data.templateData ?? null }
        : {}),
      ...(validation.data.tags !== undefined
        ? { tags: normalizeTags(validation.data.tags) ?? null }
        : {}),
      ...(validation.data.isShareable !== undefined
        ? { isShareable: validation.data.isShareable }
        : {}),
      ...(validation.data.imageFiles !== undefined ? { imageFiles: validation.data.imageFiles } : {}),
      ...(validation.data.ocrTexts !== undefined ? { ocrTexts: validation.data.ocrTexts } : {}),
      ...(validation.data.relatedTaskId !== undefined
        ? { relatedTaskId: validation.data.relatedTaskId ?? null }
        : {}),
    },
  include: { relatedTask: { select: { title: true } } },
  });

  return NextResponse.json({ note: mapNoteRecord(updated) });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/notes/[id]:delete", 30, 60_000);
  } catch (error) {
    const err = error as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const deleted = await prisma.note.deleteMany({
    where: { id: params.id, userId: user.id },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
