// src/app/api/notes/[id]/tags/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTags } from "@/lib/ai/analyzer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// タグ一覧取得
export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: noteId } = await params;

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: {
      id: true,
      userId: true,
      tags: true,
      autoTags: true,
    },
  });

  if (!note) {
    return NextResponse.json({ error: "note_not_found" }, { status: 404 });
  }

  if (note.userId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // tagsはJSON、autoTagsはString[]
  const manualTags = Array.isArray(note.tags) ? note.tags : [];

  return NextResponse.json({
    manualTags,
    autoTags: note.autoTags,
    allTags: [...new Set([...manualTags, ...note.autoTags])],
  });
}

// タグ追加
export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: noteId } = await params;

  let body: { tag?: string; tags?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // 単一タグまたは複数タグを受け付ける
  const newTags = body.tags ?? (body.tag ? [body.tag] : []);
  
  if (newTags.length === 0) {
    return NextResponse.json({ error: "tag_required" }, { status: 400 });
  }

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { id: true, userId: true, tags: true },
  });

  if (!note) {
    return NextResponse.json({ error: "note_not_found" }, { status: 404 });
  }

  if (note.userId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const currentTags = Array.isArray(note.tags) ? (note.tags as string[]) : [];
  const updatedTags = [...new Set([...currentTags, ...newTags])];

  await prisma.note.update({
    where: { id: noteId },
    data: { tags: updatedTags },
  });

  return NextResponse.json({ tags: updatedTags });
}

// タグ削除
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: noteId } = await params;

  let body: { tag: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.tag) {
    return NextResponse.json({ error: "tag_required" }, { status: 400 });
  }

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { id: true, userId: true, tags: true },
  });

  if (!note) {
    return NextResponse.json({ error: "note_not_found" }, { status: 404 });
  }

  if (note.userId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const currentTags = Array.isArray(note.tags) ? (note.tags as string[]) : [];
  const updatedTags = currentTags.filter((t) => t !== body.tag);

  await prisma.note.update({
    where: { id: noteId },
    data: { tags: updatedTags },
  });

  return NextResponse.json({ tags: updatedTags });
}

// タグ再生成
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: noteId } = await params;

  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    return NextResponse.json({ error: "note_not_found" }, { status: 404 });
  }

  if (note.userId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const textToAnalyze = note.content ?? note.ocrRawText ?? "";

  if (!textToAnalyze.trim()) {
    return NextResponse.json(
      { error: "no_content_to_analyze" },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ai_not_configured" },
      { status: 503 }
    );
  }

  try {
    const newTags = await generateTags(textToAnalyze);

    await prisma.note.update({
      where: { id: noteId },
      data: {
        autoTags: newTags,
        analyzedAt: new Date(),
      },
    });

    return NextResponse.json({ autoTags: newTags });
  } catch (error) {
    console.error("Tag regeneration error:", error);
    return NextResponse.json(
      { error: "regeneration_failed" },
      { status: 500 }
    );
  }
}
