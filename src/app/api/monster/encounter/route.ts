import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startEncounter } from "@/lib/virtual-classroom/encounter-service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { roomId, position, category, playerLevel } = (body as Record<string, unknown>) ?? {};
  const encounter = await startEncounter({
    userId: user.id,
    roomId: typeof roomId === "string" ? roomId : null,
    position:
      position && typeof position === "object"
        ? parsePosition(position as Record<string, unknown>)
        : null,
    category: typeof category === "string" ? category : null,
    playerLevel: typeof playerLevel === "number" ? playerLevel : null,
  });

  if (!encounter) {
    return NextResponse.json({ success: false, error: "no_monster_available" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: encounter,
  });
}

function parsePosition(pos: Record<string, unknown>) {
  return {
    x: typeof pos.x === "number" ? pos.x : Number(pos.x ?? 0),
    y: typeof pos.y === "number" ? pos.y : Number(pos.y ?? 0),
    z: typeof pos.z === "number" ? pos.z : Number(pos.z ?? 0),
  };
}
