export type DashboardSummary = {
  gameProfile: {
    level: number;
    currentXp: number;
    requiredXp: number;
    coins: number;
    gems: number;
    streak: number;
    rank: string;
    name?: string;
  };
  currentCurriculum?: {
    lineId: string;
    lineTitle: string;
    slug: string;
    lessonTitle: string;
    progressPercent: number;
  };
  todayQuests: {
    total: number;
    completed: number;
    quests: Array<{
      id: string;
      title: string;
      category: string;
      status: "pending" | "accepted" | "in_progress" | "completed" | "skipped";
      xpReward: number;
      progressPercent?: number;
    }>;
  };
  todayTasks: {
    total: number;
    completed: number;
    tasks: Array<{
      id: string;
      title: string;
      status: string;
      dueDate?: string | null;
      progressPercent?: number;
    }>;
  };
  credoProgress: {
    total: number;
    practiced: number;
    items: Array<{
      id: string;
      title: string;
      done: boolean;
    }>;
  };
  recentAchievements: {
    unlocked: Array<{
      id: string;
      name: string;
      icon: string;
      rarity: string;
      completedAt?: string | null;
    }>;
    claimable: number;
    nearCompletion: Array<{
      id: string;
      name: string;
      progressPercent: number;
    }>;
  };
  dailyCondition?: {
    physicalCondition: number;
    mentalCondition: number;
    motivationLevel: number;
  };
  timeStats?: {
    todaySeconds: number;
    weekSeconds: number;
    monthSeconds: number;
    totalSeconds: number;
  };
};
