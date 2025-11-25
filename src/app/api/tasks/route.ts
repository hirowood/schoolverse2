import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";

type TaskPayload = {
  title: string;
  description?: string | null;
  date?: string | null;
  time?: string | null;
  note?: string | null;
  subtasks?: { title: string }[];
};

const parseDateTime = (date?: string | null, time?: string | null) => {
  if (!date) return null;
  const base = `${date}T${time ?? "00:00"}:00.000Z`;
  const d = new Date(base);
  return Number.isNaN(d.getTime()) ? null : d;
};

const ensureUser = async (user: { id?: string; email: string; name?: string | null }) => {
  if (user.id) {
    const upserted = await prisma.user.upsert({
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
    return upserted.id;
  }

  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      email: user.email,
      name: user.name ?? user.email,
    },
  });
  return created.id;
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/tasks:get", 60, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const userId = await ensureUser({ id: user.id, email: user.email });

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const start = dateParam ? parseDateTime(dateParam, "00:00") : null;
  const end = start ? new Date(start.getTime() + 24 * 60 * 60 * 1000) : null;

  const tasks = await prisma.studyTask.findMany({
    where: {
      userId,
      ...(start && end
        ? {
            dueDate: {
              gte: start,
              lt: end,
            },
          }
        : {}),
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
    include: { subtasks: true },
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/tasks:post", 20, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const userId = await ensureUser({ id: user.id, email: user.email });

  const body = (await request.json()) as TaskPayload;
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  const dueDate = parseDateTime(body.date, body.time);

  const task = await prisma.studyTask.create({
    data: {
      userId,
      title: body.title.trim(),
      description: body.description?.trim() ?? null,
      dueDate: dueDate ?? undefined,
      note: body.note?.trim() ?? null,
      subtasks: body.subtasks?.length
        ? {
            create: body.subtasks.map((s) => ({ title: s.title.trim(), status: "todo" })),
          }
        : undefined,
    },
    include: { subtasks: true },
  });

  return NextResponse.json({ task });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/tasks:patch", 30, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const userIdForPatch = await ensureUser({ id: user.id, email: user.email });

  const body = (await request.json()) as {
    id?: string;
    status?: string;
    title?: string;
    description?: string | null;
    date?: string | null;
    time?: string | null;
  };
  if (!body.id) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  const dueDate = parseDateTime(body.date, body.time);

  const updated = await prisma.studyTask.updateMany({
    where: { id: body.id, userId: userIdForPatch },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.title ? { title: body.title.trim() } : {}),
      description: body.description !== undefined ? body.description?.trim() ?? null : undefined,
      dueDate: body.date !== undefined ? dueDate ?? null : undefined,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
