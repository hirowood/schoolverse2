import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mindMapEdgeInputSchema } from "@/lib/schemas/mindmap";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const mindMap = await prisma.mindMap.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!mindMap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mindMapEdgeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.mindMapEdge.create({
    data: {
      mindMapId: id,
      sourceId: parsed.data.sourceId,
      targetId: parsed.data.targetId,
      type: parsed.data.type ?? "smoothstep",
      strokeColor: parsed.data.strokeColor ?? "#94a3b8",
      strokeWidth: parsed.data.strokeWidth ?? 2,
      animated: parsed.data.animated ?? false,
      label: parsed.data.label,
    },
  });

  return NextResponse.json({ success: true, edge: created });
}
