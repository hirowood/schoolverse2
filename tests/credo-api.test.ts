import { describe, expect, it, beforeEach, vi } from "vitest";

type LogRow = {
  userId: string;
  credoId: string;
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
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(prisma)),
    user: {
      upsert: vi.fn(async () => null),
    },
    credoItem: {
      upsert: vi.fn(async () => null),
    },
    credoPracticeLog: {
      findMany: vi.fn(async ({ where }: { where: { userId: string; date: Date } }) =>
        logs.filter(
          (row) => row.userId === where.userId && row.date.getTime() === where.date.getTime(),
        ),
      ),
      deleteMany: vi.fn(async ({ where }: { where: { userId: string; date: Date } }) => {
        for (let i = logs.length - 1; i >= 0; i -= 1) {
          if (logs[i].userId === where.userId && logs[i].date.getTime() === where.date.getTime()) {
            logs.splice(i, 1);
          }
        }
        return null;
      }),
      createMany: vi.fn(async ({ data }: { data: LogRow[] }) => {
        logs.push(...data);
        return null;
      }),
    },
  };
  return { prisma };
});

import { getServerSession } from "next-auth";
import { GET, POST } from "@/app/api/credo/practices/route";

const mockedGetServerSession = getServerSession as unknown as ReturnType<typeof vi.fn>;

describe("/api/credo/practices handlers", () => {
  beforeEach(() => {
    logs.splice(0, logs.length);
    vi.resetAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/credo/practices?date=2024-01-01");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("saves and reads back logs for a date", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: "user-1", email: "u1@example.com" },
    });

    const date = "2024-01-02";
    const payload = {
      date,
      values: {
        "credo-1": { credoId: "credo-1", date, done: true, note: "did it" },
        "credo-2": { credoId: "credo-2", date, done: false, note: "pending" },
      },
    };

    const postReq = new Request("http://localhost/api/credo/practices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const postRes = await POST(postReq);
    expect(postRes.status).toBe(200);
    expect(logs.length).toBe(2);

    const getReq = new Request(`http://localhost/api/credo/practices?date=${date}`);
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);
    const json = (await getRes.json()) as {
      date: string;
      values: Record<string, { done: boolean; note: string }>;
    };
    expect(json.date).toBe(date);
    expect(json.values["credo-1"].done).toBe(true);
    expect(json.values["credo-2"].note).toBe("pending");
  });
});
