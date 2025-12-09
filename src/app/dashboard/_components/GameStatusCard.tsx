"use client";

import { useDashboardStore } from "@/hooks/useDashboardStore";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";
import { formatNumber } from "@/lib/gamification/formatters";

export function GameStatusCard() {
  const summary = useDashboardStore((state) => state.summary);

  if (!summary?.gameProfile) return null;
  const gp = summary.gameProfile;
  const percent = gp.requiredXp > 0 ? Math.min(100, Math.round((gp.currentXp / gp.requiredXp) * 100)) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-700">🎮 ゲームステータス</div>
          <div className="text-2xl font-bold text-slate-900">Lv.{gp.level}</div>
          <p className="text-xs text-slate-600">Rank: {gp.rank}</p>
        </div>
        <div className="rounded-xl bg-slate-900 px-3 py-2 text-right text-white">
          <p className="text-[11px] uppercase tracking-wide text-slate-200">Streak</p>
          <p className="text-lg font-semibold">🔥 {gp.streak}日</p>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="text-xs text-slate-600">
          {formatNumber(gp.currentXp)} / {formatNumber(gp.requiredXp)} XP
        </div>
        <QuestProgressBar value={percent} max={100} showLabel={false} />
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-700">
        <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">🪙 {formatNumber(gp.coins)}</span>
        <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700">💎 {formatNumber(gp.gems)}</span>
      </div>
    </section>
  );
}
