import { beforeEach, describe, expect, it, vi } from "vitest";
import { CREDO_ITEMS } from "@/features/credo/config";
import type { CredoId } from "@/features/credo/types";

type LogRow = {
  credoId: CredoId;
  userId: string;
  date: Date;
  done: boolean;
  note: string;
};

const logs: LogRow[] = [];

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const prisma = {
    credoPracticeLog: {
      findMany: vi.fn(async ({ where }: { where: { userId: string; date: { gte: Date; lte: Date } } }) =>
        logs.filter(
          (row) =>
            row.userId === where.userId &&
            row.date.getTime() >= where.date.gte.getTime() &&
            row.date.getTime() <= where.date.lte.getTime(),
        ),
      ),
    },
  };
  return { prisma };
});

import { getServerSession } from "next-auth";
import { GET } from "@/app/api/credo/summary/route";

const mockedGetServerSession = getServerSession as unknown as ReturnType<typeof vi.fn>;

describe("/api/credo/summary", () => {
  beforeEach(() => {
    logs.splice(0, logs.length);
    vi.resetAllMocks();
  });

  it("returns 0 when no data", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "u1", email: "u1@example.com" } });
    const res = await GET(
      new Request("http://localhost/api/credo/summary?from=2024-01-01&to=2024-01-07"),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      practicedCount: number;
      practicedRate: number;
      ranking: unknown[];
      missing: unknown[];
    };
    expect(json.practicedCount).toBe(0);
    expect(json.practicedRate).toBe(0);
    expect(json.ranking).toHaveLength(0);
    expect(json.missing).toHaveLength(11);
  });

  it("aggregates counts and highlights", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "u1", email: "u1@example.com" } });
    const baseDate = new Date("2024-01-03");
    logs.push(
      { userId: "u1", credoId: "credo-1", date: baseDate, done: true, note: "note1" },
      { userId: "u1", credoId: "credo-1", date: new Date("2024-01-04"), done: true, note: "" },
      { userId: "u1", credoId: "credo-2", date: baseDate, done: false, note: "note2" },
      { userId: "u1", credoId: "credo-3", date: baseDate, done: true, note: "note3" },
    );
    const res = await GET(
      new Request("http://localhost/api/credo/summary?from=2024-01-01&to=2024-01-07"),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      practicedCount: number;
      practicedRate: number;
      ranking: { id: CredoId; count: number }[];
      highlights: string[];
    };
    expect(json.practicedCount).toBe(3); // credo-1 twice done + credo-3 once
    expect(json.practicedRate).toBeCloseTo(Math.round((2 / 11) * 100));
    expect(json.ranking[0].id).toBe("credo-1");
    expect(json.ranking[0].count).toBe(2);
    expect(json.highlights).toContain("note1");
    expect(json.highlights).toContain("note2");
  });

  it("excludes data outside the window and keeps integrity across 11 items", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "u1", email: "u1@example.com" } });
    logs.push({
      userId: "u1",
      credoId: "credo-4",
      date: new Date("2023-12-31"),
      done: true,
      note: "old",
    });
    CREDO_ITEMS.slice(0, 11).forEach((item, idx) => {
      logs.push({
        userId: "u1",
        credoId: item.id as CredoId,
        date: new Date(`2024-01-${10 + idx}`),
        done: true,
        note: `n-${idx}`,
      });
    });
    const res = await GET(
      new Request("http://localhost/api/credo/summary?from=2024-01-10&to=2024-01-20"),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      practicedCount: number;
      practicedRate: number;
      ranking: { count: number }[];
      missing: unknown[];
      highlights: string[];
    };
    expect(json.practicedCount).toBe(11);
    expect(json.practicedRate).toBe(100);
    expect(json.ranking[0].count).toBe(1);
    expect(json.missing).toHaveLength(0);
    expect(json.highlights.length).toBeLessThanOrEqual(3);
  });
});
