"use client";

import { useEffect, useState } from "react";
import { BattleOverlay } from "@/components/virtual-classroom/Battle/BattleOverlay";
import { MONSTER_CATEGORIES } from "@/features/virtual-classroom/constants";
import { useVirtualRoomStore } from "@/stores/useVirtualRoomStore";
import { RewardToast } from "./RewardToast";

export function BattleHUD() {
  const [category, setCategory] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const {
    encounterId,
    monster,
    question,
    result,
    loading,
    error,
    startEncounter,
    answerEncounter,
    resetBattle,
    isBattleActive,
  } = useVirtualRoomStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("vc_sound_enabled");
    if (stored !== null) {
      // defer to next frame to avoid sync setState warning
      requestAnimationFrame(() => setSoundEnabled(stored === "true"));
    }
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("vc_sound_enabled", String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => {
      resetBattle();
    }, 4500);
    return () => clearTimeout(timer);
  }, [result, resetBattle]);

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
          onClick={() => startEncounter({ category })}
          disabled={loading}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-60"
        >
          遭遇開始
        </button>
        <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={toggleSound}
            className="h-4 w-4 accent-emerald-600"
          />
          サウンド
        </label>
        {(encounterId || isBattleActive) && (
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
            onClick={resetBattle}
          >
            リセット
          </button>
        )}
        <span className="text-xs text-slate-500">
          {encounterId || isBattleActive ? "バトル中" : loading ? "ロード中" : "待機中"}
        </span>
      </div>

      <BattleOverlay
        monster={monster}
        question={question}
        result={result}
        loading={loading}
        error={error}
        onAnswer={answerEncounter}
        onClose={resetBattle}
      />

      <RewardToast
        open={Boolean(result)}
        isCorrect={Boolean(result?.isCorrect)}
        monsterName={monster?.name}
        xp={result?.xpEarned ?? 0}
        bonusXp={result?.bonusXpEarned ?? 0}
        coins={result?.coinsEarned ?? 0}
        onClose={resetBattle}
        soundEnabled={soundEnabled}
      />
    </>
  );
}
