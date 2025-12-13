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

const baseClass =
  "rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500";

export function QuestStatusTabs({ filter, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {ITEMS.map((item) => {
        const active = filter === item.value;
        const styles = active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600";
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            aria-pressed={active}
            className={`${baseClass} ${styles}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
