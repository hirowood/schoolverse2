import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/settings/profile:get", 20, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  const userRow = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  return NextResponse.json({
    name: userRow?.name ?? "",
    weeklyGoal: profile?.weeklyGoal ?? "",
    activeHours: profile?.activeHours ?? "day",
    coachTone: profile?.coachTone ?? "gentle",
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/settings/profile:post", 10, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const body = (await request.json()) as {
    name?: string;
    weeklyGoal?: string;
    activeHours?: string;
    coachTone?: string;
  };

  await prisma.$transaction(async (tx) => {
    if (body.name !== undefined) {
      await tx.user.update({
        where: { id: user.id },
        data: { name: body.name.trim() || null },
      });
    }
    await tx.userProfile.upsert({
      where: { userId: user.id },
      update: {
        weeklyGoal: body.weeklyGoal ?? null,
        activeHours: body.activeHours ?? "day",
        coachTone: body.coachTone ?? "gentle",
      },
      create: {
        userId: user.id!,
        weeklyGoal: body.weeklyGoal ?? null,
        activeHours: body.activeHours ?? "day",
        coachTone: body.coachTone ?? "gentle",
      },
    });
  });

  return NextResponse.json({ ok: true });
}
