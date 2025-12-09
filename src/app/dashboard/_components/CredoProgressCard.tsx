"use client";

import { useDashboardStore } from "@/hooks/useDashboardStore";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";

export function CredoProgressCard() {
  const summary = useDashboardStore((state) => state.summary);
  if (!summary?.credoProgress) return null;
  const { total, practiced, items } = summary.credoProgress;
  const percent = total > 0 ? Math.round((practiced / total) * 100) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">✨ Credo 今日の実践</h3>
          <p className="text-xs text-slate-600">
            実践済み: {practiced}/{total} ({percent}%)
          </p>
        </div>
        <a href="/credo" className="text-xs font-semibold text-indigo-600 hover:underline">
          今日の記録 →
        </a>
      </div>
      <div className="mt-3">
        <QuestProgressBar value={percent} max={100} />
      </div>
      <div className="mt-3 space-y-1 text-xs text-slate-700">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-lg">{item.done ? "✅" : "⬜"}</span>
            <span className={item.done ? "font-semibold text-slate-800" : ""}>{item.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
