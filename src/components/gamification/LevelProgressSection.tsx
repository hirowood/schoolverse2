import type { GameProfile } from "@/types/gamification";
import { ProgressBar } from "@/components/gamification/ProgressBar";
import { formatNumber } from "@/lib/gamification/formatters";

interface LevelProgressSectionProps {
  profile: GameProfile;
}

export function LevelProgressSection({ profile }: LevelProgressSectionProps) {
  const percent = profile.xpToNextLevel <= 0 ? 0 : Math.min(100, Math.round((profile.currentXp / profile.xpToNextLevel) * 100));
  const xpRemaining = Math.max(profile.xpToNextLevel - profile.currentXp, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-800/85 dark:ring-slate-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-200">レベル・XP</p>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Lv.{profile.level}</div>
          <p className="text-sm text-slate-600 dark:text-slate-300">スワイプなしで数値が読める大きめレイアウト</p>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm dark:bg-amber-900/40 dark:text-amber-100">
          次のレベルまで {formatNumber(xpRemaining)} XP
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <ProgressBar value={profile.currentXp} max={profile.xpToNextLevel} showLabel />
        <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-slate-800 dark:text-white">
            {formatNumber(profile.currentXp)} / {formatNumber(profile.xpToNextLevel)} XP
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-700/70 dark:text-white">
            累計XP: {formatNumber(profile.totalXp)} XP
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-100">
            進捗 {percent}%
          </span>
          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-100">
            ランク: {profile.rankLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
