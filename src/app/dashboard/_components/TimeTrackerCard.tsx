"use client";

import { useTimeTracker } from "@/app/dashboard/_hooks/useTimeTracker";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";

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
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">⏱️ 学習時間</h3>
        <div className="rounded-lg bg-slate-900 px-3 py-2 text-right text-white">
          <p className="text-[11px] uppercase tracking-wide text-slate-200">累計</p>
          <p className="text-lg font-semibold">{formatDuration(data?.totalSeconds ?? 0)}</p>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <div className="mt-3 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>{row.label}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-50">{formatDuration(row.value)}</span>
            </div>
            <QuestProgressBar value={max > 0 ? Math.round((row.value / max) * 100) : 0} max={100} showLabel={false} />
          </div>
        ))}
      </div>

      {isLoading && <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">読み込み中...</p>}
    </section>
  );
}
