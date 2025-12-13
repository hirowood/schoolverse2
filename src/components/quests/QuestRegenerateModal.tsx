"use client";

import { useState } from "react";
import type { QuestCategory, QuestDifficultyPreference, QuestRegenerateOptions } from "@/types/quest";
import { CATEGORY_META } from "@/lib/quests/formatters";

type Props = {
  open: boolean;
  regenerateRemaining: number;
  onClose: () => void;
  onRegenerate: (options?: QuestRegenerateOptions) => void;
};

const difficultyOptions: Array<{ value: QuestDifficultyPreference; label: string }> = [
  { value: "easy", label: "やさしめ" },
  { value: "balanced", label: "バランス" },
  { value: "challenge", label: "チャレンジ" },
];

export function QuestRegenerateModal({ open, regenerateRemaining, onClose, onRegenerate }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<QuestCategory[]>([]);
  const [difficulty, setDifficulty] = useState<QuestDifficultyPreference>("balanced");

  if (!open) return null;

  const toggleCategory = (category: QuestCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">クエストを再生成</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">今日のクエストを再生成しますか？</p>
        <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
          再生成は1日3回まで（残り {regenerateRemaining} 回）
        </div>

        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">重視するカテゴリ</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_META) as QuestCategory[]).map((key) => {
                const meta = CATEGORY_META[key];
                const active = selectedCategories.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCategory(key)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-700 dark:text-white"
                    }`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">難易度の傾向</p>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    difficulty === opt.value
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:border-slate-700 dark:bg-slate-700 dark:text-white sm:w-auto"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => onRegenerate({ preferredCategories: selectedCategories, difficultyPreference: difficulty })}
            className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:bg-slate-200 dark:text-slate-900 sm:w-auto"
          >
            再生成する
          </button>
        </div>
      </div>
    </div>
  );
}
