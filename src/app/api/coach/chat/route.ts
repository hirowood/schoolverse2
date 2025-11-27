// src/app/api/coach/chat/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";
import { ChatRequestSchema } from "@/lib/schemas/coachChat";
import { buildChatContext } from "@/lib/coach/contextBuilder";
import { generateChatReply } from "@/lib/coach/chatService";

const MAX_HISTORY = 20;
const MAX_KEEP = 500;

// ユーザー存在確認・作成
const ensureUser = async (user: { id: string; email: string; name?: string | null }) => {
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name: user.name ?? user.email,
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.name ?? user.email,
    },
  });
};

// フォールバック用のダミー返答（LLM接続失敗時）
const generateFallbackReply = (message: string): string => {
  const trimmed = message.trim();
  if (!trimmed) return "もう少し詳しく教えてください。";
  return `「${trimmed.slice(0, 30)}${trimmed.length > 30 ? "..." : ""}」について考えてみましょう。まずは5分の小さな行動から始めてみてください。`;
};

// チャット履歴取得
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/coach/chat:get", 60, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 }
    );
  }

  const rows = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY,
  });

  const messages = rows
    .map((row) => ({
      id: row.id,
      role: row.role,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
    }))
    .reverse();

  return NextResponse.json({ messages });
}

// メッセージ送信
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/coach/chat:post", 30, 60_000);
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

  // zodバリデーション
  const parseResult = ChatRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "invalid_message", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { message } = parseResult.data;

  // ユーザー存在確認
  await ensureUser({ id: user.id, email: user.email, name: user.name });

  // LLMで返答生成
  let reply: string;
  try {
    // ANTHROPIC_API_KEYが設定されているか確認
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY is not set, using fallback reply");
      reply = generateFallbackReply(message);
    } else {
      const context = await buildChatContext(user.id);
      reply = await generateChatReply(message, context);
    }
  } catch (error) {
    console.error("Chat generation error:", error);
    // LLMエラー時はフォールバック
    reply = generateFallbackReply(message);
  }

  // メッセージ保存
  const [userMessage, assistantMessage] = await prisma.$transaction(async (tx) => {
    const u = await tx.chatMessage.create({
      data: {
        userId: user.id!,
        role: "user",
        message: message.trim(),
      },
    });
    const a = await tx.chatMessage.create({
      data: {
        userId: user.id!,
        role: "assistant",
        message: reply,
      },
    });
    return [u, a];
  });

  // 古いメッセージの削除（上限を超えた場合）
  const total = await prisma.chatMessage.count({ where: { userId: user.id } });
  if (total > MAX_KEEP) {
    const overflow = total - MAX_KEEP;
    const oldIds = await prisma.chatMessage.findMany({
      select: { id: true },
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      take: overflow,
    });
    if (oldIds.length) {
      await prisma.chatMessage.deleteMany({
        where: { id: { in: oldIds.map((o) => o.id) } },
      });
    }
  }

  return NextResponse.json({
    userMessage: {
      id: userMessage.id,
      role: userMessage.role,
      message: userMessage.message,
      createdAt: userMessage.createdAt.toISOString(),
    },
    assistantMessage: {
      id: assistantMessage.id,
      role: assistantMessage.role,
      message: assistantMessage.message,
      createdAt: assistantMessage.createdAt.toISOString(),
    },
  });
}
