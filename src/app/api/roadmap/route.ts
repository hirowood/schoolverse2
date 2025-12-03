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
  diagnostic_result: z
    .object({
      strengths: z.array(z.string()).optional(),
      weaknesses: z.array(z.string()).optional(),
      skill_tags: z.record(z.number()).optional(), // number keyed? will normalize below
    })
    .optional(),
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

  const normalized = {
    ...parsed.data,
    diagnostic_result: parsed.data.diagnostic_result
      ? {
          ...parsed.data.diagnostic_result,
          skill_tags: parsed.data.diagnostic_result.skill_tags
            ? Object.fromEntries(
                Object.entries(parsed.data.diagnostic_result.skill_tags).map(([k, v]) => [String(k), Number(v)]),
              )
            : undefined,
        }
      : undefined,
  };

  const roadmap = generateRoadmap(normalized);
  return NextResponse.json({ success: true, data: roadmap });
}
