import type { GamificationStats } from "@/types/gamification";
import { formatMinutesToHours, formatNumber } from "@/lib/gamification/formatters";

type StatsSummaryProps = {
  stats: GamificationStats;
};

const STAT_ITEMS: Array<{
  key: keyof GamificationStats;
  label: string;
  icon: string;
  formatter?: (value: number) => string;
}> = [
  { key: "currentStreak", label: "連続学習", icon: "📅" },
  { key: "longestStreak", label: "最長ストリーク", icon: "🔥" },
  { key: "totalTasksCompleted", label: "タスク完了", icon: "✅" },
  { key: "totalNotesCreated", label: "ノート作成", icon: "📝" },
  { key: "totalChatMessages", label: "相談回数", icon: "💬" },
  { key: "totalLearningMinutes", label: "総学習時間", icon: "⏱️", formatter: formatMinutesToHours },
];

export function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">統計サマリー</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_ITEMS.map((item) => {
          const value = stats[item.key] ?? 0;
          const display = item.formatter ? item.formatter(value) : formatNumber(value);
          return (
            <div
              key={item.key}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-inner"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  {item.icon} {item.label}
                </span>
                <span className="text-lg font-bold text-slate-800">{display}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
