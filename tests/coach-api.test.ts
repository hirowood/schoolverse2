import { beforeEach, describe, expect, it, vi } from "vitest";

type ChatRow = {
  id: string;
  userId: string;
  role: string;
  message: string;
  createdAt: Date;
};

const chatRows: ChatRow[] = [];

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
      // unused in this suite
    },
    chatMessage: {
      findMany: vi.fn(
        async ({
          where,
          take,
        }: { where: { userId: string }; orderBy?: { createdAt: "asc" | "desc" }; take: number }) => {
          const filtered = chatRows.filter((r) => r.userId === where.userId);
        const sorted = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const limited = sorted.slice(0, take);
        return limited;
        },
      ),
      count: vi.fn(async ({ where }: { where: { userId: string } }) =>
        chatRows.filter((r) => r.userId === where.userId).length,
      ),
      create: vi.fn(async ({ data }: { data: Omit<ChatRow, "id" | "createdAt"> }) => {
        const row: ChatRow = {
          id: `id-${chatRows.length + 1}`,
          createdAt: new Date(),
          ...data,
        };
        chatRows.push(row);
        return row;
      }),
      deleteMany: vi.fn(async ({ where }: { where: { id: { in: string[] } } }) => {
        where.id.in.forEach((id) => {
          const idx = chatRows.findIndex((r) => r.id === id);
          if (idx !== -1) chatRows.splice(idx, 1);
        });
        return null;
      }),
    },
  };
  return { prisma };
});

import { getServerSession } from "next-auth";
import { GET, POST } from "@/app/api/coach/chat/route";

const mockedGetServerSession = getServerSession as unknown as ReturnType<typeof vi.fn>;

describe("/api/coach/chat", () => {
  beforeEach(() => {
    chatRows.splice(0, chatRows.length);
    vi.resetAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("saves user + assistant message", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "u1", email: "u1@example.com" } });
    const postRes = await POST(
      new Request("http://localhost/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "こんにちは" }),
      }),
    );
    expect(postRes.status).toBe(200);
    expect(chatRows.filter((r) => r.userId === "u1")).toHaveLength(2);
    const payload = (await postRes.json()) as { assistantMessage: { message: string; role: string } };
    expect(payload.assistantMessage.role).toBe("assistant");
    expect(payload.assistantMessage.message).toContain("了解です");
  });

  it("returns latest 20 messages sorted asc", async () => {
    mockedGetServerSession.mockResolvedValue({ user: { id: "u1", email: "u1@example.com" } });
    // insert 25 messages alternating roles
    for (let i = 0; i < 25; i += 1) {
      chatRows.push({
        id: `msg-${i}`,
        userId: "u1",
        role: i % 2 === 0 ? "user" : "assistant",
        message: `m${i}`,
        createdAt: new Date(Date.now() - i * 1000),
      });
    }
    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { messages: { message: string }[] };
    expect(body.messages).toHaveLength(20);
    expect(body.messages[0].message).toBe("m19");
    expect(body.messages[body.messages.length - 1].message).toBe("m0");
  });
});
