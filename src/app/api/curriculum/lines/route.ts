import { NextResponse } from "next/server";
import { CURRICULUM_LINES } from "@/lib/curriculum/lines-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lineId = searchParams.get("lineId");
  const qRaw = searchParams.get("q") ?? "";
  const terms = qRaw
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  let lines = CURRICULUM_LINES;

  if (lineId) {
    lines = lines.filter((l) => l.id === lineId);
  }

  if (terms.length > 0) {
    const match = (text?: string) => {
      if (!text) return false;
      const hay = text.toLowerCase();
      return terms.every((t) => hay.includes(t));
    };
    lines = lines.filter(
      (l) =>
        match(l.title) ||
        match(l.summary) ||
        l.units.some((u) => match(u.title) || match(u.description)) ||
        l.missions?.some((m) => match(m)) ||
        l.missionDetails?.some(
          (m) => match(m.title) || match(m.description) || m.tags?.some((tag) => match(tag)) || match(String(m.effortMinutes)),
        ),
    );
  }

  return NextResponse.json({
    success: true,
    data: lineId ? lines[0] ?? null : lines,
  });
}
