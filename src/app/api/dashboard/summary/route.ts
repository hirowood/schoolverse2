import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/dashboard/service";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getDashboardSummary(userId);
    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[dashboard/summary] error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
