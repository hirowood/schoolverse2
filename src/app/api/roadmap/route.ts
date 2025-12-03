import { NextResponse } from "next/server";
import { z } from "zod";
import { generateRoadmap } from "@/lib/roadmap/engine";

const BodySchema = z.object({
  free_text: z.string().min(3),
  time_horizon: z.number().optional(),
  weekly_study_time: z.number().optional(),
  constraints: z.array(z.string()).optional(),
  preferences: z.array(z.string()).optional(),
  current_skill_snapshot: z.string().optional(),
  preferred_career_type: z.array(z.string()).optional(),
  mental_safety_level: z.number().min(1).max(5).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: { code: "INVALID_JSON" } }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_BODY", message: parsed.error.message } },
      { status: 400 },
    );
  }

  const roadmap = generateRoadmap(parsed.data);
  return NextResponse.json({ success: true, data: roadmap });
}
