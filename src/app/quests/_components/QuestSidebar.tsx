"use client";

import { QuestProgressBar } from "@/components/quests/QuestProgressBar";
import { useQuestStore } from "@/hooks/useQuestStore";

export function QuestSidebar() {
  const summary = useQuestStore((state) => state.summary);
  if (!summary) return null;

  const { completed, total, completionRate, totalXpEarned, totalXpPossible, streak, remainingHours } = summary;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">サマリー</p>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">進捗サマリー</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">残り時間とXPを一目で確認</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100">
          {completed}/{total}
        </span>
      </div>

      <div className="mt-3">
        <QuestProgressBar value={completionRate} max={100} />
        <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-200">達成率 {completionRate}%</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-[11px] font-semibold text-slate-500">獲得XP</p>
          <p className="text-lg">{totalXpEarned}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-[11px] font-semibold text-slate-500">最大XP</p>
          <p className="text-lg">{totalXpPossible}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-[11px] font-semibold text-slate-500">連続達成</p>
          <p className="text-lg">{streak} 日</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-[11px] font-semibold text-slate-500">残り時間</p>
          <p className="text-lg">{remainingHours} 時間</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100">
        進行中のクエストから完了すると、XPが増えて達成率も向上します。
      </div>
    </aside>
  );
}
