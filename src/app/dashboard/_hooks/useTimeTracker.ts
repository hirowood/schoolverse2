"use client";

import { useEffect, useMemo, useState } from "react";
import type { StudyTask } from "@/features/plan/types";
import { addDays, getToday, parseLocalDate } from "@/features/plan/utils/date";

type TimeTrackerData = {
  todaySeconds: number;
  weekSeconds: number;
  monthSeconds: number;
  totalSeconds: number;
};

type UseTimeTrackerReturn = {
  data: TimeTrackerData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const startOfWeekIso = (iso: string) => {
  const d = parseLocalDate(iso);
  const diffToMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const startOfMonthIso = (iso: string) => {
  const d = parseLocalDate(iso);
  d.setDate(1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const effectiveSeconds = (task: StudyTask, now: number) => {
  let base = task.totalWorkTime ?? 0;
  if (task.status === "in_progress" && task.lastStartedAt) {
    const started = new Date(task.lastStartedAt).getTime();
    if (!Number.isNaN(started)) {
      base += Math.floor((now - started) / 1000);
    }
  }
  return base;
};

export function useTimeTracker(): UseTimeTrackerReturn {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error(`failed ${res.status}`);
      const data = (await res.json()) as { tasks: StudyTask[] };
      setTasks(data.tasks ?? []);
    } catch (err) {
      console.error("[useTimeTracker] fetch failed", err);
      setError("学習時間を取得できませんでした");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const data: TimeTrackerData | null = useMemo(() => {
    if (!tasks.length) return { todaySeconds: 0, weekSeconds: 0, monthSeconds: 0, totalSeconds: 0 };
    const now = Date.now();
    const todayIso = getToday();
    const weekIso = startOfWeekIso(todayIso);
    const monthIso = startOfMonthIso(todayIso);

    let todaySeconds = 0;
    let weekSeconds = 0;
    let monthSeconds = 0;
    let totalSeconds = 0;

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const dayKey = task.dueDate.slice(0, 10);
      const sec = effectiveSeconds(task, now);
      totalSeconds += sec;
      if (dayKey === todayIso) todaySeconds += sec;

      if (dayKey >= weekIso && dayKey <= addDays(weekIso, 7)) weekSeconds += sec;

      if (dayKey >= monthIso && dayKey.slice(0, 7) === monthIso.slice(0, 7)) monthSeconds += sec;
    });

    return { todaySeconds, weekSeconds, monthSeconds, totalSeconds };
  }, [tasks]);

  return { data, isLoading, error, refresh };
}
