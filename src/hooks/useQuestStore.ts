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
import { mockTodayQuestsResponse, mockActionResponse } from "@/lib/quests/mock-data";

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
};

const fetchJson = async <T>(url: string, init?: RequestInit) => {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return (await res.json()) as T;
};

const replaceQuest = (quests: TodayQuest[], next: TodayQuest) =>
  quests.map((q) => (q.id === next.id ? next : q));

export const useQuestStore = create<QuestStoreState>((set, get) => ({
  quests: mockTodayQuestsResponse.quests,
  summary: mockTodayQuestsResponse.summary,
  generatedAt: mockTodayQuestsResponse.generatedAt,
  canRegenerate: mockTodayQuestsResponse.canRegenerate,
  regenerateRemaining: mockTodayQuestsResponse.regenerateRemaining,
  filter: "all",
  isLoading: false,
  error: null,
  selectedQuestId: null,
  showCompleteModal: false,
  showRegenerateModal: false,
  showDetailModal: false,

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
      console.error("[QuestStore] fetchTodayQuests failed, fallback to mock", error);
      set({
        quests: mockTodayQuestsResponse.quests,
        summary: mockTodayQuestsResponse.summary,
        generatedAt: mockTodayQuestsResponse.generatedAt,
        canRegenerate: mockTodayQuestsResponse.canRegenerate,
        regenerateRemaining: mockTodayQuestsResponse.regenerateRemaining,
        isLoading: false,
        error: "クエストの取得に失敗しました（モック表示中）",
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
        quests: mockTodayQuestsResponse.quests,
        summary: mockTodayQuestsResponse.summary,
        generatedAt: mockTodayQuestsResponse.generatedAt,
        canRegenerate: mockTodayQuestsResponse.canRegenerate,
        regenerateRemaining: mockTodayQuestsResponse.regenerateRemaining,
        isLoading: false,
        error: "クエストの再生成に失敗しました（モック表示中）",
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
      console.error("[QuestStore] acceptQuest failed (fallback)", error);
      const mock = mockActionResponse(id, "accepted");
      set((state) => ({
        quests: mock.success ? replaceQuest(state.quests, mock.quest) : state.quests,
        isLoading: false,
        error: "クエスト受諾に失敗しました（モック更新）",
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
      console.error("[QuestStore] startQuest failed (fallback)", error);
      const mock = mockActionResponse(id, "in_progress");
      set((state) => ({
        quests: mock.success ? replaceQuest(state.quests, mock.quest) : state.quests,
        isLoading: false,
        error: "クエスト開始に失敗しました（モック更新）",
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
      }));
    } catch (error) {
      console.error("[QuestStore] completeQuest failed (fallback)", error);
      const mock = mockActionResponse(id, "completed");
      set((state) => ({
        quests: mock.success ? replaceQuest(state.quests, mock.quest) : state.quests,
        isLoading: false,
        showCompleteModal: false,
        selectedQuestId: null,
        error: "クエスト完了に失敗しました（モック更新）",
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
      console.error("[QuestStore] skipQuest failed (fallback)", error);
      const mock = mockActionResponse(id, "skipped");
      set((state) => ({
        quests: mock.success ? replaceQuest(state.quests, mock.quest) : state.quests,
        isLoading: false,
        error: "クエストスキップに失敗しました（モック更新）",
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
}));
