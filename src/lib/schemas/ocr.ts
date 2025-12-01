import { z } from "zod";

export const ocrAnalyzeRequestSchema = z.object({
  imageData: z.string().min(1),
  noteId: z.string().optional(),
  options: z
    .object({
      enhanceImage: z.boolean().optional(),
      generateSummary: z.boolean().optional(),
      generateTags: z.boolean().optional(),
      language: z.enum(["jpn", "eng", "jpn+eng"]).optional(),
    })
    .optional(),
});

export const analyzeNoteRequestSchema = z.object({
  content: z.string().optional(),
  options: z
    .object({
      regenerateSummary: z.boolean().optional(),
      regenerateTags: z.boolean().optional(),
    })
    .optional(),
});
