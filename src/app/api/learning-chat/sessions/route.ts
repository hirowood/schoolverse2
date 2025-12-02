import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";
import {
  CreateSessionSchema,
  ListSessionsQuerySchema,
} from "@/lib/schemas/learningChat";
import { ChatMode } from "@/features/learning-chat/types";

const ensureUser = async (user: { id: string; email: string; name?: string | null }) => {
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email, name: user.name ?? user.email },
    create: { id: user.id, email: user.email, name: user.name ?? user.email },
  });
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/learning-chat/sessions:get", 120, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = {
    mode: searchParams.get("mode") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
  };
  const parsed = ListSessionsQuerySchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const { mode, limit, cursor } = parsed.data;
  const take = limit + 1;
  const sessions = await prisma.learningChatSession.findMany({
    where: {
      userId: user.id,
      ...(mode ? { mode } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasNext = sessions.length > limit;
  const trimmed = hasNext ? sessions.slice(0, limit) : sessions;
  const nextCursor = hasNext ? trimmed[trimmed.length - 1]?.id ?? null : null;

  return NextResponse.json({
    sessions: trimmed,
    nextCursor,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/learning-chat/sessions:post", 60, 60_000);
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

  const parsed = CreateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await ensureUser({ id: user.id, email: user.email, name: user.name });

  const created = await prisma.learningChatSession.create({
    data: {
      userId: user.id,
      mode: parsed.data.mode ?? ChatMode.LEARNING,
      category: parsed.data.category,
      title: "新しい相談",
    },
  });

  if (parsed.data.initialMessage) {
    await prisma.learningChatMessage.create({
      data: {
        sessionId: created.id,
        role: "user",
        content: parsed.data.initialMessage.trim(),
        category: parsed.data.category ?? created.category,
      },
    });
  }

  return NextResponse.json({ session: created });
}
