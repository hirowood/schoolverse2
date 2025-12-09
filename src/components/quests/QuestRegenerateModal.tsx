"use client";

import { useState } from "react";
import type { QuestCategory, QuestDifficultyPreference } from "@/types/quest";
import { CATEGORY_META } from "@/lib/quests/formatters";

type Props = {
  open: boolean;
  regenerateRemaining: number;
  onClose: () => void;
  onRegenerate: (options?: { preferredCategories?: QuestCategory[]; difficultyPreference?: QuestDifficultyPreference }) => void;
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
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">クエストを再生成</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-700">今日のクエストを再生成しますか？</p>
        <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          ⚠️ 再生成は1日3回まで（残り {regenerateRemaining} 回）
        </div>

        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">重視するカテゴリ</p>
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
                      active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">難易度の傾向</p>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    difficulty === opt.value ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => onRegenerate({ preferredCategories: selectedCategories, difficultyPreference: difficulty })}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            再生成する 🔄
          </button>
        </div>
      </div>
    </div>
  );
}
