// src/hooks/useCoachPlan.ts
"use client";

import { useState, useCallback, useEffect } from "react";

export interface PlanTask {
  title: string;
  durationMinutes: number;
  timeSlot: string;
  taskId?: string;
  note?: string;
}

export interface StudyPlan {
  date: string;
  focus: string;
  tasks: PlanTask[];
  coachMessage: string;
}

interface UseCoachPlanReturn {
  plan: StudyPlan | null;
  isLoading: boolean;
  error: string | null;
  retryAfter: number | null;
  generatePlan: (date?: string) => Promise<void>;
  clearError: () => void;
  clearPlan: () => void;
}

export function useCoachPlan(): UseCoachPlanReturn {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const generatePlan = useCallback(async (date?: string) => {
    setIsLoading(true);
    setError(null);
    setRetryAfter(null);

    try {
      const res = await fetch("/api/coach/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(date ? { date } : {}),
      });

      if (res.status === 401) {
        setError("サインインしてください");
        return;
      }

      if (res.status === 429) {
        const data = await res.json();
        setRetryAfter(data.retryAfter ?? 60);
        setError("リクエスト制限中です。しばらくお待ちください。");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "プラン生成に失敗しました");
      }

      const data = await res.json();
      setPlan(data.plan);
    } catch (e) {
      setError((e as Error).message || "プラン生成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setRetryAfter(null);
  }, []);

  const clearPlan = useCallback(() => {
    setPlan(null);
  }, []);

  // retryAfterカウントダウン
  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;

    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  return {
    plan,
    isLoading,
    error,
    retryAfter,
    generatePlan,
    clearError,
    clearPlan,
  };
}
