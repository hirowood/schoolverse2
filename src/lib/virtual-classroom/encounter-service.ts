import { prisma } from "@/lib/prisma";
import { getRarityMultiplier, pickMonster } from "./monster-service";
import { getQuestionForMonster } from "./question-generator";
import type { MonsterDefinition, MonsterQuestion, Vector3 } from "@/features/virtual-classroom/types";

type StartEncounterParams = {
  userId: string;
  roomId?: string | null;
  position?: Vector3 | null;
  category?: string | null;
  playerLevel?: number | null;
};

type StartEncounterResult = {
  encounterId: string;
  monster: MonsterDefinition;
  question: Omit<MonsterQuestion, "correctAnswer">;
};

type AnswerEncounterParams = {
  userId: string;
  encounterId: string;
  answer: string;
};

type AnswerEncounterResult = {
  isCorrect: boolean;
  xpEarned: number;
  bonusXpEarned: number;
  coinsEarned: number;
};

export async function startEncounter(params: StartEncounterParams): Promise<StartEncounterResult | null> {
  const { userId, roomId, position, category, playerLevel } = params;
  const monster = await pickMonster({ category: category ?? undefined, playerLevel: playerLevel ?? undefined });
  if (!monster) return null;

  const question = await getQuestionForMonster(monster.id);
  if (!question) return null;

  const encounter = await prisma.monsterEncounter.create({
    data: {
      userId,
      monsterId: monster.id,
      roomId: roomId ?? null,
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options ?? undefined,
      correctAnswer: question.correctAnswer,
      status: "active",
      positionX: position?.x ?? null,
      positionY: position?.y ?? null,
      positionZ: position?.z ?? null,
    },
    select: { id: true },
  });

  const { correctAnswer: _omit, ...questionForClient } = question;
  void _omit;

  return {
    encounterId: encounter.id,
    monster,
    question: questionForClient,
  };
}

export async function answerEncounter(params: AnswerEncounterParams): Promise<AnswerEncounterResult | null> {
  const { userId, encounterId, answer } = params;
  const encounter = await prisma.monsterEncounter.findFirst({
    where: { id: encounterId, userId, status: "active" },
    include: { monster: true },
  });
  if (!encounter) return null;

  const normalizedUser = answer.trim().toLowerCase();
  const normalizedCorrect = (encounter.correctAnswer ?? "").trim().toLowerCase();
  const isCorrect = normalizedUser === normalizedCorrect;

  const rarityMult = getRarityMultiplier(encounter.monster?.rarity ?? null);
  const xpEarned = isCorrect ? Math.round(encounter.monster.baseXp * rarityMult.xp) : 0;
  const bonusXpEarned = isCorrect && encounter.questionType === "multiple_choice" ? 0 : 0;
  const coinsEarned = isCorrect ? Math.round(encounter.monster.baseCoin * rarityMult.coin) : 0;

  await prisma.monsterEncounter.update({
    where: { id: encounterId },
    data: {
      userAnswer: answer,
      isCorrect,
      answeredAt: new Date(),
      xpEarned,
      bonusXpEarned,
      coinsEarned,
      status: "completed",
    },
  });

  await updateUserMonsterStats({
    userId,
    monster: encounter.monster,
    isCorrect,
    xpEarned,
    coinsEarned,
  });

  return { isCorrect, xpEarned, bonusXpEarned, coinsEarned };
}

type StatsUpdate = {
  userId: string;
  monster: MonsterDefinition;
  isCorrect: boolean;
  xpEarned: number;
  coinsEarned: number;
};

async function updateUserMonsterStats(update: StatsUpdate) {
  const { userId, monster, isCorrect, xpEarned, coinsEarned } = update;

  const existing = await prisma.userMonsterStats.findUnique({ where: { userId } });
  const categoryStats = (existing?.categoryStats as Record<string, { encounters: number; correct: number }> | null) ?? {};
  const rarityStats = (existing?.rarityStats as Record<string, number> | null) ?? {};

  const cat = monster.category ?? "unknown";
  const currentCat = categoryStats[cat] ?? { encounters: 0, correct: 0 };
  categoryStats[cat] = {
    encounters: currentCat.encounters + 1,
    correct: currentCat.correct + (isCorrect ? 1 : 0),
  };

  const rarity = monster.rarity ?? "common";
  rarityStats[rarity] = (rarityStats[rarity] ?? 0) + (isCorrect ? 1 : 0);

  await prisma.userMonsterStats.upsert({
    where: { userId },
    create: {
      userId,
      totalEncounters: 1,
      totalDefeated: isCorrect ? 1 : 0,
      totalFled: 0,
      totalTimeout: 0,
      correctAnswers: isCorrect ? 1 : 0,
      wrongAnswers: isCorrect ? 0 : 1,
      totalXpFromMonsters: xpEarned,
      totalCoinsFromMonsters: coinsEarned,
      categoryStats,
      rarityStats,
      currentStreak: isCorrect ? 1 : 0,
      longestStreak: isCorrect ? 1 : 0,
    },
    update: {
      totalEncounters: { increment: 1 },
      totalDefeated: { increment: isCorrect ? 1 : 0 },
      correctAnswers: { increment: isCorrect ? 1 : 0 },
      wrongAnswers: { increment: isCorrect ? 0 : 1 },
      totalXpFromMonsters: { increment: xpEarned },
      totalCoinsFromMonsters: { increment: coinsEarned },
      categoryStats,
      rarityStats,
      currentStreak: isCorrect ? (existing?.currentStreak ?? 0) + 1 : 0,
      longestStreak: isCorrect
        ? Math.max((existing?.currentStreak ?? 0) + 1, existing?.longestStreak ?? 0)
        : existing?.longestStreak ?? 0,
    },
  });
}
