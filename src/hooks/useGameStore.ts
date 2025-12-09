"use client";

import { create } from "zustand";
import {
  type AchievementSummary,
  type AchievementWithProgress,
  type GamificationFilters,
  type GameProfile,
  type GamificationStats,
  type ProfileResponse,
  type AchievementsResponse,
  type ClaimRewardResponse,
  type XpTransaction,
  type XpHistoryResponse,
} from "@/types/gamification";
import {
  mockAchievementsResponse,
  mockProfileResponse,
  mockXpHistoryResponse,
} from "@/lib/gamification/mock-data";

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

const fetchJson = async <T>(path: string, init?: RequestInit) => {
  const res = await fetch(path, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  profile: mockProfileResponse.profile,
  stats: mockProfileResponse.stats,
  recentXp: mockProfileResponse.recentXp,
  achievements: mockAchievementsResponse.achievements,
  achievementsSummary: mockAchievementsResponse.summary,
  xpHistory: mockXpHistoryResponse.transactions,
  todayXp: mockXpHistoryResponse.todayTotal,
  filters: { category: "all", status: "all" },
  isLoading: false,
  error: undefined,

  fetchProfile: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const data = await fetchJson<ProfileResponse>("/api/gamification/profile");
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
        error: "プロフィールを取得できませんでした (モック表示中)",
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
      const params = new URLSearchParams();
      if (nextFilters.category && nextFilters.category !== "all") {
        params.append("category", nextFilters.category);
      }
      if (nextFilters.status && nextFilters.status !== "all") {
        params.append("status", nextFilters.status);
      }
      const query = params.toString();
      const url = query ? `/api/gamification/achievements?${query}` : "/api/gamification/achievements";
      const data = await fetchJson<AchievementsResponse>(url);
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
        error: "実績を取得できませんでした (モック表示中)",
      });
    }
  },

  claimReward: async (achievementId: string) => {
    try {
      const data = await fetchJson<ClaimRewardResponse>("/api/gamification/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId }),
      });

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
      await fetchJson<ClaimRewardResponse>("/api/gamification/claim-all-rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementIds: targetIds }),
      });
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
      const data = await fetchJson<XpHistoryResponse>("/api/gamification/xp-history");
      set({
        xpHistory: data.transactions,
        todayXp: data.todayTotal,
      });
    } catch (error) {
      console.error("[GameStore] refreshXpHistory failed, using mock data", error);
      set({
        xpHistory: mockXpHistoryResponse.transactions,
        todayXp: mockXpHistoryResponse.todayTotal,
        error: "XP履歴を取得できませんでした (モック表示中)",
      });
    }
  },
}));
