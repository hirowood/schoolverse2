import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildCredoSummary } from "@/lib/credoSummary";
import { assertRateLimit } from "@/lib/rateLimit";

const parseDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;
  if (!user?.id || !user.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/credo/summary", 30, 60_000);
  } catch (e) {
    const err = e as { status?: number };
    return NextResponse.json({ error: "rate_limited" }, { status: err.status ?? 429 });
  }

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  if (!fromParam || !toParam) {
    return NextResponse.json({ error: "from/to are required (YYYY-MM-DD)" }, { status: 400 });
  }

  const from = parseDate(fromParam);
  const to = parseDate(toParam);
  if (!from || !to) {
    return NextResponse.json({ error: "invalid date format" }, { status: 400 });
  }

  const summary = await buildCredoSummary(user.id, from, to);

  return NextResponse.json(summary);
}
