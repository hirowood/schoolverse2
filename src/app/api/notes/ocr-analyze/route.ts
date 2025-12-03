// src/app/api/notes/ocr-analyze/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { assertRateLimit } from "@/lib/rateLimit";
import { analyzeAll } from "@/lib/ai/analyzer";
import type { OcrAnalyzeOptions, OcrAnalyzeResult } from "@/lib/ai/types";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // レート制限（1分間に5回まで）
  try {
    assertRateLimit(user.id, "/api/notes/ocr-analyze", 5, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 }
    );
  }

  let body: {
    ocrText: string;
    noteId?: string;
    options?: OcrAnalyzeOptions;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { ocrText, noteId, options = {} } = body;

  if (!ocrText || typeof ocrText !== "string") {
    return NextResponse.json({ error: "ocrText is required" }, { status: 400 });
  }

  const startTime = Date.now();

  try {
    // AI分析を実行
    const generateSummary = options.generateSummary !== false;
    const generateTags = options.generateTags !== false;

    let analysis = null;
    let summary = null;
    let tags: string[] = [];

    if (process.env.ANTHROPIC_API_KEY) {
      const result = await analyzeAll(ocrText);
      analysis = result.analysis;
      summary = generateSummary ? result.summary : null;
      tags = generateTags ? result.tags : [];
    }

    // ノートIDが指定されている場合は更新
    if (noteId) {
      const existingNote = await prisma.note.findUnique({
        where: { id: noteId },
        select: { userId: true },
      });

      if (!existingNote) {
        return NextResponse.json({ error: "note_not_found" }, { status: 404 });
      }

      if (existingNote.userId !== user.id) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }

      await prisma.note.update({
        where: { id: noteId },
        data: {
          ocrRawText: ocrText,
          aiSummary: summary,
          aiAnalysis: analysis ?? Prisma.JsonNull,
          autoTags: tags ?? Prisma.JsonNull,
          analyzedAt: new Date(),
        },
      });
    }

    const processingTime = Date.now() - startTime;

    const result: OcrAnalyzeResult = {
      ocrText,
      confidence: 0.85, // OCRはクライアント側で実行されるため、ここではデフォルト値
      summary: summary ?? undefined,
      analysis: analysis ?? undefined,
      suggestedTags: tags,
      processingTime,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("OCR analyze error:", error);
    return NextResponse.json(
      { error: "analysis_failed" },
      { status: 500 }
    );
  }
}
