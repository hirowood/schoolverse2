import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api/session";
import { ensureUser, getXpHistory } from "@/lib/gamification/xp-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    await ensureUser(prisma, user.id, user.email, user.name);
    const transactions = await getXpHistory(user.id, 50);
    const today = new Date().toDateString();
    const todayTotal = transactions
      .filter((tx) => new Date(tx.createdAt).toDateString() === today)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return NextResponse.json({ transactions, todayTotal });
  } catch (error) {
    console.error("GET /api/gamification/xp-history error", error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
