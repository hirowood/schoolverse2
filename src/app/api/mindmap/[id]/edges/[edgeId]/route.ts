import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string; edgeId: string };
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

  await prisma.mindMapEdge.delete({ where: { id: params.edgeId } });
  return NextResponse.json({ success: true });
}
