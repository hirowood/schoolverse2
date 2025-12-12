"use client";

import { CATEGORY_OPTIONS, LearningCategory } from "@/features/learning-chat/types";

type Props = {
  value: LearningCategory | null;
  onChange: (category: LearningCategory | null) => void;
};

export function CategorySelector({ value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
      <span className="flex items-center gap-2 text-base">
        <span role="img" aria-label="category">
          🏷
        </span>
        カテゴリ
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value as LearningCategory) || null)}
        className="rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-slate-400 focus:outline-none"
      >
        <option value="">指定なし</option>
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
