"use client";

import Link from "next/link";
import { useDashboardStore } from "@/hooks/useDashboardStore";
import { cardClassName } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function RecentAchievementsCard() {
  const summary = useDashboardStore((state) => state.summary);
  if (!summary?.recentAchievements) return null;

  const { unlocked, claimable, nearCompletion } = summary.recentAchievements;

  return (
    <section className={cardClassName({ radius: "2xl", className: "bg-white/90" })}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-slate-900">🏅 最近の実績</h3>
        <Link
          href="/achievements"
          className={cn(buttonClassName({ variant: "outline", rounded: "full", size: "tapXs" }), "whitespace-nowrap")}
        >
          すべて見る →
        </Link>
      </div>

      {claimable > 0 ? (
        <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          報酬未受取: {claimable} 件
        </div>
      ) : null}

      <div className="space-y-2">
        {unlocked.slice(0, 3).map((achv) => (
          <div
            key={achv.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3 text-base font-semibold text-slate-800">
              <span className="text-xl">{achv.icon}</span>
              <span className="truncate">{achv.name}</span>
            </div>
            <span className="flex-shrink-0 text-xs font-semibold text-slate-500">{achv.rarity}</span>
          </div>
        ))}
        {unlocked.length === 0 ? <p className="text-base text-slate-500">最近の実績はありません。</p> : null}
      </div>

      {nearCompletion.length > 0 ? (
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <p className="font-semibold">達成間近</p>
          {nearCompletion.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
              <span className="truncate">{a.name}</span>
              <span className="flex-shrink-0 text-sm font-semibold text-indigo-700">{a.progressPercent}%</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

