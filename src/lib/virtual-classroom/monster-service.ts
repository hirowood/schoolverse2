import { prisma } from "@/lib/prisma";
import { MONSTER_RARITY_CONFIG } from "@/features/virtual-classroom/constants";
import type { MonsterDefinition } from "@/features/virtual-classroom/types";

type PickMonsterParams = {
  category?: string | null;
  playerLevel?: number | null;
};

function weightedChoice<T extends { spawnWeight: number }>(items: T[]): T | null {
  const total = items.reduce((sum, item) => sum + (item.spawnWeight || 0), 0);
  if (total <= 0) return null;
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.spawnWeight || 0;
    if (r <= 0) return item;
  }
  return items[items.length - 1] ?? null;
}

export async function pickMonster(params: PickMonsterParams): Promise<MonsterDefinition | null> {
  const { category, playerLevel } = params;
  const monsters = await prisma.monsterDefinition.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
      minPlayerLevel: { lte: playerLevel ?? 99 },
      OR: [
        { maxPlayerLevel: null },
        { maxPlayerLevel: { gte: playerLevel ?? 1 } },
      ],
    },
  });

  if (monsters.length === 0) return null;
  const chosen = weightedChoice(monsters);
  return chosen ?? monsters[0] ?? null;
}

export function getRarityMultiplier(rarity: string | null | undefined): { xp: number; coin: number } {
  const config = MONSTER_RARITY_CONFIG[rarity as keyof typeof MONSTER_RARITY_CONFIG];
  if (!config) return { xp: 1, coin: 1 };
  return { xp: config.xpMultiplier, coin: config.coinMultiplier };
}
