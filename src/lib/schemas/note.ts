import { z } from "zod";
import { NOTE_TEMPLATE_OPTIONS } from "@/lib/notes/templates";

const templateIds = NOTE_TEMPLATE_OPTIONS.map((template) => template.id) as string[];
const tagsSchema = z.array(z.string().min(1).max(30)).max(8);
const imageFileSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().min(1),
  name: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
const ocrTextSchema = z.object({
  imageId: z.string(),
  text: z.string().min(1),
  confidence: z.number().min(0).max(1),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});
const template5W2H = z.object({
  what: z.string().min(1),
  why: z.string().min(1),
  who: z.string().min(1),
  when: z.string().min(1),
  where: z.string().min(1),
  how: z.string().min(1),
  howMuch: z.string().min(1),
});
const template5Why = z.object({
  problem: z.string().min(1),
  why1: z.string().min(1),
  why2: z.string().min(1),
  why3: z.string().min(1),
  why4: z.string().min(1),
  why5: z.string().min(1),
  conclusion: z.string().min(1),
});
const templateDataSchema = z.union([template5W2H, template5Why]).optional();

const basePayload = z.object({
  title: z.string().trim().max(120).optional(),
  content: z.string().trim().max(3000).optional(),
  drawingData: z.record(z.unknown()).optional(),
  templateType: z.enum(templateIds).optional(),
  templateData: templateDataSchema,
  tags: tagsSchema.optional(),
  isShareable: z.boolean().optional(),
  imageFiles: z.array(imageFileSchema).optional(),
  ocrTexts: z.array(ocrTextSchema).optional(),
  relatedTaskId: z.string().cuid().optional(),
});

export const noteCreateSchema = basePayload.refine((value) => {
  return Boolean(value.content || value.drawingData || value.templateData);
}, { message: "content/drawing/templateDataのいずれかは必須です" });

const partialPayload = basePayload.partial();
export const notePatchSchema = partialPayload.refine((value) => Object.keys(value).length > 0, {
  message: "更新するフィールドを1つ以上指定してください",
});

export const noteDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const noteImageSchema = imageFileSchema;
export const noteOcrSchema = ocrTextSchema;
