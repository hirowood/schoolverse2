"use client";

import type { QuestFilter } from "@/types/quest";

type Props = {
  filter: QuestFilter;
  onChange: (filter: QuestFilter) => void;
};

const ITEMS: Array<{ value: QuestFilter; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "in_progress", label: "進行中" },
  { value: "completed", label: "完了" },
  { value: "skipped", label: "スキップ" },
];

export function QuestStatusTabs({ filter, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {ITEMS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
            filter === item.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
