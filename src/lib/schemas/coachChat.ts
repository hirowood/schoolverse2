// src/lib/schemas/coachChat.ts
import { z } from "zod";

// リクエストスキーマ
export const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "メッセージを入力してください")
    .max(2000, "メッセージは2000文字以内で入力してください"),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// メッセージスキーマ
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  message: z.string(),
  createdAt: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// レスポンススキーマ
export const ChatResponseSchema = z.object({
  userMessage: ChatMessageSchema,
  assistantMessage: ChatMessageSchema,
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// GET用レスポンス
export const ChatHistoryResponseSchema = z.object({
  messages: z.array(ChatMessageSchema),
});

export type ChatHistoryResponse = z.infer<typeof ChatHistoryResponseSchema>;
