export const XP_REWARDS = {
  base: {
    easy: { min: 20, max: 40 },
    medium: { min: 40, max: 70 },
    hard: { min: 70, max: 100 },
  },
  bonus: {
    earlyCompletion: 10,
    perfectDay: 50,
    weekStreak: 100,
    categoryMaster: 30,
    comebackBonus: 20,
  },
} as const;

export type Difficulty = "easy" | "medium" | "hard";
