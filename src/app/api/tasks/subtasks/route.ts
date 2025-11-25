import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rateLimit";

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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/tasks/subtasks:post", 40, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  await ensureUser({ id: user.id, email: user.email });

  const body = (await request.json()) as { taskId?: string; title?: string };
  if (!body.taskId || !body.title?.trim()) {
    return NextResponse.json({ error: "taskId_and_title_required" }, { status: 400 });
  }

  const task = await prisma.studyTask.findFirst({ where: { id: body.taskId, userId: user.id } });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const subtask = await prisma.taskSubtask.create({
    data: {
      taskId: task.id,
      title: body.title.trim(),
    },
  });

  return NextResponse.json({ subtask });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/tasks/subtasks:patch", 60, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  await ensureUser({ id: user.id, email: user.email });

  const body = (await request.json()) as { id?: string; status?: string };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id_and_status_required" }, { status: 400 });
  }

  // ensure ownership
  const sub = await prisma.taskSubtask.findUnique({
    where: { id: body.id },
    include: { task: { select: { userId: true } } },
  });
  if (!sub || sub.task.userId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.taskSubtask.update({
    where: { id: body.id },
    data: { status: body.status },
  });

  // 親の完了状態を再計算
  const all = await prisma.taskSubtask.findMany({
    where: { taskId: sub.taskId },
    select: { status: true },
  });
  const allDone = all.length > 0 && all.every((s) => s.status === "done");

  if (allDone) {
    await prisma.studyTask.update({
      where: { id: sub.taskId },
      data: { status: "done" },
    });
  } else if (body.status !== "done") {
    // 子が非doneの場合は親をin_progressに寄せる
    await prisma.studyTask.update({
      where: { id: sub.taskId },
      data: { status: "in_progress" },
    });
  }

  return NextResponse.json({ ok: true });
}
