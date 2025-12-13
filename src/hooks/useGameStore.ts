"use client";

import { create } from "zustand";
import {
  claimAllRewards as claimAllRewardsApi,
  claimReward as claimRewardApi,
  fetchAchievements as fetchAchievementsApi,
  fetchProfile as fetchProfileApi,
  fetchXpHistory as fetchXpHistoryApi,
} from "@/features/gamification/api";
import {
  type AchievementSummary,
  type AchievementWithProgress,
  type GamificationFilters,
  type GameProfile,
  type GamificationStats,
  type XpTransaction,
} from "@/types/gamification";
import { mockAchievementsResponse, mockProfileResponse, mockXpHistoryResponse } from "@/lib/gamification/mock-data";

type GameStoreState = {
  profile?: GameProfile;
  stats?: GamificationStats;
  recentXp: XpTransaction[];
  achievements: AchievementWithProgress[];
  achievementsSummary?: AchievementSummary;
  xpHistory: XpTransaction[];
  todayXp: number;
  filters: GamificationFilters;
  isLoading: boolean;
  error?: string;
  fetchProfile: () => Promise<void>;
  fetchAchievements: (filters?: Partial<GamificationFilters>) => Promise<void>;
  claimReward: (achievementId: string) => Promise<void>;
  claimAllRewards: () => Promise<void>;
  refreshXpHistory: () => Promise<void>;
};

const toError = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  return fallback;
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  profile: undefined,
  stats: undefined,
  recentXp: [],
  achievements: [],
  achievementsSummary: undefined,
  xpHistory: [],
  todayXp: 0,
  filters: { category: "all", status: "all" },
  isLoading: false,
  error: undefined,

  fetchProfile: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const data = await fetchProfileApi();
      set({
        profile: data.profile,
        stats: data.stats,
        recentXp: data.recentXp,
        isLoading: false,
      });
    } catch (error) {
      console.error("[GameStore] fetchProfile failed, using mock data", error);
      set({
        profile: mockProfileResponse.profile,
        stats: mockProfileResponse.stats,
        recentXp: mockProfileResponse.recentXp,
        isLoading: false,
        error: toError(error, "プロフィールを取得できませんでした (モック表示中)"),
      });
    }
  },

  fetchAchievements: async (filters) => {
    set({ isLoading: true, error: undefined });
    const nextFilters = {
      ...get().filters,
      ...filters,
    };
    try {
      const data = await fetchAchievementsApi(nextFilters);
      set({
        achievements: data.achievements,
        achievementsSummary: data.summary,
        filters: nextFilters,
        isLoading: false,
      });
    } catch (error) {
      console.error("[GameStore] fetchAchievements failed, using mock data", error);
      set({
        achievements: mockAchievementsResponse.achievements,
        achievementsSummary: mockAchievementsResponse.summary,
        filters: nextFilters,
        isLoading: false,
        error: toError(error, "実績を取得できませんでした (モック表示中)"),
      });
    }
  },

  claimReward: async (achievementId: string) => {
    try {
      const data = await claimRewardApi(achievementId);

      set((state) => ({
        profile: data.updatedProfile ?? state.profile,
        achievements: state.achievements.map((achv) =>
          achv.id === achievementId
            ? { ...achv, isRewardClaimed: true, isCompleted: true }
            : achv
        ),
        achievementsSummary: state.achievementsSummary
          ? {
              ...state.achievementsSummary,
              unclaimed: Math.max(0, state.achievementsSummary.unclaimed - 1),
            }
          : state.achievementsSummary,
      }));
    } catch (error) {
      console.error("[GameStore] claimReward failed", error);
      // fallback: mark as claimed locally
      set((state) => ({
        achievements: state.achievements.map((achv) =>
          achv.id === achievementId
            ? { ...achv, isRewardClaimed: true, isCompleted: true }
            : achv
        ),
        achievementsSummary: state.achievementsSummary
          ? {
              ...state.achievementsSummary,
              unclaimed: Math.max(0, state.achievementsSummary.unclaimed - 1),
            }
          : state.achievementsSummary,
      }));
    }
  },

  claimAllRewards: async () => {
    const targetIds = get().achievements.filter((a) => a.isCompleted && !a.isRewardClaimed).map((a) => a.id);
    if (targetIds.length === 0) return;
    try {
      await claimAllRewardsApi(targetIds);
    } catch (error) {
      console.error("[GameStore] claimAllRewards failed (local-only update)", error);
    }

    set((state) => ({
      achievements: state.achievements.map((achv) =>
        achv.isCompleted ? { ...achv, isRewardClaimed: true } : achv
      ),
      achievementsSummary: state.achievementsSummary
        ? { ...state.achievementsSummary, unclaimed: 0 }
        : state.achievementsSummary,
    }));
  },

  refreshXpHistory: async () => {
    try {
      const data = await fetchXpHistoryApi();
      set({
        xpHistory: data.transactions,
        todayXp: data.todayTotal,
      });
    } catch (error) {
      console.error("[GameStore] refreshXpHistory failed, using mock data", error);
      set({
        xpHistory: mockXpHistoryResponse.transactions,
        todayXp: mockXpHistoryResponse.todayTotal,
        error: toError(error, "XP履歴を取得できませんでした (モック表示中)"),
      });
    }
  },
}));
