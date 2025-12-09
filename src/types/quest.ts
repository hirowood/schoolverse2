export type QuestStatus = "pending" | "accepted" | "in_progress" | "completed" | "skipped";

export type QuestDifficulty = "easy" | "medium" | "hard";

export type QuestDifficultyPreference = "easy" | "balanced" | "challenge";

export type QuestCategory =
  | "learning"
  | "life_habit"
  | "health"
  | "learning_attitude"
  | "note_quality"
  | "credo"
  | "social";

export type TodayQuest = {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  categoryLabel: string;
  categoryIcon: string;
  difficulty: QuestDifficulty;
  difficultyLabel: string;
  estimatedMinutes: number;
  xpReward: number;
  bonusXp?: number;
  reason?: string;
  tips?: string;
  relatedGoal?: string;
  relatedCredo?: string;
  priority: number;
  order: number;
  status: QuestStatus;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  completionNote?: string;
  completionRating?: number;
  actualMinutes?: number;
  skippedReason?: string;
  elapsedMinutes?: number;
  progressPercent?: number;
};

export type QuestProgressSummary = {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  skipped: number;
  totalXpEarned: number;
  totalXpPossible: number;
  completionRate: number;
  streak: number;
  remainingHours: number;
};

export type QuestRegenerateOptions = {
  preferredCategories?: QuestCategory[];
  difficultyPreference?: QuestDifficultyPreference;
};

export type TodayQuestsResponse = {
  quests: TodayQuest[];
  summary: QuestProgressSummary;
  generatedAt: string;
  canRegenerate: boolean;
  regenerateRemaining: number;
};

export type QuestActionResponse = {
  success: boolean;
  quest: TodayQuest;
  xpEarned?: number;
  levelUp?: boolean;
  newAchievements?: string[];
};

export type CompleteQuestPayload = {
  note?: string;
  rating?: number;
  actualMinutes?: number;
};

export type QuestFilter = "all" | "in_progress" | "completed" | "skipped";
