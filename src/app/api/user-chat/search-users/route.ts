import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";
import { SearchUsersQuerySchema } from "@/lib/schemas/userChat";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/user-chat/search-users:get", 60, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { error: "rate_limited", retryAfter: err.retryAfter },
      { status: err.status ?? 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = SearchUsersQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const { q, limit } = parsed.data;
  const keyword = q.toLowerCase();

  const results = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: keyword, mode: "insensitive" } },
        { name: { contains: keyword, mode: "insensitive" } },
      ],
      NOT: { id: user.id },
    },
    select: { id: true, name: true, email: true },
    take: limit,
  });

  return NextResponse.json({ users: results });
}
