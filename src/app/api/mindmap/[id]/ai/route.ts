// src/app/api/mindmap/[id]/ai/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assertRateLimit } from "@/lib/rateLimit";
import {
  buildMindMapContext,
  generateMindMapAIResponse,
  type MindMapAIRequest,
} from "@/lib/coach/mindmapService";
import { z } from "zod";

// リクエストスキーマ
const AIRequestSchema = z.object({
  action: z.enum([
    "analyze",
    "suggest_breakdown",
    "suggest_wbs",
    "next_action",
    "progress_feedback",
    "chat",
  ]),
  message: z.string().max(1000).optional(),
  selectedNodeId: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: mindMapId } = await params;
  
  // 認証チェック
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // レート制限
  try {
    assertRateLimit(user.id, `/api/mindmap/${mindMapId}/ai`, 20, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 }
    );
  }

  // リクエストボディのパース
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // バリデーション
  const parseResult = AIRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "invalid_request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const aiRequest: MindMapAIRequest = parseResult.data;

  // マインドマップのコンテキストを構築
  const context = await buildMindMapContext(mindMapId, user.id);
  
  if (!context) {
    return NextResponse.json(
      { error: "mindmap_not_found" },
      { status: 404 }
    );
  }

  // ANTHROPIC_API_KEYチェック
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      message: getFallbackResponse(aiRequest.action),
      suggestions: undefined,
    });
  }

  try {
    const response = await generateMindMapAIResponse(context, aiRequest);
    return NextResponse.json(response);
  } catch (error) {
    console.error("MindMap AI error:", error);
    return NextResponse.json(
      { error: "ai_error", message: "AIからの応答を取得できませんでした" },
      { status: 500 }
    );
  }
}

// フォールバック応答
function getFallbackResponse(action: string): string {
  const responses: Record<string, string> = {
    analyze: "マインドマップを確認しました。まずは大きなタスクを小さく分解してみましょう。一つずつ進めていけば、必ず達成できます！",
    suggest_breakdown: "タスクを分解するコツは、「5分で始められる」サイズにすることです。まずは最初の一歩を考えてみてください。",
    suggest_wbs: "期限と工数を設定すると、計画が立てやすくなります。無理のない範囲で設定してみましょう。",
    next_action: "今日できる小さな一歩から始めましょう。完璧を目指さず、まず行動することが大切です！",
    progress_feedback: "進捗を確認できていますね！少しずつでも前に進んでいることを認めてあげてください。",
    chat: "何でも相談してくださいね。一緒に考えていきましょう！",
  };
  return responses[action] || "一緒に頑張りましょう！";
}
