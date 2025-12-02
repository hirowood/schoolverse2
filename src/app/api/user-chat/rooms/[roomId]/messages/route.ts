import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";
import { ListRoomMessagesQuerySchema, SendRoomMessageSchema } from "@/lib/schemas/userChat";
import { notifyMessage } from "@/lib/user-chat/hub";

type RouteParams = { params: { roomId: string } };

const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const forbidden = () => NextResponse.json({ error: "forbidden" }, { status: 403 });
const notFound = () => NextResponse.json({ error: "not_found" }, { status: 404 });

async function ensureMember(roomId: string, userId: string) {
  return prisma.chatRoomMember.findFirst({ where: { roomId, userId } });
}

export async function GET(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) return unauthorized();

  try {
    assertRateLimit(user.id, "/api/user-chat/messages:get", 180, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const isMember = await ensureMember(params.roomId, user.id);
  if (!isMember) return forbidden();

  const { searchParams } = new URL(request.url);
  const parsed = ListRoomMessagesQuerySchema.safeParse({
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const { cursor, limit } = parsed.data;
  const take = limit + 1;

  const messages = await prisma.chatRoomMessage.findMany({
    where: { roomId: params.roomId },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      sender: { select: { id: true, name: true, email: true } },
      reads: true,
    },
  });

  const hasNext = messages.length > limit;
  const trimmed = hasNext ? messages.slice(0, limit) : messages;
  const nextCursor = hasNext ? trimmed[trimmed.length - 1]?.id ?? null : null;

  return NextResponse.json({
    messages: trimmed
      .map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      }))
      .reverse(),
    nextCursor,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) return unauthorized();

  try {
    assertRateLimit(user.id, "/api/user-chat/messages:post", 120, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const member = await ensureMember(params.roomId, user.id);
  if (!member) return forbidden();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = SendRoomMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const message = await prisma.chatRoomMessage.create({
    data: {
      roomId: params.roomId,
      senderId: user.id,
      content: parsed.data.content.trim(),
    },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      reads: true,
    },
  });

  await prisma.chatRoom.update({
    where: { id: params.roomId },
    data: { lastMessageAt: message.createdAt },
  });

  notifyMessage(params.roomId, {
    ...message,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
    sender: message.sender ?? undefined,
  });

  return NextResponse.json({
    message: {
      ...message,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    },
  });
}
