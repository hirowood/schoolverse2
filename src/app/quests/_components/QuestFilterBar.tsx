"use client";

import type { QuestFilter } from "@/types/quest";
import { QuestStatusTabs } from "@/components/quests/QuestStatusTabs";

type Props = {
  filter: QuestFilter;
  onChange: (filter: QuestFilter) => void;
  counts: { all: number; in_progress: number; completed: number; skipped: number };
};

export function QuestFilterBar({ filter, onChange, counts }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <QuestStatusTabs filter={filter} onChange={onChange} />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300 sm:justify-end sm:text-xs">
        <span>すべて({counts.all})</span>
        <span>進行中({counts.in_progress})</span>
        <span>完了({counts.completed})</span>
        <span>スキップ({counts.skipped})</span>
      </div>
    </div>
  );
}
