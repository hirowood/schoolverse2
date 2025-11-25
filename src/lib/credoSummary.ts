import { prisma } from "@/lib/prisma";
import { CREDO_ITEMS } from "@/features/credo/config";
import type { CredoId } from "@/features/credo/types";

export type CredoSummary = {
  practicedCount: number;
  practicedRate: number;
  highlights: string[];
  ranking: { id: CredoId; title: string; count: number }[];
  missing: { id: CredoId; title: string }[];
};

export async function buildCredoSummary(userId: string, from: Date, to: Date): Promise<CredoSummary> {
  const logs = await prisma.credoPracticeLog.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    orderBy: { date: "desc" },
  });

  const counts: Record<CredoId, number> = {} as Record<CredoId, number>;
  const notes: Array<{ credoId: CredoId; note: string }> = [];

  logs.forEach((log) => {
    const id = log.credoId as CredoId;
    if (log.done) {
      counts[id] = (counts[id] ?? 0) + 1;
    }
    if (log.note?.trim()) {
      notes.push({ credoId: id, note: log.note.trim() });
    }
  });

  const practicedCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const practicedIds = Object.entries(counts)
    .filter(([, c]) => c > 0)
    .map(([id]) => id as CredoId);
  const practicedRate = Math.round((practicedIds.length / CREDO_ITEMS.length) * 100);

  const ranking = [...CREDO_ITEMS]
    .map((item) => ({
      id: item.id as CredoId,
      title: item.title,
      count: counts[item.id as CredoId] ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .filter((item) => item.count > 0)
    .slice(0, 11);

  const missing = CREDO_ITEMS.filter((item) => (counts[item.id as CredoId] ?? 0) === 0).map(
    (item) => ({
      id: item.id as CredoId,
      title: item.title,
    }),
  );

  const highlights = notes.slice(0, 3).map((n) => n.note);

  return {
    practicedCount,
    practicedRate,
    highlights,
    ranking,
    missing,
  };
}
