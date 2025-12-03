// src/app/api/notes/[id]/analyze/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { assertRateLimit } from "@/lib/rateLimit";
import { analyzeAll } from "@/lib/ai/analyzer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // レート制限
  try {
    assertRateLimit(user.id, "/api/notes/analyze", 10, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 }
    );
  }

  const { id: noteId } = await params;

  // ノート取得
  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    return NextResponse.json({ error: "note_not_found" }, { status: 404 });
  }

  if (note.userId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // リクエストボディ（オプション）
  let body: {
    content?: string;
    options?: {
      regenerateSummary?: boolean;
      regenerateTags?: boolean;
    };
  } = {};

  try {
    body = await request.json();
  } catch {
    // ボディがなくてもOK
  }

  // 分析対象テキストを決定
  const textToAnalyze = body.content ?? note.content ?? note.ocrRawText ?? "";

  if (!textToAnalyze.trim()) {
    return NextResponse.json(
      { error: "no_content_to_analyze" },
      { status: 400 }
    );
  }

  // APIキー確認
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ai_not_configured" },
      { status: 503 }
    );
  }

  try {
    // AI分析を実行
    const result = await analyzeAll(textToAnalyze);

    // ノートを更新
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        aiSummary: result.summary,
        aiAnalysis: result.analysis
          ? (result.analysis as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        autoTags: result.tags ?? [],
        analyzedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: result.summary,
        analysis: result.analysis,
        tags: result.tags,
        analyzedAt: updatedNote.analyzedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Note analysis error:", error);
    return NextResponse.json(
      { error: "analysis_failed" },
      { status: 500 }
    );
  }
}

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
      aiSummary: true,
      aiAnalysis: true,
      autoTags: true,
      analyzedAt: true,
    },
  });

  if (!note) {
    return NextResponse.json({ error: "note_not_found" }, { status: 404 });
  }

  if (note.userId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    summary: note.aiSummary,
    analysis: note.aiAnalysis,
    tags: note.autoTags,
    analyzedAt: note.analyzedAt?.toISOString() ?? null,
  });
}
