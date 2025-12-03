import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { assertRateLimit } from "@/lib/rateLimit";
import { generateQuestsForUser } from "@/lib/gamification/ai-quest-generator";
import { QuestCategory } from "@/lib/constants/quest-categories";

const BodySchema = z.object({
  forceRegenerate: z.boolean().optional(),
  preferredCategories: z.array(z.custom<QuestCategory>()).optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null } | undefined;

  if (!user?.id) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  try {
    assertRateLimit(user.id, "/api/quests/generate", 30, 60_000);
  } catch (e) {
    const err = e as { status?: number; retryAfter?: number };
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMIT", retryAfter: err.retryAfter } },
      { status: err.status ?? 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "invalid json" } }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 },
    );
  }

  try {
    const result = await generateQuestsForUser(user.id, parsed.data);
    return NextResponse.json({
      success: true,
      data: {
        quests: result.quests,
        reused: result.reused,
        promptUsed: result.prompt,
        rawResponse: result.rawResponse,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Quest generation failed", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "GENERATION_FAILED", message: (error as Error).message },
      },
      { status: 500 },
    );
  }
}
