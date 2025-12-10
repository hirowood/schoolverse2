import type { Prisma, PrismaClient } from "@prisma/client";
import type { GameProfile, XpTransaction as XpTransactionView } from "@/types/gamification";
import { prisma } from "@/lib/prisma";
import { calculateLevel, getRank, XP_RULES } from "./level-system";

type TxClient = PrismaClient | Prisma.TransactionClient;

export type AddXpOptions = {
  source: string;
  sourceId?: string | null;
  category?: string | null;
  description?: string | null;
};

export type XpGainResult = {
  totalXpGained: number;
  levelUp: {
    occurred: boolean;
    previousLevel: number;
    newLevel: number;
    bonusXp: number;
  };
  profile: GameProfile;
  transactions: XpTransactionView[];
};

const toProfileView = (profile: {
  level: number;
  currentXp: number;
  totalXp: number;
  rank: string;
  coins: number;
  gems: number;
  title: string | null;
  avatarFrame: string | null;
}) => {
  const levelState = calculateLevel(profile.totalXp);
  const xpToNextLevel = Math.max(levelState.nextLevelXp - levelState.currentXp, 0);
  return {
    level: levelState.level,
    currentXp: levelState.currentXp,
    xpToNextLevel,
    totalXp: profile.totalXp,
    rank: profile.rank as GameProfile["rank"],
    rankLabel: getRank(levelState.level).name as GameProfile["rankLabel"],
    coins: profile.coins,
    gems: profile.gems,
    title: profile.title,
    avatarFrame: profile.avatarFrame,
  };
};

export const ensureUser = async (tx: TxClient, userId: string, email?: string | null, name?: string | null) => {
  const safeEmail = email ?? `${userId}@example.local`;
  const safeName = name ?? email ?? userId;
  await tx.user.upsert({
    where: { id: userId },
    update: { email: safeEmail, name: safeName },
    create: { id: userId, email: safeEmail, name: safeName },
  });
};

export const ensureGameProfile = async (tx: TxClient, userId: string) => {
  const existing = await tx.userGameProfile.findUnique({ where: { userId } });
  if (existing) return existing;
  return tx.userGameProfile.create({
    data: {
      userId,
      level: 1,
      currentXp: 0,
      totalXp: 0,
      rank: "beginner",
      coins: 0,
      gems: 0,
      title: null,
      avatarFrame: null,
    },
  });
};

export async function addXp(
  userId: string,
  amount: number,
  options: AddXpOptions,
  txClient: TxClient = prisma,
): Promise<XpGainResult> {
  const tx = txClient;
  const gained = Math.max(0, Math.floor(amount));
  if (gained === 0) {
    const profile = await ensureGameProfile(tx, userId);
    return {
      totalXpGained: 0,
      levelUp: { occurred: false, previousLevel: profile.level, newLevel: profile.level, bonusXp: 0 },
      profile: toProfileView(profile),
      transactions: [],
    };
  }

  const profile = await ensureGameProfile(tx, userId);
  const previousLevel = profile.level;

  let totalXp = profile.totalXp + gained;
  let levelState = calculateLevel(totalXp);

  let bonusXp = 0;
  if (levelState.level > previousLevel) {
    bonusXp = XP_RULES.level_up_bonus;
    totalXp += bonusXp;
    levelState = calculateLevel(totalXp);
  }

  const rankInfo = getRank(levelState.level);

  const updatedProfile = await tx.userGameProfile.update({
    where: { id: profile.id },
    data: {
      totalXp,
      currentXp: levelState.currentXp,
      level: levelState.level,
      rank: rankInfo.rank,
    },
  });

  const transactions: XpTransactionView[] = [];
  const baseTx = await tx.xpTransaction.create({
    data: {
      userId,
      amount: gained,
      source: options.source,
      sourceId: options.sourceId,
      category: options.category,
      description: options.description,
    },
  });
  transactions.push({
    id: baseTx.id,
    amount: baseTx.amount,
    source: baseTx.source,
    sourceLabel: baseTx.category ?? baseTx.source,
    description: baseTx.description ?? undefined,
    createdAt: baseTx.createdAt.toISOString(),
  });

  if (bonusXp > 0) {
    const bonusTx = await tx.xpTransaction.create({
      data: {
        userId,
        amount: bonusXp,
        source: "level_up_bonus",
        description: `レベルアップボーナス (Lv.${previousLevel}→Lv.${levelState.level})`,
      },
    });
    transactions.push({
      id: bonusTx.id,
      amount: bonusTx.amount,
      source: bonusTx.source,
      sourceLabel: "レベルアップ",
      description: bonusTx.description ?? undefined,
      createdAt: bonusTx.createdAt.toISOString(),
    });
  }

  return {
    totalXpGained: gained + bonusXp,
    levelUp: {
      occurred: levelState.level > previousLevel,
      previousLevel,
      newLevel: levelState.level,
      bonusXp,
    },
    profile: toProfileView(updatedProfile),
    transactions,
  };
}

export const getProfile = async (userId: string, txClient: TxClient = prisma): Promise<GameProfile> => {
  const profile = await ensureGameProfile(txClient, userId);
  return toProfileView(profile);
};

export const getXpHistory = async (userId: string, limit = 50, txClient: TxClient = prisma) => {
  const rows = await txClient.xpTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map<XpTransactionView>((row) => ({
    id: row.id,
    amount: row.amount,
    source: row.source,
    sourceLabel: row.category ?? row.source,
    description: row.description ?? undefined,
    createdAt: row.createdAt.toISOString(),
  }));
};
