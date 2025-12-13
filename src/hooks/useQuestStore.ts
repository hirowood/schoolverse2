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
import { questApiClient } from "@/features/quests/api";

interface LastXpGain {
  xpEarned: number;
  questTitle: string;
  levelUp: boolean;
  newLevel?: number;
}

interface QuestStoreState {
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
  lastXpGain: LastXpGain | null;
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
}

const toErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message.trim().length > 0) return err.message;
  return fallback;
};

const toTodayQuestsState = (data: TodayQuestsResponse) => ({
  quests: data.quests,
  summary: data.summary,
  generatedAt: data.generatedAt,
  canRegenerate: data.canRegenerate,
  regenerateRemaining: data.regenerateRemaining,
  isLoading: false,
});

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
      const data = await questApiClient.fetchTodayQuests();
      set((state) => ({
        ...toTodayQuestsState(data),
        lastXpGain: state.lastXpGain,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: toErrorMessage(error, "クエストの取得に失敗しました"),
      });
    }
  },

  regenerateQuests: async (options) => {
    set({ isLoading: true, error: null });
    try {
      const data = await questApiClient.regenerateTodayQuests(options);
      set((state) => ({
        ...toTodayQuestsState(data),
        showRegenerateModal: false,
        lastXpGain: state.lastXpGain,
      }));
    } catch (error) {
      set({
        isLoading: false,
        showRegenerateModal: false,
        error: toErrorMessage(error, "クエストの再生成に失敗しました"),
      });
    }
  },

  acceptQuest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await questApiClient.acceptQuest(id);
      await get().fetchTodayQuests();
    } catch (error) {
      set({
        isLoading: false,
        error: toErrorMessage(error, "クエスト受諾に失敗しました"),
      });
    }
  },

  startQuest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await questApiClient.startQuest(id);
      await get().fetchTodayQuests();
    } catch (error) {
      set({
        isLoading: false,
        error: toErrorMessage(error, "クエスト開始に失敗しました"),
      });
    }
  },

  completeQuest: async (id: string, payload) => {
    set({ isLoading: true, error: null });
    try {
      const data: QuestActionResponse = await questApiClient.completeQuest(id, payload);
      set((state) => ({
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
      await get().fetchTodayQuests();
    } catch (error) {
      set({
        isLoading: false,
        showCompleteModal: false,
        selectedQuestId: null,
        error: toErrorMessage(error, "クエスト完了に失敗しました"),
      });
    }
  },

  skipQuest: async (id: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      await questApiClient.skipQuest(id, reason);
      await get().fetchTodayQuests();
    } catch (error) {
      set({
        isLoading: false,
        error: toErrorMessage(error, "クエストスキップに失敗しました"),
      });
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
