"use client";

import { useDashboardStore } from "@/hooks/useDashboardStore";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";
import { formatNumber } from "@/lib/gamification/formatters";
import { cardClassName } from "@/components/ui/Card";

export function GameStatusCard() {
  const summary = useDashboardStore((state) => state.summary);
  if (!summary?.gameProfile) return null;

  const gp = summary.gameProfile;
  const percent =
    gp.requiredXp > 0 ? Math.min(100, Math.round((gp.currentXp / gp.requiredXp) * 100)) : 0;

  return (
    <section className={cardClassName({ radius: "2xl", className: "bg-white/90" })}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-700">🎮 ゲームステータス</p>
          <p className="text-2xl font-bold text-slate-900">Lv.{gp.level}</p>
          <p className="text-sm text-slate-600">Rank: {gp.rank}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-4 py-3 text-right text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Streak</p>
          <p className="mt-1 text-lg font-semibold">🔥 {gp.streak}日</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-sm text-slate-600">
          {formatNumber(gp.currentXp)} / {formatNumber(gp.requiredXp)} XP
        </div>
        <QuestProgressBar value={percent} max={100} showLabel={false} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
          🪙 {formatNumber(gp.coins)}
        </span>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
          💎 {formatNumber(gp.gems)}
        </span>
      </div>
    </section>
  );
}

