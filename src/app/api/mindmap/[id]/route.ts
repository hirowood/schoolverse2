import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mindMapUpdateSchema } from "@/lib/schemas/mindmap";

interface RouteParams {
  params: { id: string };
}

async function getOwnedMindMap(id: string, userId: string) {
  return prisma.mindMap.findFirst({
    where: { id, userId },
    include: { nodes: true, edges: true, note: { select: { id: true, title: true } } },
  });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const mindMap = await getOwnedMindMap(params.id, session.user.id);
  if (!mindMap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ mindMap });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mindMap = await getOwnedMindMap(params.id, session.user.id);
  if (!mindMap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mindMapUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.theme !== undefined) data.theme = parsed.data.theme;
  if (parsed.data.layoutType !== undefined) data.layoutType = parsed.data.layoutType;
  if (parsed.data.isShareable !== undefined) data.isShareable = parsed.data.isShareable;
  if (parsed.data.viewport) {
    data.viewportX = parsed.data.viewport.x;
    data.viewportY = parsed.data.viewport.y;
    data.viewportZoom = parsed.data.viewport.zoom;
  }

  const updated = await prisma.mindMap.update({
    where: { id: params.id },
    data,
    include: { nodes: true, edges: true, note: { select: { id: true, title: true } } },
  });

  return NextResponse.json({ success: true, mindMap: updated });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mindMap = await prisma.mindMap.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!mindMap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mindMap.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
