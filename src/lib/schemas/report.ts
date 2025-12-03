import { z } from "zod";

export const WeeklyReportGenerateSchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "weekStart must be formatted as YYYY-MM-DD")
    .optional(),
  kpt: z
    .object({
      keep: z.array(z.string()).optional(),
      problem: z.array(z.string()).optional(),
      try: z.array(z.string()).optional(),
    })
    .optional(),
});
