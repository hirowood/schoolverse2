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

export interface GameProfile {
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
}

export interface GamificationStats {
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalNotesCreated: number;
  totalChatMessages: number;
  totalLearningMinutes: number;
}

export interface XpTransaction {
  id: string;
  amount: number;
  source: XpSource;
  sourceLabel: string;
  description?: string | null;
  createdAt: string;
}

export interface AchievementDefinition {
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
}

export interface AchievementWithProgress extends AchievementDefinition {
  currentProgress: number;
  progressPercent: number;
  isCompleted: boolean;
  completedAt?: string | null;
  isRewardClaimed: boolean;
  hint?: string | null;
}

export interface AchievementSummary {
  total: number;
  completed: number;
  inProgress: number;
  unclaimed: number;
  completionRate: number;
}

export interface ProfileResponse {
  profile: GameProfile;
  stats: GamificationStats;
  recentXp: XpTransaction[];
}

export interface AchievementsResponse {
  summary: AchievementSummary;
  achievements: AchievementWithProgress[];
}

export interface ClaimRewardResponse {
  success: boolean;
  rewards: {
    xp: number;
    coins: number;
    title?: string | null;
  };
  updatedProfile: GameProfile;
  levelUp: boolean;
}

export interface XpHistoryResponse {
  transactions: XpTransaction[];
  todayTotal: number;
}

export interface GamificationFilters {
  category: AchievementCategory;
  status: AchievementStatusFilter;
}
