import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mindMapCreateSchema } from "@/lib/schemas/mindmap";

async function ensureUser(sessionUser: { id?: string; email?: string | null; name?: string | null }) {
  if (!sessionUser.id) throw new Error("User ID is required");
  const existing = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (existing) return existing.id;
  const created = await prisma.user.create({
    data: {
      id: sessionUser.id,
      email: sessionUser.email ?? `${sessionUser.id}@temp.local`,
      name: sessionUser.name ?? "User",
    },
  });
  return created.id;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = await ensureUser({
    id: session.user.id,
    email: session.user.email,
    name: (session.user as { name?: string }).name ?? null,
  });

  const mindmaps = await prisma.mindMap.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      note: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ mindmaps });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mindMapCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const userId = await ensureUser({
    id: session.user.id,
    email: session.user.email,
    name: (session.user as { name?: string }).name ?? null,
  });

  if (parsed.data.noteId) {
    const note = await prisma.note.findUnique({ where: { id: parsed.data.noteId, userId } });
    if (!note) {
      return NextResponse.json({ error: "Note not found or not owned" }, { status: 404 });
    }
  }

  const mindMap = await prisma.mindMap.create({
    data: {
      userId,
      title: parsed.data.title ?? "無題のマインドマップ",
      description: parsed.data.description,
      theme: parsed.data.theme ?? "default",
      layoutType: parsed.data.layoutType ?? "radial",
      noteId: parsed.data.noteId,
      nodes: {
        create: {
          type: "rootNode",
          positionX: 0,
          positionY: 0,
          label: "中心テーマ",
          level: 0,
          fontSize: 18,
        },
      },
    },
    include: {
      nodes: true,
      edges: true,
      note: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ success: true, mindMap });
}
