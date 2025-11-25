import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";

const MAX_HISTORY = 20;
const MAX_KEEP = 500;

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

const generateAssistantReply = (message: string) => {
  const trimmed = message.trim();
  if (!trimmed) return "もう少し詳しく教えてください。";
  return `了解です。「${trimmed}」に基づいて、次の一歩を考えましょう。まずは5分の行動から始めてみてください。`;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/coach/chat:get", 60, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/coach/chat:post", 30, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const { message } = (await request.json()) as { message?: string };
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  await ensureUser({ id: user.id, email: user.email, name: user.name });

  const reply = generateAssistantReply(message);

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

  // limit stored messages per user
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
