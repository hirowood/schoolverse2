"use client";

import { useEffect } from "react";
import { AchievementToast } from "@/components/gamification/AchievementToast";
import { useAchievementToast } from "@/hooks/useAchievementToast";
import { useGameStore } from "@/hooks/useGameStore";

export function AchievementToastContainer() {
  const achievements = useGameStore((state) => state.achievements);
  const fetchAchievements = useGameStore((state) => state.fetchAchievements);

  const { toasts, showToast, hideToast, claimAndHide } = useAchievementToast((state) => ({
    toasts: state.toasts,
    showToast: state.showToast,
    hideToast: state.hideToast,
    claimAndHide: state.claimAndHide,
  }));

  useEffect(() => {
    void fetchAchievements();
  }, [fetchAchievements]);

  useEffect(() => {
    const unclaimed = achievements.filter((a) => a.isCompleted && !a.isRewardClaimed);
    unclaimed.forEach((a) => showToast(a));
  }, [achievements, showToast]);

  if (toasts.length === 0) return null;

  const display = [...toasts].slice(-3).reverse();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 flex flex-col items-end gap-3 sm:left-auto sm:right-4 sm:w-96">
      {display.map((toast) => (
        <AchievementToast
          key={toast.id}
          achievement={toast.achievement}
          onDismiss={() => hideToast(toast.id)}
          onClaim={() => void claimAndHide(toast.id)}
        />
      ))}
    </div>
  );
}
