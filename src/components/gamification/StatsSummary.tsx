import type { GamificationStats } from "@/types/gamification";
import { formatMinutesToHours, formatNumber } from "@/lib/gamification/formatters";

interface StatsSummaryProps {
  stats: GamificationStats;
}

const STAT_ITEMS: Array<{
  key: keyof GamificationStats;
  label: string;
  icon: string;
  formatter?: (value: number) => string;
}> = [
  { key: "currentStreak", label: "連続学習", icon: "🔥" },
  { key: "longestStreak", label: "最長ストリーク", icon: "🏁" },
  { key: "totalTasksCompleted", label: "タスク完了", icon: "✅" },
  { key: "totalNotesCreated", label: "ノート作成", icon: "📝" },
  { key: "totalChatMessages", label: "相談回数", icon: "💬" },
  { key: "totalLearningMinutes", label: "総学習時間", icon: "⏱", formatter: formatMinutesToHours },
];

export function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-800/85 dark:ring-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">統計サマリー</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_ITEMS.map((item) => {
          const value = stats[item.key] ?? 0;
          const display = item.formatter ? item.formatter(value) : formatNumber(value);
          return (
            <div
              key={item.key}
              className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-inner dark:border-slate-700 dark:bg-slate-900/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{display}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
