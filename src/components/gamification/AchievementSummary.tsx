import type { AchievementSummary } from "@/types/gamification";
import { ProgressBar } from "@/components/gamification/ProgressBar";

type AchievementSummaryProps = {
  summary: AchievementSummary;
};

export function AchievementSummary({ summary }: AchievementSummaryProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">実績サマリー</p>
          <div className="text-2xl font-bold text-slate-800">
            達成済み: {summary.completed} / {summary.total}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
            <span>進捗中: {summary.inProgress}</span>
            <span>未報酬: {summary.unclaimed}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-indigo-600">{summary.completionRate}%</div>
          <div className="text-xs text-slate-500">コンプリート率</div>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={summary.completionRate} max={100} />
      </div>
    </div>
  );
}
