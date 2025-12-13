import type { AchievementSummary } from "@/types/gamification";
import { ProgressBar } from "@/components/gamification/ProgressBar";

interface AchievementSummaryProps {
  summary: AchievementSummary;
}

export function AchievementSummary({ summary }: AchievementSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-800/85 dark:ring-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-200">
            実績サマリー
          </p>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            達成済み: {summary.completed} / {summary.total}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span>進捗中: {summary.inProgress}</span>
            <span>未報酬: {summary.unclaimed}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-indigo-600 dark:text-indigo-200">{summary.completionRate}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-300">コンプリート率</div>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={summary.completionRate} max={100} />
      </div>
    </section>
  );
}
