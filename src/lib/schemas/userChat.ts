import { z } from "zod";

export const CreateRoomSchema = z.object({
  type: z.enum(["dm", "group"]),
  participantIds: z.array(z.string().min(1)).min(1),
  title: z.string().trim().max(120).optional(),
});

export const SendRoomMessageSchema = z.object({
  content: z.string().trim().min(1, "content_required"),
});

export const ListRoomsQuerySchema = z.object({
  type: z.enum(["dm", "group"]).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const ListRoomMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
});

export const MarkReadSchema = z.object({
  messageId: z.string().min(1),
});

export const SearchUsersQuerySchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().min(1).max(20).default(10),
});
