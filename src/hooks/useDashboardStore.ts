"use client";

import { create } from "zustand";
import type { DashboardSummary } from "@/lib/dashboard/types";

type DashboardState = {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchSummary: () => Promise<void>;
  refreshSection: (section: "quests" | "tasks" | "credo" | "achievements") => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  toggleSection: (section: string) => void;
  expandedSections: Set<string>;
};

const fetchJson = async <T>(url: string, init?: RequestInit) => {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return (await res.json()) as T;
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  summary: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  expandedSections: new Set(),

  fetchSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson<DashboardSummary>("/api/dashboard/summary");
      set({ summary: data, isLoading: false, lastUpdated: new Date() });
    } catch (error) {
      console.error("[Dashboard] fetchSummary failed", error);
      set({ isLoading: false, error: "ダッシュボードを取得できませんでした" });
    }
  },

  refreshSection: async (section) => {
    void section;
    // モック段階では全体再取得
    await get().fetchSummary();
  },

  completeQuest: async (questId) => {
    const prev = get().summary;
    if (!prev) return;
    // 楽観的更新
    const updatedQuests = prev.todayQuests.quests.map((q) =>
      q.id === questId ? { ...q, status: "completed" as const, progressPercent: 100 } : q
    );
    const updatedSummary: DashboardSummary = {
      ...prev,
      todayQuests: {
        ...prev.todayQuests,
        quests: updatedQuests,
        completed: Math.min(prev.todayQuests.completed + 1, prev.todayQuests.total),
      },
    };
    set({ summary: updatedSummary });
    try {
      await fetchJson(`/api/quests/${questId}/complete`, { method: "POST" });
      await get().refreshSection("quests");
    } catch (error) {
      console.error("[Dashboard] completeQuest failed, rollback", error);
      set({ summary: prev, error: "クエスト完了に失敗しました" });
    }
  },

  completeTask: async (taskId) => {
    const prev = get().summary;
    if (!prev) return;
    const updatedTasks = prev.todayTasks.tasks.map((t) =>
      t.id === taskId ? { ...t, status: "done" } : t
    );
    const updatedSummary: DashboardSummary = {
      ...prev,
      todayTasks: {
        ...prev.todayTasks,
        tasks: updatedTasks,
        completed: Math.min(prev.todayTasks.completed + 1, prev.todayTasks.total),
      },
    };
    set({ summary: updatedSummary });
    try {
      await fetchJson(`/api/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: "done" }),
      });
      await get().refreshSection("tasks");
    } catch (error) {
      console.error("[Dashboard] completeTask failed, rollback", error);
      set({ summary: prev, error: "タスク完了に失敗しました" });
    }
  },

  toggleSection: (section) => {
    set((state) => {
      const next = new Set(state.expandedSections);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return { expandedSections: next };
    });
  },
}));
