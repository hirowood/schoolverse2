// src/lib/schemas/coachPlan.ts
import { z } from "zod";

// リクエストスキーマ
export const PlanRequestSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で入力してください")
    .optional(),
});

export type PlanRequest = z.infer<typeof PlanRequestSchema>;

// タスクスキーマ
export const PlanTaskSchema = z.object({
  title: z.string().min(1).max(100),
  durationMinutes: z.number().int().positive().max(120),
  timeSlot: z.string(),
  taskId: z.string().optional(),
  note: z.string().optional(),
});

export type PlanTask = z.infer<typeof PlanTaskSchema>;

// プランスキーマ
export const StudyPlanSchema = z.object({
  date: z.string(),
  focus: z.string().max(50),
  tasks: z.array(PlanTaskSchema).min(1).max(10),
  coachMessage: z.string().max(300),
});

export type StudyPlan = z.infer<typeof StudyPlanSchema>;

// レスポンススキーマ
export const PlanResponseSchema = z.object({
  plan: StudyPlanSchema,
});

export type PlanResponse = z.infer<typeof PlanResponseSchema>;
