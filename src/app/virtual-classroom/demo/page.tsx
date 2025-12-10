"use client";

import { useState } from "react";
import { useVirtualEncounter } from "@/hooks/useVirtualEncounter";
import { BattleOverlay } from "@/components/virtual-classroom/Battle/BattleOverlay";
import { MONSTER_CATEGORIES } from "@/features/virtual-classroom/constants";

export default function VirtualClassroomDemoPage() {
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
  const [category, setCategory] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Virtual Classroom</p>
        <h1 className="text-2xl font-bold text-slate-900">モンスター遭遇デモ</h1>
        <p className="text-sm text-slate-600 mt-2">
          カテゴリを選択して「遭遇開始」を押すと、遭遇APIと解答APIを通したミニバトルを体験できます。
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
            onClick={() => startEncounter(category)}
            disabled={loading}
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
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            状態:{" "}
            {encounterId
              ? result
                ? result.isCorrect
                  ? "バトル終了（正解）"
                  : "バトル終了（不正解）"
                : "バトル進行中"
              : "待機中"}
          </p>
          {monster && (
            <p className="text-sm text-slate-700 mt-1">
              出現: {monster.name} / {monster.category} / レア度 {monster.rarity}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        このページはデモ用の簡易UIです。3D環境やHUD統合前に遭遇APIと解答APIの挙動を確認できます。
      </p>

      <BattleOverlay
        monster={monster}
        question={question}
        result={result}
        loading={loading}
        error={error}
        onAnswer={answerEncounter}
        onClose={resetEncounter}
      />
    </main>
  );
}
