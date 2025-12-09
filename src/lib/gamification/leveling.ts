import type { Rank, RankLabel } from "@/types/gamification";

export const xpForLevel = (level: number) => 100 + Math.max(level - 1, 0) * 50;

export const totalXpForLevel = (level: number) => {
  let total = 0;
  for (let i = 1; i <= level; i += 1) {
    total += xpForLevel(i);
  }
  return total;
};

export const calculateLevelFromTotalXp = (totalXp: number) => {
  let level = 1;
  let remainingXp = Math.max(totalXp, 0);

  while (remainingXp >= xpForLevel(level)) {
    remainingXp -= xpForLevel(level);
    level += 1;
  }

  const xpToNextLevel = xpForLevel(level);
  const totalXpForCurrentLevel = totalXpForLevel(level - 1);

  return {
    level,
    currentXp: remainingXp,
    xpToNextLevel,
    totalXpForCurrentLevel,
    totalXpToNextLevel: totalXpForLevel(level),
  };
};

const RANK_STEPS: Array<{ min: number; rank: Rank; label: RankLabel }> = [
  { min: 76, rank: "legend", label: "レジェンド" },
  { min: 51, rank: "master", label: "マスター" },
  { min: 31, rank: "expert", label: "エキスパート" },
  { min: 16, rank: "advanced", label: "上級者" },
  { min: 6, rank: "intermediate", label: "中級者" },
  { min: 1, rank: "beginner", label: "初心者" },
];

export const calculateRank = (level: number) => {
  const entry = RANK_STEPS.find((rank) => level >= rank.min) ?? RANK_STEPS[RANK_STEPS.length - 1];
  return entry;
};

export const calculateProgressPercent = (current: number, target: number) => {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
};
