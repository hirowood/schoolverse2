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
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <QuestStatusTabs filter={filter} onChange={onChange} />
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <span>すべて({counts.all})</span>
        <span>進行中({counts.in_progress})</span>
        <span>完了({counts.completed})</span>
        <span>スキップ({counts.skipped})</span>
      </div>
    </div>
  );
}
