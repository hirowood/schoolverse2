import type {
  AchievementWithProgress,
  AchievementsResponse,
  GamificationStats,
  ProfileResponse,
  XpHistoryResponse,
} from "@/types/gamification";

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

const baseProfile: ProfileResponse["profile"] = {
  level: 12,
  currentXp: 2450,
  totalXp: 28450,
  xpToNextLevel: 3000,
  rank: "intermediate",
  rankLabel: "中級者",
  coins: 1250,
  gems: 45,
  title: "継続の達人",
  avatarFrame: "gold_frame",
};

export const mockStats: GamificationStats = {
  currentStreak: 14,
  longestStreak: 21,
  totalTasksCompleted: 156,
  totalNotesCreated: 34,
  totalChatMessages: 89,
  totalLearningMinutes: 2912,
};

const mockTransactions: ProfileResponse["recentXp"] = [
  {
    id: "xp_1",
    amount: 50,
    source: "task_complete",
    sourceLabel: "タスク完了",
    description: "数学の問題を解く",
    createdAt: hoursAgo(0.1),
  },
  {
    id: "xp_2",
    amount: 30,
    source: "credo_practice",
    sourceLabel: "クレド実践",
    description: "早起きを実行",
    createdAt: hoursAgo(1.2),
  },
  {
    id: "xp_3",
    amount: 100,
    source: "achievement",
    sourceLabel: "実績解除",
    description: "7日連続ログイン",
    createdAt: hoursAgo(3),
  },
  {
    id: "xp_4",
    amount: 20,
    source: "note",
    sourceLabel: "ノート作成",
    description: "英単語メモ",
    createdAt: hoursAgo(26),
  },
  {
    id: "xp_5",
    amount: 80,
    source: "quest",
    sourceLabel: "クエスト完了",
    description: "朝の学習30分",
    createdAt: hoursAgo(28),
  },
];

const mockAchievements: AchievementWithProgress[] = [
  {
    id: "streak_14_days",
    name: "継続の炎",
    description: "14日間連続でログインしよう！",
    icon: "🔥",
    rarity: "rare",
    rarityLabel: "レア",
    category: "streak",
    categoryLabel: "継続",
    conditionType: "login_streak",
    conditionValue: 14,
    xpReward: 100,
    coinReward: 50,
    titleReward: "継続の達人",
    isHidden: false,
    currentProgress: 10,
    progressPercent: 71,
    isCompleted: false,
    completedAt: null,
    isRewardClaimed: false,
    hint: "あと4日！毎日ダッシュボードを確認しよう。",
  },
  {
    id: "notes_10",
    name: "読書家",
    description: "ノートを10件作成する",
    icon: "📚",
    rarity: "rare",
    rarityLabel: "レア",
    category: "learning",
    categoryLabel: "学習",
    conditionType: "note_created",
    conditionValue: 10,
    xpReward: 80,
    coinReward: 40,
    titleReward: null,
    isHidden: false,
    currentProgress: 4,
    progressPercent: 40,
    isCompleted: false,
    completedAt: null,
    isRewardClaimed: false,
  },
  {
    id: "tasks_100",
    name: "努力家",
    description: "タスクを100件完了する",
    icon: "💪",
    rarity: "common",
    rarityLabel: "コモン",
    category: "learning",
    categoryLabel: "学習",
    conditionType: "task_completed",
    conditionValue: 100,
    xpReward: 150,
    coinReward: 75,
    titleReward: null,
    isHidden: false,
    currentProgress: 10,
    progressPercent: 10,
    isCompleted: false,
    completedAt: null,
    isRewardClaimed: false,
  },
  {
    id: "first_steps",
    name: "はじめの一歩",
    description: "初めてのログイン",
    icon: "✅",
    rarity: "common",
    rarityLabel: "コモン",
    category: "exploration",
    categoryLabel: "探索",
    conditionType: "login",
    conditionValue: 1,
    xpReward: 50,
    coinReward: 20,
    titleReward: null,
    isHidden: false,
    currentProgress: 1,
    progressPercent: 100,
    isCompleted: true,
    completedAt: hoursAgo(72),
    isRewardClaimed: true,
  },
  {
    id: "streak_7_days",
    name: "7日連続",
    description: "7日間連続でログイン",
    icon: "✅",
    rarity: "rare",
    rarityLabel: "レア",
    category: "streak",
    categoryLabel: "継続",
    conditionType: "login_streak",
    conditionValue: 7,
    xpReward: 60,
    coinReward: 30,
    titleReward: null,
    isHidden: false,
    currentProgress: 7,
    progressPercent: 100,
    isCompleted: true,
    completedAt: hoursAgo(36),
    isRewardClaimed: false,
  },
  {
    id: "hidden_master",
    name: "マスター学習者",
    description: "100時間学習する",
    icon: "🔒",
    rarity: "legendary",
    rarityLabel: "レジェンド",
    category: "special",
    categoryLabel: "特別",
    conditionType: "learning_minutes",
    conditionValue: 6000,
    xpReward: 500,
    coinReward: 200,
    titleReward: "マスター",
    isHidden: true,
    currentProgress: 2912,
    progressPercent: 49,
    isCompleted: false,
    completedAt: null,
    isRewardClaimed: false,
  },
];

export const getAchievementsSummary = (items: AchievementWithProgress[]) => {
  const total = items.length;
  const completed = items.filter((a) => a.isCompleted).length;
  const unclaimed = items.filter((a) => a.isCompleted && !a.isRewardClaimed).length;
  const inProgress = items.filter((a) => !a.isCompleted).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, inProgress, unclaimed, completionRate };
};

export const mockProfileResponse: ProfileResponse = {
  profile: baseProfile,
  stats: mockStats,
  recentXp: mockTransactions,
};

export const mockAchievementsResponse: AchievementsResponse = {
  summary: getAchievementsSummary(mockAchievements),
  achievements: mockAchievements,
};

export const mockXpHistoryResponse: XpHistoryResponse = {
  transactions: mockTransactions,
  todayTotal: mockTransactions
    .filter((tx) => new Date(tx.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, tx) => sum + tx.amount, 0),
};
