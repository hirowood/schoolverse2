import { prisma } from "@/lib/prisma";
import { Prisma, Note } from "@prisma/client";
import type { NoteRecord, NoteImageFile, NoteOcrText, Template5W2H, Template5Why } from "./types";

/**
 * タグを正規化（重複除去、空文字除去）
 */
export function normalizeTags(tags: string[] | null | undefined): string[] | null {
  if (!tags || tags.length === 0) return null;
  const unique = [...new Set(tags.filter((t) => t.trim().length > 0))];
  return unique.length > 0 ? unique : null;
}

/**
 * Prisma Note を NoteRecord に変換
 */
export function toNoteRecord(note: Note): NoteRecord {
  // JSON フィールドの安全な変換
  const imageFiles = Array.isArray(note.imageFiles) 
    ? (note.imageFiles as unknown as NoteImageFile[]) 
    : [];
  
  const ocrTexts = Array.isArray(note.ocrTexts) 
    ? (note.ocrTexts as unknown as NoteOcrText[]) 
    : [];
  
  const tags = Array.isArray(note.tags) 
    ? (note.tags as unknown as string[]) 
    : [];

  // templateData の型ガード
  let templateData: Template5W2H | Template5Why | null = null;
  if (note.templateData && typeof note.templateData === 'object' && !Array.isArray(note.templateData)) {
    const td = note.templateData as Record<string, unknown>;
    // 5W2H check
    if ('what' in td && 'why' in td && 'who' in td) {
      templateData = td as unknown as Template5W2H;
    }
    // 5Why check
    else if ('problem' in td && 'why1' in td) {
      templateData = td as unknown as Template5Why;
    }
  }

  // drawingData の型
  const drawingData = note.drawingData && typeof note.drawingData === 'object' && !Array.isArray(note.drawingData)
    ? (note.drawingData as Record<string, unknown>)
    : null;

  return {
    id: note.id,
    userId: note.userId,
    title: note.title,
    content: note.content,
    drawingData,
    imageFiles,
    ocrTexts,
    templateType: note.templateType as NoteRecord["templateType"],
    templateData,
    tags,
    isShareable: note.isShareable,
    relatedTaskId: note.relatedTaskId,
    relatedTaskTitle: note.relatedTaskTitle,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

/**
 * ノートに画像を追加
 */
export async function addImageToNote(
  noteId: string,
  userId: string,
  imageFile: NoteImageFile
): Promise<NoteImageFile[]> {
  const note = await prisma.note.findUnique({
    where: { id: noteId, userId },
  });

  if (!note) {
    throw new Error("Note not found");
  }

  const existing: NoteImageFile[] = Array.isArray(note.imageFiles)
    ? (note.imageFiles as unknown as NoteImageFile[])
    : [];

  // IDがなければ生成
  const newImage: NoteImageFile = {
    ...imageFile,
    id: imageFile.id || crypto.randomUUID(),
  };

  const next = [...existing, newImage];

  await prisma.note.update({
    where: { id: noteId },
    data: { imageFiles: next as unknown as Prisma.InputJsonValue },
  });

  return next;
}

/**
 * ノートにOCRテキストを追加
 */
export async function addOcrTextToNote(
  noteId: string,
  userId: string,
  ocrText: NoteOcrText
): Promise<NoteOcrText[]> {
  const note = await prisma.note.findUnique({
    where: { id: noteId, userId },
  });

  if (!note) {
    throw new Error("Note not found");
  }

  const existing: NoteOcrText[] = Array.isArray(note.ocrTexts)
    ? (note.ocrTexts as unknown as NoteOcrText[])
    : [];

  const next = [...existing, ocrText];

  await prisma.note.update({
    where: { id: noteId },
    data: { ocrTexts: next as unknown as Prisma.InputJsonValue },
  });

  return next;
}
