"use client";

import { useEffect } from "react";
import { GameStatusWidget as BaseWidget } from "@/components/gamification/GameStatusWidget";
import { useGameStore } from "@/hooks/useGameStore";

export function GameStatusWidget() {
  const { profile, stats, todayXp, fetchProfile, refreshXpHistory } = useGameStore();

  useEffect(() => {
    void fetchProfile();
    void refreshXpHistory();
  }, []);

  if (!profile || !stats) return null;

  return <BaseWidget profile={profile} todayXp={todayXp} streak={stats.currentStreak} />;
}
