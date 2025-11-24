import { NextResponse } from "next/server";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CREDO_ITEMS } from "@/features/credo/config";
import type {
  CredoDailyPractice,
  CredoId,
  CredoPracticeFormValue,
} from "@/features/credo/types";

const DEFAULT_USER_ID = "demo-user";
const DEFAULT_USER_EMAIL = "demo@example.com";

// 日付文字列を Date に変換
const parseDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

async function ensureDefaults(tx: PrismaClient | Prisma.TransactionClient) {
  await tx.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      email: DEFAULT_USER_EMAIL,
      name: "Demo User",
    },
  });

  // クレドマスタを同期
  for (const item of CREDO_ITEMS) {
    // eslint-disable-next-line no-await-in-loop
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
}

let ensureDefaultsPromise: Promise<void> | null = null;
const ensureDefaultsOnce = async () => {
  if (!ensureDefaultsPromise) {
    ensureDefaultsPromise = prisma.$transaction(async (tx) => {
      await ensureDefaults(tx);
    });
  }
  return ensureDefaultsPromise;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    if (!dateParam) {
      return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    const date = parseDate(dateParam);
    if (!date) {
      return NextResponse.json({ error: "invalid date format" }, { status: 400 });
    }

    await ensureDefaultsOnce();

    const rows = await prisma.credoPracticeLog.findMany({
      where: {
        userId: DEFAULT_USER_ID,
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
      return NextResponse.json({ error: "values must contain at least one entry" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await ensureDefaultsOnce();

      await tx.credoPracticeLog.deleteMany({
        where: { userId: DEFAULT_USER_ID, date },
      });

      await tx.credoPracticeLog.createMany({
        data: entries.map(([, v]) => ({
          userId: DEFAULT_USER_ID,
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
