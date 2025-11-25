import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Prisma, PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CREDO_ITEMS } from "@/features/credo/config";
import type {
  CredoDailyPractice,
  CredoId,
  CredoPracticeFormValue,
} from "@/features/credo/types";

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
};

// 日付文字列を Date に変換
const parseDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const ensureCredoItems = async (tx: PrismaClient | Prisma.TransactionClient) => {
  for (const item of CREDO_ITEMS) {
    await tx.credoItem.upsert({
      where: { id: item.id },
      update: {
        order: item.order,
        category: item.category,
        title: item.title,
        description: item.description,
      },
      create: {
        id: item.id,
        order: item.order,
        category: item.category,
        title: item.title,
        description: item.description,
      },
    });
  }
};

const ensureUser = async (
  tx: PrismaClient | Prisma.TransactionClient,
  user: SessionUser,
) => {
  await tx.user.upsert({
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
};

const getSessionUser = async (): Promise<SessionUser | null> => {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id || !user.email) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
};

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    if (!dateParam) {
      return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    const date = parseDate(dateParam);
    if (!date) {
      return NextResponse.json({ error: "invalid date format" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await ensureCredoItems(tx);
      await ensureUser(tx, sessionUser);
    });

    const rows = await prisma.credoPracticeLog.findMany({
      where: {
        userId: sessionUser.id,
        date,
      },
    });

    const values: Record<CredoId, CredoPracticeFormValue> = {} as Record<
      CredoId,
      CredoPracticeFormValue
    >;
    rows.forEach((row) => {
      values[row.credoId as CredoId] = {
        credoId: row.credoId as CredoId,
        date: dateParam,
        done: row.done,
        note: row.note ?? "",
      };
    });

    const payload: CredoDailyPractice = {
      date: dateParam,
      values,
    };

    return NextResponse.json(payload);
  } catch (e) {
    console.error("GET /api/credo/practices error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<CredoDailyPractice>;
    if (!body?.date || !body?.values) {
      return NextResponse.json({ error: "date and values are required" }, { status: 400 });
    }

    const date = parseDate(body.date);
    if (!date) {
      return NextResponse.json({ error: "invalid date format" }, { status: 400 });
    }

    const entries = Object.entries(body.values) as [CredoId, CredoPracticeFormValue][];
    if (!entries.length) {
      return NextResponse.json(
        { error: "values must contain at least one entry" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await ensureCredoItems(tx);
      await ensureUser(tx, sessionUser);

      await tx.credoPracticeLog.deleteMany({
        where: { userId: sessionUser.id, date },
      });

      await tx.credoPracticeLog.createMany({
        data: entries.map(([, v]) => ({
          userId: sessionUser.id,
          credoId: v.credoId,
          date,
          done: !!v.done,
          note: v.note?.trim() ?? "",
        })),
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/credo/practices error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
