import type { MonsterRarity } from "./types";

export const MONSTER_RARITY_CONFIG: Record<MonsterRarity, { spawnRate: number; xpMultiplier: number; coinMultiplier: number }> = {
  common: { spawnRate: 0.6, xpMultiplier: 1.0, coinMultiplier: 1.0 },
  uncommon: { spawnRate: 0.25, xpMultiplier: 1.5, coinMultiplier: 1.5 },
  rare: { spawnRate: 0.1, xpMultiplier: 2.0, coinMultiplier: 2.0 },
  epic: { spawnRate: 0.04, xpMultiplier: 3.0, coinMultiplier: 3.0 },
  legendary: { spawnRate: 0.01, xpMultiplier: 5.0, coinMultiplier: 5.0 },
};

export const MONSTER_CATEGORIES = [
  { slug: "math", name: "数学" },
  { slug: "japanese", name: "国語" },
  { slug: "english", name: "英語" },
  { slug: "science", name: "理科" },
  { slug: "social", name: "社会" },
];
