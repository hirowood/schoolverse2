import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";
import { MarkReadSchema } from "@/lib/schemas/userChat";
import { notifyRead } from "@/lib/user-chat/hub";

type RouteParams = { params: Promise<{ roomId: string }> };

const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const forbidden = () => NextResponse.json({ error: "forbidden" }, { status: 403 });

export async function POST(request: Request, { params }: RouteParams) {
  const { roomId } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) return unauthorized();

  try {
    assertRateLimit(user.id, "/api/user-chat/read:post", 240, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const member = await prisma.chatRoomMember.findFirst({
    where: { roomId, userId: user.id },
  });
  if (!member) return forbidden();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = MarkReadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const readAt = new Date();
  await prisma.chatRoomRead.upsert({
    where: { messageId_userId: { messageId: parsed.data.messageId, userId: user.id } },
    update: { readAt },
    create: { messageId: parsed.data.messageId, userId: user.id, readAt },
  });

  await prisma.chatRoomMember.update({
    where: { id: member.id },
    data: { lastSeenAt: readAt },
  });

  notifyRead(roomId, user.id, parsed.data.messageId, readAt.toISOString());

  return NextResponse.json({ ok: true });
}
