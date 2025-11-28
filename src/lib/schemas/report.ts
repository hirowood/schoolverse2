import { z } from "zod";

export const WeeklyReportGenerateSchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "weekStart must be formatted as YYYY-MM-DD")
    .optional(),
});
