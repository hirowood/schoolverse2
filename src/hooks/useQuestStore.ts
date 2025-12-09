"use client";

import { create } from "zustand";
import type {
  CompleteQuestPayload,
  QuestActionResponse,
  QuestFilter,
  QuestRegenerateOptions,
  TodayQuest,
  TodayQuestsResponse,
} from "@/types/quest";

type QuestStoreState = {
  quests: TodayQuest[];
  summary: TodayQuestsResponse["summary"] | null;
  generatedAt: string | null;
  canRegenerate: boolean;
  regenerateRemaining: number;
  filter: QuestFilter;
  isLoading: boolean;
  error: string | null;
  selectedQuestId: string | null;
  showCompleteModal: boolean;
  showRegenerateModal: boolean;
  showDetailModal: boolean;
  lastXpGain: {
    xpEarned: number;
    questTitle: string;
    levelUp: boolean;
    newLevel?: number;
  } | null;
  fetchTodayQuests: () => Promise<void>;
  regenerateQuests: (options?: QuestRegenerateOptions) => Promise<void>;
  acceptQuest: (id: string) => Promise<void>;
  startQuest: (id: string) => Promise<void>;
  completeQuest: (id: string, data?: CompleteQuestPayload) => Promise<void>;
  skipQuest: (id: string, reason?: string) => Promise<void>;
  setFilter: (filter: QuestFilter) => void;
  selectQuest: (id: string | null) => void;
  openCompleteModal: (id: string) => void;
  closeCompleteModal: () => void;
  openRegenerateModal: () => void;
  closeRegenerateModal: () => void;
  openDetailModal: (id: string) => void;
  closeDetailModal: () => void;
  clearLastXpGain: () => void;
};

const fetchJson = async <T>(url: string, init?: RequestInit) => {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return (await res.json()) as T;
};

const replaceQuest = (quests: TodayQuest[], next: TodayQuest) =>
  quests.map((q) => (q.id === next.id ? next : q));

export const useQuestStore = create<QuestStoreState>((set, get) => ({
  quests: [],
  summary: null,
  generatedAt: null,
  canRegenerate: false,
  regenerateRemaining: 0,
  filter: "all",
  isLoading: false,
  error: null,
  selectedQuestId: null,
  showCompleteModal: false,
  showRegenerateModal: false,
  showDetailModal: false,
  lastXpGain: null,

  fetchTodayQuests: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson<TodayQuestsResponse>("/api/quests/today");
      set({
        quests: data.quests,
        summary: data.summary,
        generatedAt: data.generatedAt,
        canRegenerate: data.canRegenerate,
        regenerateRemaining: data.regenerateRemaining,
        isLoading: false,
      });
    } catch (error) {
      console.error("[QuestStore] fetchTodayQuests failed", error);
      set({
        isLoading: false,
        error: "クエストの取得に失敗しました",
      });
    }
  },

  regenerateQuests: async (options) => {
    set({ isLoading: true, error: null });
    try {
      await fetchJson<TodayQuestsResponse>("/api/quests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options ?? {}),
      });
      await get().fetchTodayQuests();
      set({ showRegenerateModal: false });
    } catch (error) {
      console.error("[QuestStore] regenerateQuests failed", error);
      set({
        isLoading: false,
        error: "クエストの再生成に失敗しました",
        showRegenerateModal: false,
      });
    }
  },

  acceptQuest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson<QuestActionResponse>(`/api/quests/${id}/accept`, { method: "POST" });
      set((state) => ({
        quests: replaceQuest(state.quests, data.quest),
        isLoading: false,
      }));
    } catch (error) {
      console.error("[QuestStore] acceptQuest failed", error);
      set(() => ({
        isLoading: false,
        error: "クエスト受諾に失敗しました",
      }));
    }
  },

  startQuest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson<QuestActionResponse>(`/api/quests/${id}/start`, { method: "POST" });
      set((state) => ({
        quests: replaceQuest(state.quests, data.quest),
        isLoading: false,
      }));
    } catch (error) {
      console.error("[QuestStore] startQuest failed", error);
      set(() => ({
        isLoading: false,
        error: "クエスト開始に失敗しました",
      }));
    }
  },

  completeQuest: async (id: string, payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson<QuestActionResponse>(`/api/quests/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? {}),
      });
      set((state) => ({
        quests: replaceQuest(state.quests, data.quest),
        isLoading: false,
        showCompleteModal: false,
        selectedQuestId: null,
        lastXpGain:
          data.xpEarned && data.xpEarned > 0
            ? {
                xpEarned: data.xpEarned,
                questTitle: data.quest.title,
                levelUp: data.levelUp ?? false,
                newLevel: data.newLevel,
              }
            : state.lastXpGain,
      }));
    } catch (error) {
      console.error("[QuestStore] completeQuest failed", error);
      set(() => ({
        isLoading: false,
        showCompleteModal: false,
        selectedQuestId: null,
        error: "クエスト完了に失敗しました",
      }));
    }
  },

  skipQuest: async (id: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson<QuestActionResponse>(`/api/quests/${id}/skip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      set((state) => ({
        quests: replaceQuest(state.quests, data.quest),
        isLoading: false,
      }));
    } catch (error) {
      console.error("[QuestStore] skipQuest failed", error);
      set(() => ({
        isLoading: false,
        error: "クエストスキップに失敗しました",
      }));
    }
  },

  setFilter: (filter) => set({ filter }),

  selectQuest: (id) => set({ selectedQuestId: id }),

  openCompleteModal: (id) => set({ selectedQuestId: id, showCompleteModal: true }),
  closeCompleteModal: () => set({ showCompleteModal: false, selectedQuestId: null }),

  openRegenerateModal: () => set({ showRegenerateModal: true }),
  closeRegenerateModal: () => set({ showRegenerateModal: false }),

  openDetailModal: (id) => set({ selectedQuestId: id, showDetailModal: true }),
  closeDetailModal: () => set({ showDetailModal: false }),
  clearLastXpGain: () => set({ lastXpGain: null }),
}));
