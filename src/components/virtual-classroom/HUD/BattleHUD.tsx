"use client";

import { useEffect, useState } from "react";
import { BattleOverlay } from "@/components/virtual-classroom/Battle/BattleOverlay";
import { MONSTER_CATEGORIES } from "@/features/virtual-classroom/constants";
import { useVirtualRoomStore } from "@/stores/useVirtualRoomStore";
import { Button } from "@/components/ui/Button";
import { RewardToast } from "./RewardToast";

type Props = {
  // VirtualClassroom のチャットモーダルをHUD内のボタンから開閉したい場合に渡す
  chatOpen?: boolean;
  onToggleChat?: () => void;
};

export function BattleHUD({ chatOpen, onToggleChat }: Props) {
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
      {/* モバイルの下部ナビに被らないよう、HUDは少し上に配置 */}
      <div className="fixed bottom-24 left-1/2 z-40 flex w-[calc(100%-24px)] -translate-x-1/2 flex-col items-stretch gap-2 rounded-2xl bg-white/90 px-3 py-3 shadow-lg ring-1 ring-slate-200 backdrop-blur sm:bottom-4 sm:max-w-3xl sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-4 sm:py-3">
        <select
          className="min-h-11 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm shadow-sm sm:w-auto sm:min-w-[240px]"
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
        <Button
          variant="solid"
          color="emerald"
          size="tap"
          className="min-h-11 w-full shadow-md sm:w-auto"
          onClick={() => startEncounter({ category })}
          disabled={loading}
        >
          遭遇開始
        </Button>
        {/* 固定のフローティングボタンだとモバイルHUDと被るため、HUD内に統合 */}
        {onToggleChat && (
          <Button
            variant={chatOpen ? "solid" : "outline"}
            color={chatOpen ? "emerald" : "slate"}
            size="tap"
            className="min-h-11 w-full shadow sm:w-auto"
            onClick={onToggleChat}
          >
            {chatOpen ? "チャットを閉じる" : "チャットを開く"}
          </Button>
        )}
        <label className="min-h-11 flex w-full items-center gap-2 rounded-md border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm sm:w-auto sm:text-xs">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={toggleSound}
            className="h-5 w-5 accent-emerald-600"
          />
          サウンド
        </label>
        {(encounterId || isBattleActive) && (
          <Button
            variant="outline"
            size="tap"
            className="min-h-11 w-full sm:w-auto"
            onClick={resetBattle}
          >
            リセット
          </Button>
        )}
        <span className="text-center text-sm text-slate-500 sm:text-left sm:text-xs">
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
