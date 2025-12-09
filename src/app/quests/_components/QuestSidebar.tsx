"use client";

import { useQuestStore } from "@/hooks/useQuestStore";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";

export function QuestSidebar() {
  const summary = useQuestStore((state) => state.summary);
  if (!summary) return null;

  const { completed, total, completionRate, totalXpEarned, totalXpPossible, streak, remainingHours } = summary;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">📊 進捗サマリー</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        完了: {completed}/{total} ({completionRate}%)
      </p>
      <div className="mt-2">
        <QuestProgressBar value={completionRate} max={100} />
      </div>
      <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-200">
        <div className="flex items-center justify-between">
          <span>獲得XP</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">+{totalXpEarned}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>最大XP</span>
          <span className="font-semibold text-slate-900 dark:text-slate-50">{totalXpPossible}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>🔥 連続</span>
          <span className="font-semibold text-orange-600 dark:text-orange-300">{streak} 日</span>
        </div>
        <div className="flex items-center justify-between">
          <span>⏰ 残り時間</span>
          <span className="font-semibold text-slate-900 dark:text-slate-50">{remainingHours} 時間</span>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100">
        クエストを完了するとXPが獲得できます。進行中のクエストから完了しましょう。
      </div>
    </aside>
  );
}
