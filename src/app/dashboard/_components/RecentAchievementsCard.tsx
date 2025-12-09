"use client";

import Link from "next/link";
import { useDashboardStore } from "@/hooks/useDashboardStore";

export function RecentAchievementsCard() {
  const summary = useDashboardStore((state) => state.summary);
  if (!summary?.recentAchievements) return null;
  const { unlocked, claimable, nearCompletion } = summary.recentAchievements;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">🏆 最近の実績</h3>
        <Link href="/achievements" className="text-xs font-semibold text-indigo-600 hover:underline">
          すべて見る →
        </Link>
      </div>
      {claimable > 0 && (
        <div className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          報酬未受取: {claimable} 件
        </div>
      )}
      <div className="space-y-2">
        {unlocked.slice(0, 3).map((achv) => (
          <div key={achv.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span>{achv.icon}</span>
              <span>{achv.name}</span>
            </div>
            <span className="text-[11px] text-slate-500">{achv.rarity}</span>
          </div>
        ))}
        {unlocked.length === 0 && <p className="text-sm text-slate-500">最近の実績はありません。</p>}
      </div>
      {nearCompletion.length > 0 && (
        <div className="mt-3 space-y-1 text-xs text-slate-700">
          <p className="font-semibold">達成間近</p>
          {nearCompletion.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1">
              <span>{a.name}</span>
              <span className="text-[11px] font-semibold text-indigo-700">{a.progressPercent}%</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
