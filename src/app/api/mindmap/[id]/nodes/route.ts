import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mindMapNodeInputSchema } from "@/lib/schemas/mindmap";

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mindMap = await prisma.mindMap.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { nodes: true },
  });
  if (!mindMap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mindMapNodeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const parent = parsed.data.parentId
    ? mindMap.nodes.find((n) => n.id === parsed.data.parentId)
    : null;
  if (parsed.data.parentId && !parent) {
    return NextResponse.json({ error: "Parent node not found" }, { status: 404 });
  }

  const created = await prisma.mindMapNode.create({
    data: {
      mindMapId: mindMap.id,
      type: parent ? "mindMapNode" : "rootNode",
      label: parsed.data.label,
      description: parsed.data.description,
      positionX: parsed.data.positionX ?? (parent ? parent.positionX + 200 : 0),
      positionY: parsed.data.positionY ?? (parent ? parent.positionY + 80 : 0),
      backgroundColor: parsed.data.backgroundColor ?? "#ffffff",
      borderColor: parsed.data.borderColor ?? "#e2e8f0",
      textColor: parsed.data.textColor ?? "#1e293b",
      fontSize: parsed.data.fontSize ?? (parent ? 14 : 18),
      shape: parsed.data.shape ?? "rounded",
      level: parent ? parent.level + 1 : 0,
      parentId: parsed.data.parentId ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  return NextResponse.json({ success: true, node: created });
}
