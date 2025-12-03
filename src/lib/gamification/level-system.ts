export type LevelState = {
  level: number;
  currentXp: number;
  nextLevelXp: number;
};

export type RankInfo = {
  rank: string;
  name: string;
  color: string;
};

// レベルごとの必要XP（指数関数的）
export function getRequiredXpForLevel(level: number): number {
  const baseXp = 100;
  const growthRate = 1.15;
  return Math.floor(baseXp * Math.pow(growthRate, Math.max(level - 1, 0)));
}

// 累計XPから現在レベルを計算
export function calculateLevel(totalXp: number): LevelState {
  let level = 1;
  let xpRemaining = Math.max(totalXp, 0);

  while (true) {
    const required = getRequiredXpForLevel(level);
    if (xpRemaining < required) {
      return {
        level,
        currentXp: xpRemaining,
        nextLevelXp: required,
      };
    }
    xpRemaining -= required;
    level++;
  }
}

// ランク決定
export function getRank(level: number): RankInfo {
  if (level >= 50) return { rank: "master", name: "マスター", color: "#FFD700" };
  if (level >= 30) return { rank: "expert", name: "エキスパート", color: "#9333EA" };
  if (level >= 15) return { rank: "journeyman", name: "熟練者", color: "#3B82F6" };
  if (level >= 5) return { rank: "apprentice", name: "見習い", color: "#10B981" };
  return { rank: "beginner", name: "初心者", color: "#6B7280" };
}

// XP獲得ルール
export const XP_RULES = {
  learning_minute: 2,
  learning_session_complete: 10,
  chat_message: 5,
  chat_session_10min: 20,
  skill_progress: 10,
  skill_complete: 100,
  skill_master: 250,
  daily_quest_complete: 30,
  weekly_quest_complete: 100,
  streak_7days: 50,
  streak_30days: 200,
  first_login_daily: 10,
  level_up_bonus: 50,
} as const;

export type XpRuleKey = keyof typeof XP_RULES;
