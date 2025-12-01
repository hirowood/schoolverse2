import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mindMapNodeUpdateSchema } from "@/lib/schemas/mindmap";

interface RouteParams {
  params: Promise<{ id: string; nodeId: string }>;
}

async function ensureOwnership(mindMapId: string, userId: string) {
  const mindMap = await prisma.mindMap.findFirst({
    where: { id: mindMapId, userId },
  });
  return mindMap;
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, nodeId } = await context.params;
  const mindMap = await ensureOwnership(id, session.user.id);
  if (!mindMap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = mindMapNodeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.mindMapNode.update({
    where: { id: nodeId },
    data: parsed.data,
  });
  return NextResponse.json({ success: true, node: updated });
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, nodeId } = await context.params;
  const mindMap = await ensureOwnership(id, session.user.id);
  if (!mindMap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mindMapNode.delete({ where: { id: nodeId } });
  return NextResponse.json({ success: true });
}
