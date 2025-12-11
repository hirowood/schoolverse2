"use client";

import { useCallback, useState } from "react";
import type { MonsterDefinition, MonsterQuestion } from "@/features/virtual-classroom/types";

type EncounterState = {
  encounterId: string | null;
  monster: MonsterDefinition | null;
  question: Omit<MonsterQuestion, "correctAnswer"> | null;
  result:
    | { isCorrect: boolean; xpEarned: number; bonusXpEarned: number; coinsEarned: number }
    | null;
  loading: boolean;
  error: string | null;
};

const initialState: EncounterState = {
  encounterId: null,
  monster: null,
  question: null,
  result: null,
  loading: false,
  error: null,
};

export function useVirtualEncounter() {
  const [state, setState] = useState<EncounterState>(initialState);

  const startEncounter = useCallback(
    async (category?: string | null) => {
      setState((prev) => ({ ...prev, loading: true, error: null, result: null }));
      const res = await fetch("/api/monster/encounter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category ?? null,
          // 位置・レベルは暫定値（3D座標同期はPhase3で連携）
          position: { x: 0, y: 0, z: 0 },
          playerLevel: 1,
        }),
      });
      if (!res.ok) {
        setState((prev) => ({ ...prev, loading: false, error: "遭遇できませんでした" }));
        return;
      }
      const data = (await res.json()) as {
        success: boolean;
        data?: { encounterId: string; monster: MonsterDefinition; question: Omit<MonsterQuestion, "correctAnswer"> };
      };
      if (!data.success || !data.data) {
        setState((prev) => ({ ...prev, loading: false, error: "遭遇できませんでした" }));
        return;
      }
      setState({
        encounterId: data.data.encounterId,
        monster: data.data.monster,
        question: data.data.question,
        result: null,
        loading: false,
        error: null,
      });
    },
    [],
  );

  const answerEncounter = useCallback(async (answer: string) => {
    if (!state.encounterId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const res = await fetch("/api/monster/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encounterId: state.encounterId, answer }),
    });
    if (!res.ok) {
      setState((prev) => ({ ...prev, loading: false, error: "回答に失敗しました" }));
      return;
    }
    const data = (await res.json()) as {
      success: boolean;
      data?: { isCorrect: boolean; xpEarned: number; bonusXpEarned: number; coinsEarned: number };
    };
    if (!data.success || !data.data) {
      setState((prev) => ({ ...prev, loading: false, error: "回答に失敗しました" }));
      return;
    }
    setState((prev) => ({
      ...prev,
      loading: false,
      result: data.data ?? null,
    }));
  }, [state.encounterId]);

  const resetEncounter = useCallback(() => setState(initialState), []);

  return {
    ...state,
    startEncounter,
    answerEncounter,
    resetEncounter,
  };
}
