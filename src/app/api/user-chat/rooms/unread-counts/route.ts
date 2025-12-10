import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const memberships = await prisma.chatRoomMember.findMany({
      where: { userId: user.id },
      select: { roomId: true, lastSeenAt: true },
    });

    const counts: Record<string, number> = {};

    for (const m of memberships) {
      const count = await prisma.chatRoomMessage.count({
        where: {
          roomId: m.roomId,
          senderId: { not: user.id },
          createdAt: { gt: m.lastSeenAt ?? new Date(0) },
        },
      });
      counts[m.roomId] = count;
    }

    return NextResponse.json({ counts });
  } catch (error) {
    console.error("GET /api/user-chat/rooms/unread-counts error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
