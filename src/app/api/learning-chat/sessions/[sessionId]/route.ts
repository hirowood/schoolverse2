import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";
import { UpdateSessionSchema } from "@/lib/schemas/learningChat";

type RouteParams = {
  params: { sessionId: string };
};

const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const notFound = () => NextResponse.json({ error: "not_found" }, { status: 404 });

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) return unauthorized();

  try {
    assertRateLimit(user.id, "/api/learning-chat/session:get", 120, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const sessionRow = await prisma.learningChatSession.findFirst({
    where: { id: params.sessionId, userId: user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 50,
      },
    },
  });

  if (!sessionRow) return notFound();

  return NextResponse.json({ session: sessionRow });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await getServerSession(authOptions);
  const user = auth?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) return unauthorized();

  try {
    assertRateLimit(user.id, "/api/learning-chat/session:patch", 60, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const target = await prisma.learningChatSession.findFirst({
    where: { id: params.sessionId, userId: user.id },
  });
  if (!target) return notFound();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = UpdateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const updated = await prisma.learningChatSession.update({
    where: { id: params.sessionId },
    data: {
      ...parsed.data,
    },
  });

  return NextResponse.json({ session: updated });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await getServerSession(authOptions);
  const user = auth?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) return unauthorized();

  try {
    assertRateLimit(user.id, "/api/learning-chat/session:delete", 60, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const deleted = await prisma.learningChatSession.deleteMany({
    where: { id: params.sessionId, userId: user.id },
  });

  if (deleted.count === 0) return notFound();

  return NextResponse.json({ ok: true });
}
