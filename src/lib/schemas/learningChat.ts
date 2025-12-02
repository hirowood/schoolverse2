import { z } from "zod";
import { ChatMode, LearningCategory } from "@/features/learning-chat/types";

const chatModeEnum = z.nativeEnum(ChatMode);
const learningCategoryEnum = z.nativeEnum(LearningCategory);

export const CreateSessionSchema = z.object({
  mode: chatModeEnum.default(ChatMode.LEARNING),
  category: learningCategoryEnum.optional(),
  initialMessage: z.string().trim().optional(),
});

export const UpdateSessionSchema = z.object({
  title: z.string().trim().max(100).optional(),
  isPinned: z.boolean().optional(),
  isActive: z.boolean().optional(),
  category: learningCategoryEnum.optional(),
});

export const SendMessageSchema = z.object({
  content: z.string().trim().min(1, "content_required"),
  category: learningCategoryEnum.optional(),
});

export const ListSessionsQuerySchema = z.object({
  mode: chatModeEnum.optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const ListMessagesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(30),
  before: z.string().optional(),
});
