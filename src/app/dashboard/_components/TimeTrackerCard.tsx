"use client";

import { useTimeTracker } from "@/app/dashboard/_hooks/useTimeTracker";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";
import { cardClassName } from "@/components/ui/Card";

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
};

export function TimeTrackerCard() {
  const { data, isLoading, error } = useTimeTracker();

  const rows = [
    { label: "今日", value: data?.todaySeconds ?? 0 },
    { label: "今週", value: data?.weekSeconds ?? 0 },
    { label: "今月", value: data?.monthSeconds ?? 0 },
  ];

  const max = Math.max(...rows.map((r) => r.value), 0);

  return (
    <section className={cardClassName({ radius: "2xl", className: "bg-white/90 dark:border-slate-700 dark:bg-slate-800" })}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">⏱ 学習時間</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">日/週/月の学習ログを確認できます。</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-4 py-3 text-right text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">累計</p>
          <p className="mt-1 text-lg font-semibold">{formatDuration(data?.totalSeconds ?? 0)}</p>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}

      <div className="mt-4 space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold">{row.label}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-50">{formatDuration(row.value)}</span>
            </div>
            <QuestProgressBar value={max > 0 ? Math.round((row.value / max) * 100) : 0} max={100} showLabel={false} />
          </div>
        ))}
      </div>

      {isLoading ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">読み込み中...</p> : null}
    </section>
  );
}

