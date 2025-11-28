import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { noteCreateSchema, noteQuerySchema } from "@/lib/schemas/note";
import { toNoteRecord, normalizeTags } from "@/lib/notes/service";
import { Prisma } from "@prisma/client";

// ユーザー確保（存在しなければ作成）
async function ensureUser(sessionUser: { id?: string; email?: string | null; name?: string | null }): Promise<string> {
  if (!sessionUser.id) throw new Error("User ID is required");
  
  const existing = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      id: sessionUser.id,
      email: sessionUser.email ?? `${sessionUser.id}@temp.local`,
      name: sessionUser.name ?? "User",
    },
  });
  return created.id;
}

// GET: ノート一覧
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = noteQuerySchema.safeParse({
    templateType: searchParams.get("templateType") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
  });

  if (!query.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: query.error.flatten() }, { status: 400 });
  }

  const userId = await ensureUser({ 
    id: session.user.id, 
    email: session.user.email, 
    name: (session.user as { name?: string }).name ?? null 
  });

  // 検索条件を構築
  const where: Prisma.NoteWhereInput = {
    userId,
    ...(query.data.templateType && { templateType: query.data.templateType }),
    ...(query.data.search && {
      OR: [
        { title: { contains: query.data.search, mode: "insensitive" as const } },
        { content: { contains: query.data.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const notes = await prisma.note.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: query.data.limit ?? 50,
    skip: query.data.offset ?? 0,
  });

  // タグフィルター（JSON配列なのでアプリ側でフィルタ）
  let filtered = notes;
  if (query.data.tag) {
    filtered = notes.filter((n) => {
      const tags = Array.isArray(n.tags) ? n.tags : [];
      return tags.includes(query.data.tag!);
    });
  }

  return NextResponse.json({ notes: filtered.map(toNoteRecord) });
}

// POST: ノート作成
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = noteCreateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
  }

  const userId = await ensureUser({ 
    id: session.user.id, 
    email: session.user.email, 
    name: (session.user as { name?: string }).name ?? null 
  });

  const note = await prisma.note.create({
    data: {
      userId,
      title: validation.data.title,
      content: validation.data.content,
      templateType: validation.data.templateType ?? "free",

      // ★ここを修正
      drawingData:
        (validation.data.drawingData as Prisma.InputJsonValue | null | undefined) ??
        Prisma.JsonNull,

      templateData: validation.data.templateData ?? Prisma.JsonNull,
      tags: normalizeTags(validation.data.tags) ?? Prisma.JsonNull,
      isShareable: validation.data.isShareable ?? false,
      imageFiles: validation.data.imageFiles ?? Prisma.JsonNull,
      ocrTexts: validation.data.ocrTexts ?? Prisma.JsonNull,
      relatedTaskId: validation.data.relatedTaskId,
      // relatedTaskTitle: validation.data.relatedTaskTitle,
    },
  });

  return NextResponse.json({ note: toNoteRecord(note) }, { status: 201 });
}
