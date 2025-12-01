// src/app/api/notes/[id]/coach/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";
import { createAnthropicClient } from "@/lib/llm/anthropic";
import type { LLMMessage } from "@/lib/llm/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// テンプレートタイプに応じたプロンプトを生成
function buildNoteCoachPrompt(note: {
  title: string | null;
  content: string | null;
  templateType: string | null;
  templateData: unknown;
}): string {
  const templateType = note.templateType || "free";
  
  let templateContext = "";
  if (note.templateData && typeof note.templateData === "object") {
    const data = note.templateData as Record<string, string>;
    
    if (templateType === "fact-feeling") {
      templateContext = `
【感情と事実の整理】
- 状況: ${data.situation || "未記入"}
- 事実: ${data.facts || "未記入"}
- 感情: ${data.feelings || "未記入"}
- 思考: ${data.thoughts || "未記入"}
- ニーズ: ${data.needs || "未記入"}
- 行動: ${data.actions || "未記入"}
`;
    } else if (templateType === "5w2h") {
      templateContext = `
【5W2H分析】
- What（何を）: ${data.what || "未記入"}
- Why（なぜ）: ${data.why || "未記入"}
- Who（誰が）: ${data.who || "未記入"}
- When（いつ）: ${data.when || "未記入"}
- Where（どこで）: ${data.where || "未記入"}
- How（どうやって）: ${data.how || "未記入"}
- How much（どれくらい）: ${data.howMuch || "未記入"}
`;
    } else if (templateType === "5why") {
      templateContext = `
【5Why分析】
- 課題: ${data.problem || "未記入"}
- なぜ1: ${data.why1 || "未記入"}
- なぜ2: ${data.why2 || "未記入"}
- なぜ3: ${data.why3 || "未記入"}
- なぜ4: ${data.why4 || "未記入"}
- なぜ5: ${data.why5 || "未記入"}
- 結論・対策: ${data.conclusion || "未記入"}
`;
    }
  }

  return `あなたは14〜18歳の学生をサポートするAIコーチです。
学生が書いたノートを読んで、温かく建設的なフィードバックを提供してください。

## あなたの役割
- 学生の気づきや努力を認め、励ます
- 感情と事実を分けて考える視点を提供する
- 次のステップや行動のヒントを提案する
- 批判的にならず、成長を促す言葉を選ぶ

## フィードバックのポイント
1. まず良い点や努力を具体的に褒める
2. テンプレートに応じた視点でコメントする
3. 次に試せそうな小さなアクションを1〜2つ提案する
4. 最後に励ましの言葉で締めくくる

## テンプレートタイプ: ${templateType}
${templateContext}

## 学生のノート
タイトル: ${note.title || "無題"}
本文:
${note.content || "（本文なし）"}

---
上記のノートに対して、日本語で300〜500文字程度のフィードバックを提供してください。
絵文字を適度に使い、親しみやすいトーンで書いてください。`;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // レート制限
  try {
    assertRateLimit(user.id, "/api/notes/coach", 10, 60_000);
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

  // APIキー確認
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      feedback: `📝 ノートを拝見しました！

しっかり振り返りができていますね。自分の考えや感情を言葉にすることは、とても大切なスキルです。

💡 次のステップとして：
- 今日書いたことを明日もう一度読み返してみましょう
- 気づいたことを誰かに話してみるのも良いかもしれません

これからも一緒に成長していきましょう！ 🌱`,
    });
  }

  try {
    const llm = createAnthropicClient();
    const systemPrompt = buildNoteCoachPrompt({
      title: note.title,
      content: note.content,
      templateType: note.templateType,
      templateData: note.templateData,
    });

    const messages: LLMMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "このノートへのフィードバックをお願いします。" },
    ];

    const response = await llm.chat(messages, {
      maxTokens: 800,
      temperature: 0.7,
    });

    // フィードバックを保存（オプション）
    await prisma.note.update({
      where: { id: noteId },
      data: {
        // coachFeedbackフィールドがあれば保存
        // coachFeedback: response.content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ feedback: response.content });
  } catch (error) {
    console.error("Coach feedback error:", error);
    return NextResponse.json(
      { error: "feedback_generation_failed" },
      { status: 500 }
    );
  }
}
