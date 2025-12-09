import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/dashboard/service";

export async function GET() {
  try {
    // 本来は認証セッションから userId を取得し、service に渡す想定
    const summary = await getDashboardSummary();
    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    });
  } catch (error) {
    console.error("[dashboard/summary] error", error);
    return NextResponse.json({ message: "Failed to load dashboard summary" }, { status: 500 });
  }
}
