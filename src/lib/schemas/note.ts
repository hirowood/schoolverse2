import { z } from "zod";

// 画像ファイル情報
export const imageFileSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  name: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
});

// OCRテキスト情報
export const ocrTextSchema = z.object({
  imageId: z.string(),
  text: z.string(),
  confidence: z.number().min(0).max(100),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

// 5W2Hテンプレート
export const template5W2HSchema = z.object({
  what: z.string(),
  why: z.string(),
  who: z.string(),
  when: z.string(),
  where: z.string(),
  how: z.string(),
  howMuch: z.string(),
});

// 5Whyテンプレート
export const template5WhySchema = z.object({
  problem: z.string(),
  why1: z.string(),
  why2: z.string(),
  why3: z.string(),
  why4: z.string(),
  why5: z.string(),
  conclusion: z.string(),
});

// ノート作成スキーマ
export const noteCreateSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().max(50000).optional(),
  templateType: z.enum(["free", "5w2h", "5why", "canvas"]).optional(),
  drawingData: z.record(z.string(), z.unknown()).optional(),
  templateData: z.union([template5W2HSchema, template5WhySchema]).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isShareable: z.boolean().optional(),
  imageFiles: z.array(imageFileSchema).optional(),
  ocrTexts: z.array(ocrTextSchema).optional(),
  relatedTaskId: z.string().optional(),
  relatedTaskTitle: z.string().optional(),
});

// ノート更新スキーマ
export const noteUpdateSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().max(50000).optional(),
  templateType: z.enum(["free", "5w2h", "5why", "canvas"]).optional(),
  drawingData: z.record(z.string(), z.unknown()).optional().nullable(),
  templateData: z.union([template5W2HSchema, template5WhySchema]).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional().nullable(),
  isShareable: z.boolean().optional(),
  imageFiles: z.array(imageFileSchema).optional().nullable(),
  ocrTexts: z.array(ocrTextSchema).optional().nullable(),
  relatedTaskId: z.string().optional().nullable(),
  relatedTaskTitle: z.string().optional().nullable(),
});

// クエリパラメータスキーマ
export const noteQuerySchema = z.object({
  templateType: z.enum(["free", "5w2h", "5why", "canvas"]).optional(),
  tag: z.string().optional(),
  search: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
export type NoteQueryInput = z.infer<typeof noteQuerySchema>;
