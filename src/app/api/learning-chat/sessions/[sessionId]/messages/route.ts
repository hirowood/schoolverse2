import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { assertRateLimit } from "@/lib/rateLimit";
import {
  ListMessagesQuerySchema,
  SendMessageSchema,
} from "@/lib/schemas/learningChat";
import { LearningContextManager, estimateTokens } from "@/lib/learning-chat/context-manager";

type RouteParams = { params: { sessionId: string } };

const anthropic =
  process.env.ANTHROPIC_API_KEY?.length && process.env.ANTHROPIC_API_KEY !== "undefined"
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

const contextManager = new LearningContextManager({
  maxTokens: 100_000,
  reservedTokens: 4_000,
  summaryThreshold: 50_000,
  windowSize: 10,
});

const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const notFound = () => NextResponse.json({ error: "not_found" }, { status: 404 });

export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) return unauthorized();

  try {
    assertRateLimit(user.id, "/api/learning-chat/messages:get", 120, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = {
    limit: searchParams.get("limit") ?? undefined,
    before: searchParams.get("before") ?? undefined,
  };
  const parsed = ListMessagesQuerySchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const { limit, before } = parsed.data;
  const take = limit + 1;

  const ownsSession = await prisma.learningChatSession.findFirst({
    where: { id: params.sessionId, userId: user.id },
    select: { id: true },
  });
  if (!ownsSession) return notFound();

  const messages = await prisma.learningChatMessage.findMany({
    where: { sessionId: params.sessionId },
    orderBy: { createdAt: "desc" },
    take,
    ...(before ? { skip: 1, cursor: { id: before } } : {}),
  });

  const hasMore = messages.length > limit;
  const trimmed = hasMore ? messages.slice(0, limit) : messages;

  return NextResponse.json({
    messages: trimmed.reverse(),
    hasMore,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await getServerSession(authOptions);
  const user = auth?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id || !user.email) return unauthorized();

  try {
    assertRateLimit(user.id, "/api/learning-chat/messages:post", 30, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = SendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const chatSession = await prisma.learningChatSession.findFirst({
    where: { id: params.sessionId, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!chatSession) return notFound();

  const content = parsed.data.content.trim();
  const category = parsed.data.category ?? chatSession.category;

  const userMessage = await prisma.learningChatMessage.create({
    data: {
      sessionId: chatSession.id,
      role: "user",
      content,
      category,
      tokenCount: estimateTokens(content),
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      let fullResponse = "";

      try {
        const contextWindow = await contextManager.buildContextWindow(chatSession, [
          ...chatSession.messages,
          userMessage,
        ]);

        const systemPrompt =
          contextWindow.systemPrompt +
          (contextWindow.conversationSummary
            ? `\n\n## これまでの会話の要約\n${contextWindow.conversationSummary}`
            : "");

        if (!anthropic) {
          fullResponse = buildFallbackReply(content);
          enqueue({ type: "delta", content: fullResponse });
        } else {
          const response = await anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            system: systemPrompt,
            messages: contextWindow.recentMessages
              .filter((m) => m.role === "user" || m.role === "assistant")
              .map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
          });

          for await (const event of response) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              fullResponse += event.delta.text;
              enqueue({ type: "delta", content: event.delta.text });
            }
          }
        }

        const assistantMessage = await prisma.learningChatMessage.create({
          data: {
            sessionId: chatSession.id,
            role: "assistant",
            content: fullResponse,
            category,
            tokenCount: estimateTokens(fullResponse),
            model: "claude-sonnet-4-20250514",
            codeBlocks: extractCodeBlocks(fullResponse) ?? Prisma.JsonNull,
          },
        });

        const newTotalTokens =
          (chatSession.totalTokens ?? 0) + userMessage.tokenCount + assistantMessage.tokenCount;

        await prisma.learningChatSession.update({
          where: { id: chatSession.id },
          data: { totalTokens: newTotalTokens, category: category ?? chatSession.category },
        });

        if (newTotalTokens > contextManager.config.summaryThreshold) {
          const summary = await contextManager.generateSummary(chatSession, [
            ...chatSession.messages,
            userMessage,
            assistantMessage,
          ]);
          await prisma.learningChatSession.update({
            where: { id: chatSession.id },
            data: { contextSummary: summary },
          });
        }

        enqueue({ type: "done", messageId: assistantMessage.id });
      } catch (error) {
        console.error("learning chat stream error", error);
        enqueue({
          type: "error",
          message: (error as Error).message ?? "unknown_error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function extractCodeBlocks(content: string): { blocks: Array<{ language: string; code: string }> } | null {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];

  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || "text",
      code: match[2].trim(),
    });
  }

  return blocks.length > 0 ? { blocks } : null;
}

function buildFallbackReply(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "質問内容が確認できませんでした。もう一度教えてください。";
  return `「${trimmed.slice(0, 40)}」について一緒に考えてみましょう。詳しく教えてもらえますか？`;
}
