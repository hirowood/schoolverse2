import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string; edgeId: string }>;
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, edgeId } = await context.params;
  const mindMap = await prisma.mindMap.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!mindMap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mindMapEdge.delete({ where: { id: edgeId } });
  return NextResponse.json({ success: true });
}
