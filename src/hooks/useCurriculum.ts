"use client";

import { create } from "zustand";

export type LessonStatus = "locked" | "available" | "in_progress" | "completed";

export type CurriculumLineProgress = {
  completed: number;
  total: number;
  percentage: number;
};

export type CurriculumLineSummary = {
  id: string;
  title: string;
  summary: string;
  units: Array<{ id: string; title: string; description?: string }>;
  missions?: string[];
  missionDetails?: unknown;
  progress?: CurriculumLineProgress;
};

export type LessonProgress = {
  id: string;
  userId: string;
  lessonId: string;
  status: LessonStatus;
  startedAt: string | null;
  completedAt: string | null;
  totalTimeSpent: number;
  attempts: number;
  score?: number | null;
  notes?: string | null;
  rating?: number | null;
  xpEarned: number;
  bonusXpEarned: number;
  createdAt: string;
  updatedAt: string;
};

export type LessonSummary = {
  id: string;
  lineId: string;
  unitId?: string | null;
  slug: string;
  title: string;
  description?: string | null;
  estimatedMinutes: number;
  xpReward: number;
  bonusXp: number;
  prerequisites: string[];
  tags: string[];
  order: number;
};

export type LessonState = {
  lesson: LessonSummary;
  progress: LessonProgress | null;
  isUnlocked: boolean;
};

export type AchievementUnlock = {
  slug: string;
  name: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  titleReward?: string | null;
};

export type GamificationResult = {
  totalXpGained: number;
  levelUp: {
    occurred: boolean;
    previousLevel: number;
    newLevel: number;
    bonusXp: number;
  };
  achievementsUnlocked: AchievementUnlock[];
};

export type ProgressOverview = {
  stats: {
    totalLessonsCompleted: number;
    totalTimeSpentSec: number;
    totalXpFromCurriculum: number;
    currentStreak: number;
    longestStreak: number;
    lastStudiedAt: string | null;
    lineProgress: Record<string, { completed: number; total: number }>;
  };
  progressByLine: Record<string, CurriculumLineProgress>;
  lessons: LessonState[];
};

type CompletePayload = {
  timeSpentSec: number;
  score?: number;
  notes?: string;
  rating?: number;
};

type CurriculumState = {
  lines: CurriculumLineSummary[];
  linesLoading: boolean;
  linesError: string | null;

  progressOverview: ProgressOverview | null;
  progressLoading: boolean;
  progressError: string | null;

  currentLesson: LessonState | null;
  lessonLoading: boolean;
  lessonError: string | null;
  lessonActionLoading: boolean;

  fetchLines: (query?: { lineId?: string; q?: string }) => Promise<void>;
  fetchProgress: () => Promise<void>;
  loadLesson: (slug: string) => Promise<void>;
  startLesson: (slug: string) => Promise<void>;
  completeLesson: (slug: string, payload: CompletePayload) => Promise<GamificationResult | undefined>;
};

const fetchJson = async <T>(url: string, init?: RequestInit) => {
  const res = await fetch(url, { cache: "no-store", ...init });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message = typeof json === "object" && json && "error" in (json as Record<string, unknown>) ? (json as Record<string, unknown>).error : `Request failed: ${res.status}`;
    throw new Error(String(message));
  }
  return json as T;
};

export const useCurriculum = create<CurriculumState>((set, get) => ({
  lines: [],
  linesLoading: false,
  linesError: null,

  progressOverview: null,
  progressLoading: false,
  progressError: null,

  currentLesson: null,
  lessonLoading: false,
  lessonError: null,
  lessonActionLoading: false,

  fetchLines: async (query) => {
    const search = new URLSearchParams();
    if (query?.lineId) search.set("lineId", query.lineId);
    if (query?.q) search.set("q", query.q);
    set({ linesLoading: true, linesError: null });
    try {
      const data = await fetchJson<{ success: boolean; data: CurriculumLineSummary | CurriculumLineSummary[] }>(
        `/api/curriculum/lines${search.toString() ? `?${search.toString()}` : ""}`,
      );
      const lines = Array.isArray(data.data) ? data.data : data.data ? [data.data] : [];
      set({ lines, linesLoading: false });
    } catch (error) {
      console.error("[Curriculum] fetchLines failed", error);
      set({ linesLoading: false, linesError: "カリキュラムを取得できませんでした" });
    }
  },

  fetchProgress: async () => {
    set({ progressLoading: true, progressError: null });
    try {
      const data = await fetchJson<{ success: boolean; data: ProgressOverview }>("/api/curriculum/progress");
      set({ progressOverview: data.data, progressLoading: false });
    } catch (error) {
      console.error("[Curriculum] fetchProgress failed", error);
      set({ progressLoading: false, progressError: "進捗を取得できませんでした" });
    }
  },

  loadLesson: async (slug) => {
    set({ lessonLoading: true, lessonError: null });
    try {
      const data = await fetchJson<{ success: boolean; data: LessonState }>("/api/curriculum/lessons/" + slug);
      set({ currentLesson: data.data, lessonLoading: false });
    } catch (error) {
      console.error("[Curriculum] loadLesson failed", error);
      set({ lessonLoading: false, lessonError: "レッスンを取得できませんでした" });
    }
  },

  startLesson: async (slug) => {
    set({ lessonActionLoading: true, lessonError: null });
    try {
      const data = await fetchJson<{ success: boolean; data: { lesson: LessonSummary; progress: LessonProgress } }>(
        `/api/curriculum/lessons/${slug}/start`,
        { method: "POST" },
      );
      const current = get().currentLesson;
      const merged: LessonState = {
        lesson: data.data.lesson,
        progress: data.data.progress,
        isUnlocked: true,
      };
      set({ currentLesson: merged, lessonActionLoading: false });
      if (current?.lesson.slug === slug) {
        set({ currentLesson: { ...merged, lesson: { ...current.lesson, ...merged.lesson } } });
      }
      // Refresh progress in background
      void get().fetchProgress();
    } catch (error) {
      console.error("[Curriculum] startLesson failed", error);
      set({ lessonActionLoading: false, lessonError: "レッスン開始に失敗しました" });
    }
  },

  completeLesson: async (slug, payload) => {
    set({ lessonActionLoading: true, lessonError: null });
    try {
      const data = await fetchJson<{
        success: boolean;
        data: {
          lessonId: string;
          lessonSlug: string;
          status: LessonStatus;
          xpEarned: number;
          bonusXpEarned: number;
          unlockedLessons: string[];
          progress: LessonProgress;
          stats: ProgressOverview["stats"];
          gamification?: GamificationResult;
        };
      }>(`/api/curriculum/lessons/${slug}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const currentLesson = get().currentLesson;
      if (currentLesson && currentLesson.lesson.slug === slug) {
        set({
          currentLesson: {
            ...currentLesson,
            progress: data.data.progress,
          },
        });
      }

      // Refresh full progress to sync stats and unlocks
      await get().fetchProgress();
      set({ lessonActionLoading: false });
      return data.data.gamification;
    } catch (error) {
      console.error("[Curriculum] completeLesson failed", error);
      set({ lessonActionLoading: false, lessonError: "レッスン完了に失敗しました" });
      return undefined;
    }
  },
}));
