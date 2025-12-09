export type Rank =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | "master"
  | "legend";

export type RankLabel =
  | "初心者"
  | "中級者"
  | "上級者"
  | "エキスパート"
  | "マスター"
  | "レジェンド";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export type AchievementCategory =
  | "all"
  | "learning"
  | "streak"
  | "social"
  | "exploration"
  | "special";

export type AchievementStatusFilter = "all" | "in_progress" | "completed" | "unclaimed";

export type XpSource =
  | "task_complete"
  | "credo_practice"
  | "achievement"
  | "note"
  | "quest"
  | "streak"
  | "system"
  | string;

export type GameProfile = {
  level: number;
  currentXp: number;
  totalXp: number;
  xpToNextLevel: number;
  rank: Rank;
  rankLabel: RankLabel;
  coins: number;
  gems: number;
  title: string | null;
  avatarFrame: string | null;
};

export type GamificationStats = {
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalNotesCreated: number;
  totalChatMessages: number;
  totalLearningMinutes: number;
};

export type XpTransaction = {
  id: string;
  amount: number;
  source: XpSource;
  sourceLabel: string;
  description?: string | null;
  createdAt: string;
};

export type AchievementDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  rarityLabel: string;
  category: AchievementCategory | string;
  categoryLabel: string;
  conditionType: string;
  conditionValue: number;
  xpReward: number;
  coinReward: number;
  titleReward?: string | null;
  isHidden: boolean;
};

export type AchievementWithProgress = AchievementDefinition & {
  currentProgress: number;
  progressPercent: number;
  isCompleted: boolean;
  completedAt?: string | null;
  isRewardClaimed: boolean;
  hint?: string | null;
};

export type AchievementSummary = {
  total: number;
  completed: number;
  inProgress: number;
  unclaimed: number;
  completionRate: number;
};

export type ProfileResponse = {
  profile: GameProfile;
  stats: GamificationStats;
  recentXp: XpTransaction[];
};

export type AchievementsResponse = {
  summary: AchievementSummary;
  achievements: AchievementWithProgress[];
};

export type ClaimRewardResponse = {
  success: boolean;
  rewards: {
    xp: number;
    coins: number;
    title?: string | null;
  };
  updatedProfile: GameProfile;
  levelUp: boolean;
};

export type XpHistoryResponse = {
  transactions: XpTransaction[];
  todayTotal: number;
};

export type GamificationFilters = {
  category: AchievementCategory;
  status: AchievementStatusFilter;
};
