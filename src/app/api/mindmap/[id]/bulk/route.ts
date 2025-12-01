import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mindMapBulkUpdateSchema } from "@/lib/schemas/mindmap";

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
  });
  if (!mindMap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mindMapBulkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // nodes
      if (parsed.data.nodes?.create) {
        for (const n of parsed.data.nodes.create) {
          await tx.mindMapNode.create({
            data: {
              mindMapId: params.id,
              type: "mindMapNode",
              label: n.label,
              description: n.description,
              positionX: n.positionX ?? 0,
              positionY: n.positionY ?? 0,
              backgroundColor: n.backgroundColor ?? "#ffffff",
              borderColor: n.borderColor ?? "#e2e8f0",
              textColor: n.textColor ?? "#1e293b",
              fontSize: n.fontSize ?? 14,
              shape: n.shape ?? "rounded",
              level: 0,
              parentId: n.parentId ?? null,
              sortOrder: n.sortOrder ?? 0,
            },
          });
        }
      }
      if (parsed.data.nodes?.update) {
        for (const n of parsed.data.nodes.update) {
          await tx.mindMapNode.update({
            where: { id: n.id },
            data: n.data,
          });
        }
      }
      if (parsed.data.nodes?.delete) {
        await tx.mindMapNode.deleteMany({
          where: { id: { in: parsed.data.nodes.delete } },
        });
      }

      // edges
      if (parsed.data.edges?.create) {
        for (const e of parsed.data.edges.create) {
          await tx.mindMapEdge.create({
            data: {
              mindMapId: params.id,
              sourceId: e.sourceId,
              targetId: e.targetId,
              type: e.type ?? "smoothstep",
              strokeColor: e.strokeColor ?? "#94a3b8",
              strokeWidth: e.strokeWidth ?? 2,
              animated: e.animated ?? false,
              label: e.label,
            },
          });
        }
      }
      if (parsed.data.edges?.delete) {
        await tx.mindMapEdge.deleteMany({
          where: { id: { in: parsed.data.edges.delete } },
        });
      }

      if (parsed.data.viewport) {
        await tx.mindMap.update({
          where: { id: params.id },
          data: {
            viewportX: parsed.data.viewport.x,
            viewportY: parsed.data.viewport.y,
            viewportZoom: parsed.data.viewport.zoom,
          },
        });
      }

      const latest = await tx.mindMap.findUnique({
        where: { id: params.id },
        include: { nodes: true, edges: true },
      });
      return latest;
    });

    return NextResponse.json({ success: true, mindMap: result });
  } catch (error) {
    console.error("mindmap bulk error", error);
    return NextResponse.json({ error: "Failed to apply bulk update" }, { status: 500 });
  }
}
