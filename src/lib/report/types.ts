import type { CredoSummary } from "@/lib/credoSummary";

export type WeeklyReportPayload = {
  conditionSummary: string;
  activitySummary: string;
  aiAnalysis: string;
  nextWeekFocus: string[];
  supporterExport: string;
};

export type WeeklyReportRecord = WeeklyReportPayload & {
  id: string;
  weekStart: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyTimeRow = {
  date: string;
  label: string;
  seconds: number;
};

export type WeeklyTaskStatusCounts = {
  total: number;
  todo: number;
  inProgress: number;
  paused: number;
  done: number;
};

export type WeeklyReportContext = {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  profile: {
    name: string | null;
    weeklyGoal: string | null;
    coachTone: string | null;
    activeHours: string | null;
  };
  summary: {
    totalSeconds: number;
    daily: DailyTimeRow[];
    statusCounts: WeeklyTaskStatusCounts;
    topTasks: Array<{
      title: string;
      status: string;
      seconds: number;
      dueDate: string | null;
    }>;
  };
  credoSummary: CredoSummary;
  conditionHighlights: string[];
};
