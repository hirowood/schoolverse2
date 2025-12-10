import { prisma } from "@/lib/prisma";
import type { MonsterQuestion, MonsterQuestionOption } from "@/features/virtual-classroom/types";

export async function getQuestionForMonster(monsterId: string): Promise<MonsterQuestion | null> {
  const questions = await prisma.monsterQuestion.findMany({
    where: { monsterId, isActive: true },
  });
  if (questions.length === 0) return null;
  const idx = Math.floor(Math.random() * questions.length);
  const q = questions[idx];
  const parsedOptions = Array.isArray(q.options) ? (q.options as MonsterQuestionOption[]) : null;
  return {
    ...q,
    options: parsedOptions,
  };
}

export function redactAnswer(question: MonsterQuestion | null) {
  if (!question) return null;
  const { correctAnswer, ...rest } = question;
  return rest;
}
