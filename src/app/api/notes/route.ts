import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assertRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { noteCreateSchema } from "@/lib/schemas/note";
import { ensureUser, mapNoteRecord, normalizeTags } from "@/lib/notes/service";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/notes:get", 120, 60_000);
  } catch (error) {
    const err = error as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const userId = await ensureUser({ id: user.id, email: user.email, name: user.name ?? null });
  if (!userId) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const url = new URL(request.url);
  const templateType = url.searchParams.get("templateType") ?? undefined;
  const query = url.searchParams.get("q") ?? undefined;
  const taskId = url.searchParams.get("taskId") ?? undefined;
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20), 1), 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

  const where: Parameters<typeof prisma.note.findMany>[0]["where"] = {
    userId,
    ...(templateType ? { templateType } : {}),
    ...(taskId ? { relatedTaskId: taskId } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const rows = await prisma.note.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: offset,
    include: { relatedTask: { select: { title: true } } },
  });
  return NextResponse.json({ notes: rows.map(mapNoteRecord) });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/notes:post", 30, 60_000);
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

  const validation = noteCreateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "validation_error", details: validation.error.flatten() },
      { status: 400 },
    );
  }

  const userId = await ensureUser({ id: user.id, email: user.email, name: user.name ?? null });
  if (!userId) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  if (validation.data.relatedTaskId) {
    const task = await prisma.studyTask.findUnique({
      where: { id: validation.data.relatedTaskId },
    });
    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: "invalid_related_task" }, { status: 400 });
    }
  }

  const payload: Parameters<typeof prisma.note.create>[0]["data"] = {
    title: validation.data.title ?? null,
    content: validation.data.content ?? null,
    drawingData: validation.data.drawingData ?? null,
    templateType: validation.data.templateType ?? null,
    templateData: validation.data.templateData ?? null,
    tags: normalizeTags(validation.data.tags) ?? null,
    isShareable: validation.data.isShareable ?? false,
    imageFiles: validation.data.imageFiles ?? null,
    ocrTexts: validation.data.ocrTexts ?? null,
    relatedTaskId: validation.data.relatedTaskId ?? null,
    userId,
  };

  const created = await prisma.note.create({
    data: payload,
    include: { relatedTask: { select: { title: true } } },
  });
  return NextResponse.json({ note: mapNoteRecord(created) });
}
