import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const monsters = await prisma.monsterDefinition.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { difficulty: "asc" }],
  });
  return NextResponse.json({ monsters });
}
