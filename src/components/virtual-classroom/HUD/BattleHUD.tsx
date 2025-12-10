"use client";

import { useEffect, useState } from "react";
import { useVirtualEncounter } from "@/hooks/useVirtualEncounter";
import { BattleOverlay } from "@/components/virtual-classroom/Battle/BattleOverlay";
import { MONSTER_CATEGORIES } from "@/features/virtual-classroom/constants";
import { RewardToast } from "./RewardToast";

export function BattleHUD() {
  const [category, setCategory] = useState<string | null>(null);
  const {
    encounterId,
    monster,
    question,
    result,
    loading,
    error,
    startEncounter,
    answerEncounter,
    resetEncounter,
  } = useVirtualEncounter();

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => {
      resetEncounter();
    }, 4500);
    return () => clearTimeout(timer);
  }, [result, resetEncounter]);

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-lg ring-1 ring-slate-200 backdrop-blur">
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={category ?? ""}
          onChange={(e) => setCategory(e.target.value || null)}
        >
          <option value="">カテゴリ指定なし</option>
          {MONSTER_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => startEncounter(category)}
          disabled={loading}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-60"
        >
          遭遇開始
        </button>
        {encounterId && (
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
            onClick={resetEncounter}
          >
            リセット
          </button>
        )}
        <span className="text-xs text-slate-500">
          {encounterId ? "バトル中" : loading ? "ロード中…" : "待機中"}
        </span>
      </div>

      <BattleOverlay
        monster={monster}
        question={question}
        result={result}
        loading={loading}
        error={error}
        onAnswer={answerEncounter}
        onClose={resetEncounter}
      />

      <RewardToast
        open={Boolean(result)}
        isCorrect={Boolean(result?.isCorrect)}
        monsterName={monster?.name}
        xp={result?.xpEarned ?? 0}
        bonusXp={result?.bonusXpEarned ?? 0}
        coins={result?.coinsEarned ?? 0}
        onClose={resetEncounter}
      />
    </>
  );
}
