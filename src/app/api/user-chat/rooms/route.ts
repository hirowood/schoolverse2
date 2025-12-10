import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";
import { CreateRoomSchema, ListRoomsQuerySchema } from "@/lib/schemas/userChat";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/user-chat/rooms:get", 120, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = ListRoomsQuerySchema.safeParse({
    type: searchParams.get("type") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const { type, cursor, limit } = parsed.data;
  const take = limit + 1;

  const rooms = await prisma.chatRoom.findMany({
    where: {
      members: { some: { userId: user.id } },
      ...(type ? { type } : {}),
    },
    orderBy: [
      { lastMessageAt: "desc" },
      { updatedAt: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true, email: true } } },
      },
    },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasNext = rooms.length > limit;
  const trimmed = hasNext ? rooms.slice(0, limit) : rooms;
  const nextCursor = hasNext ? trimmed[trimmed.length - 1]?.id ?? null : null;

  const roomsWithUnread = await Promise.all(
    trimmed.map(async (room) => {
      const myMembership = room.members.find((m) => m.userId === user.id);
      const unreadCount = await prisma.chatRoomMessage.count({
        where: {
          roomId: room.id,
          senderId: { not: user.id },
          createdAt: { gt: myMembership?.lastSeenAt ?? new Date(0) },
        },
      });
      return {
        ...room,
        unreadCount,
        lastMessage: room.messages[0]
          ? {
            ...room.messages[0],
            createdAt: room.messages[0].createdAt.toISOString(),
            updatedAt: room.messages[0].updatedAt.toISOString(),
          }
          : null,
        messages: undefined,
      };
    }),
  );

  return NextResponse.json({
    rooms: roomsWithUnread,
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
    assertRateLimit(user.id, "/api/user-chat/rooms:post", 60, 60_000);
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

  const parsed = CreateRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const participantIds = Array.from(new Set([user.id, ...parsed.data.participantIds]));

  if (parsed.data.type === "dm") {
    if (participantIds.length !== 2) {
      return NextResponse.json({ error: "dm_requires_single_partner" }, { status: 400 });
    }
    const existing = await prisma.chatRoom.findFirst({
      where: {
        type: "dm",
        members: {
          every: {
            userId: { in: participantIds },
          },
        },
      },
      include: { members: true },
    });
    if (existing) {
      return NextResponse.json({ room: existing });
    }
  }

  const room = await prisma.chatRoom.create({
    data: {
      type: parsed.data.type,
      title: parsed.data.title ?? null,
      createdBy: user.id,
      members: {
        create: participantIds.map((id) => ({
          userId: id,
          role: id === user.id ? "admin" : "member",
        })),
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  return NextResponse.json({ room });
}
