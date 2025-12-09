import { DashboardSummary } from "@/lib/dashboard/types";

export const mockDashboardSummary: DashboardSummary = {
  gameProfile: {
    level: 12,
    currentXp: 2340,
    requiredXp: 3000,
    coins: 450,
    gems: 12,
    streak: 7,
    rank: "intermediate",
    name: "学習者A",
  },
  todayQuests: {
    total: 3,
    completed: 1,
    quests: [
      { id: "quest_001", title: "[Ruby] 基礎文法 30分", category: "learning", status: "in_progress", xpReward: 50, progressPercent: 60 },
      { id: "quest_002", title: "[Credo] 感謝を伝える", category: "credo", status: "pending", xpReward: 20 },
      { id: "quest_003", title: "[Note] 学習ノート作成", category: "note_quality", status: "accepted", xpReward: 40 },
    ],
  },
  todayTasks: {
    total: 5,
    completed: 2,
    tasks: [
      { id: "task_1", title: "React Hook学習", status: "in_progress", dueDate: new Date().toISOString() },
      { id: "task_2", title: "基本情報 過去問", status: "todo", dueDate: new Date().toISOString() },
    ],
  },
  credoProgress: {
    total: 11,
    practiced: 4,
    items: [
      { id: "credo_1", title: "早寝早起き", done: true },
      { id: "credo_2", title: "感謝を伝える", done: false },
    ],
  },
  recentAchievements: {
    unlocked: [
      { id: "achv_1", name: "コツコツ学習者", icon: "🥇", rarity: "rare", completedAt: new Date().toISOString() },
      { id: "achv_2", name: "ノートマスター", icon: "🥈", rarity: "common", completedAt: new Date().toISOString() },
    ],
    claimable: 3,
    nearCompletion: [{ id: "achv_near_1", name: "連続ログイン10日", progressPercent: 80 }],
  },
  dailyCondition: {
    physicalCondition: 7,
    mentalCondition: 6,
    motivationLevel: 8,
  },
};
