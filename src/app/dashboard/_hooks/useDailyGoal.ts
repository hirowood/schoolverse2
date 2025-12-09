"use client";

import { useEffect, useState } from "react";
import { getToday } from "@/features/plan/utils/date";

type UseDailyGoalReturn = {
  goal: string;
  weeklyGoal: string | null;
  setGoal: (value: string) => void;
  save: () => void;
  isSaved: boolean;
};

export function useDailyGoal(): UseDailyGoalReturn {
  const [goal, setGoal] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const todayKey = `dashboard-goal-${getToday()}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(todayKey);
    if (stored !== null) {
      setGoal(stored);
      setIsSaved(stored.length > 0);
    } else {
      setGoal("");
      setIsSaved(false);
    }
  }, [todayKey]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/settings/profile");
        if (!res.ok) return;
        const data = (await res.json()) as { weeklyGoal?: string | null };
        if (active) setWeeklyGoal(data.weeklyGoal ?? null);
      } catch (error) {
        console.error("[useDailyGoal] weeklyGoal fetch failed", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const save = () => {
    if (typeof window === "undefined") return;
    const trimmed = goal.trim();
    window.localStorage.setItem(todayKey, trimmed);
    setIsSaved(trimmed.length > 0);
  };

  return { goal, weeklyGoal, setGoal, save, isSaved };
}
