import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  name: z.string().min(1).max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = schema.safeParse(json);
    if (!body.success) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const { email, password, name } = body.data;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "already_exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? email,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/auth/register error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
