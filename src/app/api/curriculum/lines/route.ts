import { NextResponse } from "next/server";
import { CURRICULUM_LINES } from "@/lib/curriculum/lines-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lineId = searchParams.get("lineId");
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  let lines = CURRICULUM_LINES;

  if (lineId) {
    lines = lines.filter((l) => l.id === lineId);
  }

  if (q) {
    const match = (text?: string) => (text ?? "").toLowerCase().includes(q);
    lines = lines.filter(
      (l) =>
        match(l.title) ||
        match(l.summary) ||
        l.units.some((u) => match(u.title) || match(u.description)) ||
        l.missions?.some((m) => match(m)) ||
        l.missionDetails?.some((m) => match(m.title) || match(m.description) || m.tags?.some(match)),
    );
  }

  return NextResponse.json({
    success: true,
    data: lineId ? lines[0] ?? null : lines,
  });
}
