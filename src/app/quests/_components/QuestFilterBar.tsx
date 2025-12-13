"use client";

import type { QuestFilter } from "@/types/quest";
import { QuestStatusTabs } from "@/components/quests/QuestStatusTabs";

interface QuestCounts {
  all: number;
  in_progress: number;
  completed: number;
  skipped: number;
}

interface Props {
  filter: QuestFilter;
  onChange: (filter: QuestFilter) => void;
  counts: QuestCounts;
}

const pillClass =
  "inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-100";

export function QuestFilterBar({ filter, onChange, counts }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm ring-1 ring-slate-100 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 dark:ring-slate-700 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <QuestStatusTabs filter={filter} onChange={onChange} />
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className={pillClass}>すべて {counts.all}</span>
          <span className={`${pillClass} bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100`}>
            進行中 {counts.in_progress}
          </span>
          <span className={`${pillClass} bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-100`}>
            完了 {counts.completed}
          </span>
          <span className={pillClass}>スキップ {counts.skipped}</span>
        </div>
      </div>
    </section>
  );
}
