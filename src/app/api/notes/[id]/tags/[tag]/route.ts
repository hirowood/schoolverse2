import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string; tag: string };
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = await prisma.note.findUnique({
    where: { id: params.id, userId: session.user.id },
    select: { autoTags: true },
  });

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const filtered = (note.autoTags ?? []).filter((t) => t !== params.tag);

  const updated = await prisma.note.update({
    where: { id: params.id },
    data: { autoTags: filtered },
    select: { autoTags: true },
  });

  return NextResponse.json({ success: true, tags: updated.autoTags });
}
