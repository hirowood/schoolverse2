"use client";

import { useState } from "react";
import { BattleOverlay } from "@/components/virtual-classroom/Battle/BattleOverlay";
import { MONSTER_CATEGORIES } from "@/features/virtual-classroom/constants";
import { useVirtualRoomStore } from "@/stores/useVirtualRoomStore";

export default function VirtualClassroomDemoPage() {
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
    resetBattle,
  } = useVirtualRoomStore();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Virtual Classroom</p>
        <h1 className="text-2xl font-bold text-slate-900">バーチャル教室 デモ</h1>
        <p className="text-sm text-slate-600 mt-2">
          カテゴリを選んで遭遇開始→回答→結果表示の流れを確認するデモです。
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
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
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            onClick={() => startEncounter({ category })}
            disabled={loading}
          >
            遭遇開始
          </button>
          {encounterId && (
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
              onClick={resetBattle}
            >
              リセット
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            状態:{" "}
            {encounterId
              ? result
                ? result.isCorrect
                  ? "バトル終了：勝利"
                  : "バトル終了：敗北"
                : "バトル中"
              : "待機中"}
          </p>
          {monster && (
            <p className="text-sm text-slate-700 mt-1">
              敵: {monster.name} / {monster.category} / レアリティ {monster.rarity}
            </p>
          )}
        </div>
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
    </main>
  );
}
