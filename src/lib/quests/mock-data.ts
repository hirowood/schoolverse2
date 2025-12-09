import type {
  TodayQuest,
  QuestProgressSummary,
  TodayQuestsResponse,
  QuestActionResponse,
  QuestStatus,
} from "@/types/quest";

const now = Date.now();

const mockQuests: TodayQuest[] = [
  {
    id: "quest_001",
    title: "25分集中学習",
    description: "主要科目でポモドーロ1セット（25分）",
    category: "learning_attitude",
    categoryLabel: "学習姿勢",
    categoryIcon: "🎯",
    difficulty: "medium",
    difficultyLabel: "ふつう",
    estimatedMinutes: 30,
    xpReward: 50,
    reason: "短時間の集中で勢いをつける",
    tips: "通知を切って取り組もう",
    relatedGoal: "週間目標「数学を毎日30分」",
    priority: 8,
    order: 0,
    status: "in_progress",
    startedAt: new Date(now - 12 * 60 * 1000).toISOString(),
    elapsedMinutes: 12,
    progressPercent: 48,
  },
  {
    id: "quest_002",
    title: "朝のリセット",
    description: "起床後にストレッチ5分と水200mlを飲む",
    category: "health",
    categoryLabel: "健康管理",
    categoryIcon: "💪",
    difficulty: "easy",
    difficultyLabel: "かんたん",
    estimatedMinutes: 10,
    xpReward: 30,
    reason: "体調を整える基礎アクション",
    tips: "無理せずゆっくり",
    priority: 7,
    order: 1,
    status: "completed",
    completedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    actualMinutes: 8,
    completionRating: 5,
  },
  {
    id: "quest_003",
    title: "ノートを整える",
    description: "今日のノートに見出しを3つ以上追加し整理する",
    category: "note_quality",
    categoryLabel: "ノート品質",
    categoryIcon: "📝",
    difficulty: "easy",
    difficultyLabel: "かんたん",
    estimatedMinutes: 10,
    xpReward: 40,
    reason: "復習しやすい形にする",
    tips: "5W2Hを意識する",
    priority: 6,
    order: 2,
    status: "pending",
  },
];

const mockSummary: QuestProgressSummary = {
  total: mockQuests.length,
  completed: 1,
  inProgress: 1,
  pending: 1,
  skipped: 0,
  totalXpEarned: 30,
  totalXpPossible: mockQuests.reduce((sum, q) => sum + (q.xpReward ?? 0), 0),
  completionRate: Math.round((1 / mockQuests.length) * 100),
  streak: 3,
  remainingHours: 8,
};

export const mockTodayQuestsResponse: TodayQuestsResponse = {
  quests: mockQuests,
  summary: mockSummary,
  generatedAt: new Date().toISOString(),
  canRegenerate: true,
  regenerateRemaining: 2,
};

export const mockActionResponse = (id: string, status: QuestStatus): QuestActionResponse => {
  const quest = mockQuests.find((q) => q.id === id);
  if (!quest) {
    return {
      success: false,
      quest: {
        id,
        title: "unknown",
        description: "",
        category: "learning",
        categoryLabel: "学習",
        categoryIcon: "📚",
        difficulty: "easy",
        difficultyLabel: "かんたん",
        estimatedMinutes: 0,
        xpReward: 0,
        reason: "",
        priority: 0,
        order: 0,
        status,
      },
    };
  }
  const updated: TodayQuest = { ...quest, status };
  const completed = status === "completed";
  return {
    success: true,
    quest: updated,
    xpEarned: completed ? quest.xpReward : 0,
    levelUp: false,
    newAchievements: [],
  };
};
