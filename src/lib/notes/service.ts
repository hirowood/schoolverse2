import { prisma } from "@/lib/prisma";
import type { Note, Prisma } from "@prisma/client";
import type { NoteImageFile, NoteOcrText, NoteRecord, NoteTemplateType } from "./types";

type UserSession = { id?: string; email?: string | null; name?: string | null };

export async function ensureUser(user: UserSession): Promise<string | null> {
  if (!user.email) return null;
  if (!user.id) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) return existing.id;
    const created = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name ?? user.email,
      },
    });
    return created.id;
  }
  const upserted = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name: user.name ?? user.email,
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.name ?? user.email,
    },
  });
  return upserted.id;
}

export function normalizeTags(tags?: string[] | null): string[] | null {
  if (!tags || tags.length === 0) return null;
  const cleaned = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .filter((tag, index, array) => array.indexOf(tag) === index)
    .slice(0, 8);
  return cleaned.length > 0 ? cleaned : null;
}

export function mapNoteRecord(note: Note & { relatedTask?: { title?: string } | null }): NoteRecord {
  const imageFiles = Array.isArray(note.imageFiles) ? note.imageFiles : [];
  const ocrTexts = Array.isArray(note.ocrTexts) ? note.ocrTexts : [];
  return {
    id: note.id,
    userId: note.userId,
    title: note.title,
    content: note.content,
    drawingData: (note.drawingData as Prisma.JsonObject) ?? null,
    imageFiles: imageFiles as NoteImageFile[],
    ocrTexts: ocrTexts as NoteOcrText[],
    templateType: note.templateType as NoteTemplateType | null,
    templateData: (note.templateData as Prisma.JsonObject) ?? null,
    tags: Array.isArray(note.tags) ? (note.tags as string[]) : [],
    isShareable: note.isShareable,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    relatedTaskId: note.relatedTaskId ?? null,
    relatedTaskTitle: note.relatedTask?.title ?? null,
  };
}

export async function appendImageToNote(
  noteId: string,
  file: Omit<NoteImageFile, "id"> & { id?: string },
  userId: string
): Promise<NoteImageFile[]> {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw new Error("note_not_found");
  const existing = Array.isArray(note.imageFiles) ? (note.imageFiles as NoteImageFile[]) : [];
  const entry: NoteImageFile = {
    id: file.id ?? crypto.randomUUID(),
    url: file.url,
    name: file.name,
    width: file.width,
    height: file.height,
  };
  const next = [...existing, entry];
  await prisma.note.update({
    where: { id: noteId },
    data: { imageFiles: next },
  });
  return next;
}

export async function appendOcrToNote(
  noteId: string,
  ocr: NoteOcrText,
  userId: string
): Promise<NoteOcrText[]> {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw new Error("note_not_found");
  const existing = Array.isArray(note.ocrTexts) ? (note.ocrTexts as NoteOcrText[]) : [];
  const next = [...existing, ocr];
  await prisma.note.update({
    where: { id: noteId },
    data: { ocrTexts: next },
  });
  return next;
}
