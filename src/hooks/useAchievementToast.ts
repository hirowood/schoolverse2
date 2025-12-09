"use client";

import { create } from "zustand";
import type { AchievementWithProgress } from "@/types/gamification";
import { useGameStore } from "@/hooks/useGameStore";

type ToastItem = {
  id: string;
  achievement: AchievementWithProgress;
  createdAt: number;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (achievement: AchievementWithProgress) => void;
  hideToast: (id: string) => void;
  clearAll: () => void;
  claimAndHide: (id: string) => Promise<void>;
  hasUnclaimed: boolean;
};

export const useAchievementToast = create<ToastState>((set, get) => ({
  toasts: [],
  hasUnclaimed: false,
  showToast: (achievement) =>
    set((state) => {
      if (state.toasts.find((t) => t.id === achievement.id)) {
        return state;
      }
      const next: ToastItem = { id: achievement.id, achievement, createdAt: Date.now() };
      const toasts = [...state.toasts, next];
      const capped = toasts.slice(-3);
      return { toasts: capped, hasUnclaimed: true };
    }),
  hideToast: (id) =>
    set((state) => {
      const next = state.toasts.filter((t) => t.id !== id);
      return { toasts: next, hasUnclaimed: next.length > 0 };
    }),
  clearAll: () => set({ toasts: [], hasUnclaimed: false }),
  claimAndHide: async (id: string) => {
    try {
      const claimReward = useGameStore.getState().claimReward;
      if (claimReward) {
        await claimReward(id);
      }
    } catch (error) {
      console.error("[AchievementToast] claim failed", error);
    } finally {
      get().hideToast(id);
    }
  },
}));
