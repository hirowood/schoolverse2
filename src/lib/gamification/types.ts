import { QuestCategory } from "@/lib/constants/quest-categories";

export type QuestDifficulty = "easy" | "medium" | "hard";

export type ParsedQuest = {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xpReward: number;
  estimatedMinutes: number;
  reason: string;
  tips?: string;
  relatedGoal?: string;
  relatedCredo?: string;
  relatedData?: string;
  priority: number;
};

export type QuestGenerationOptions = {
  forceRegenerate?: boolean;
  preferredCategories?: QuestCategory[];
  lineIds?: string[];
  careerIds?: string[];
};

export type QuestGenerationContext = {
  user: {
    id: string;
    name: string;
    grade?: string | null;
    strongSubjects: string[];
    weakSubjects: string[];
  };
  goals: {
    dreamJob?: string | null;
    targetSchool?: string | null;
    yearlyGoal?: string | null;
    monthlyGoal?: string | null;
    weeklyGoal?: string | null;
  };
  todayCondition: {
    physical: number;
    mental: number;
    motivation: number;
    energy: number;
    sleepHours?: number | null;
    hasImportantEvent: boolean;
    eventDescription?: string | null;
  } | null;
  lifeHabitsAnalysis: {
    avgSleepHours: number;
    sleepQualityTrend: "improving" | "stable" | "declining";
    breakfastRate: number;
    lunchRate: number;
    dinnerRate: number;
    avgWaterIntake: number;
    avgExerciseMinutes: number;
    exerciseFrequency: number;
    avgScreenTime: number;
    roomCleanRate: number;
    wentOutsideRate: number;
    issues: string[];
    improvements: string[];
  };
  learningAttitudeAnalysis: {
    avgFocusMinutes: number;
    avgPomodoroCount: number;
    longestFocus: number;
    avgDistractions: number;
    previewRate: number;
    reviewRate: number;
    reflectionRate: number;
    selfTestRate: number;
    goalSettingRate: number;
    goalAchievementRate: number;
    avgQuestionsAsked: number;
    strengths: string[];
    weaknesses: string[];
    focusTrend: "improving" | "stable" | "declining";
  };
  noteQualityAnalysis: {
    notesCreated: number;
    avgWordCount: number;
    avgStructureScore: number;
    templateUsageRate: number;
    avgTagCount: number;
    reviewRate: number;
    avgAiQualityScore: number | null;
    strengths: string[];
    weaknesses: string[];
  };
  credoAnalysis: {
    strongCredos: string[];
    weakCredos: string[];
    streakDays: number;
    todayProgress: number;
    weeklyAverage: number;
  };
  habitsAnalysis: {
    activeHabits: Array<{
      name: string;
      category: string;
      completionRate: number;
      currentStreak: number;
    }>;
    strugglingHabits: string[];
    overallCompletionRate: number;
  };
  gameProgress: {
    level: number;
    totalXp: number;
    xpToNextLevel: number;
    rank: string;
    questCompletionRate: number;
    recentCompletedQuests: string[];
    favoriteCategories: string[];
    avoidedCategories: string[];
  };
  temporal: {
    dayOfWeek: string;
    isWeekend: boolean;
    isHoliday: boolean;
    currentHour: number;
  };
};
