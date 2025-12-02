"use client";

import { CATEGORY_OPTIONS, LearningCategory } from "@/features/learning-chat/types";

type Props = {
  value: LearningCategory | null;
  onChange: (category: LearningCategory | null) => void;
};

export function CategorySelector({ value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
      <span>📂 カテゴリ</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value as LearningCategory) || null)}
        className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-slate-400 focus:outline-none"
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
