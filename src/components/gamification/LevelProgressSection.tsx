import type { GameProfile } from "@/types/gamification";
import { ProgressBar } from "@/components/gamification/ProgressBar";
import { formatNumber } from "@/lib/gamification/formatters";

type LevelProgressSectionProps = {
  profile: GameProfile;
};

export function LevelProgressSection({ profile }: LevelProgressSectionProps) {
  const percent = profile.xpToNextLevel <= 0 ? 0 : Math.min(100, Math.round((profile.currentXp / profile.xpToNextLevel) * 100));
  const xpRemaining = Math.max(profile.xpToNextLevel - profile.currentXp, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600">レベル・XP</p>
          <div className="text-3xl font-bold tracking-tight">Lv.{profile.level}</div>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          次のレベルまで {formatNumber(xpRemaining)} XP
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <ProgressBar value={profile.currentXp} max={profile.xpToNextLevel} showLabel />
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {formatNumber(profile.currentXp)} / {formatNumber(profile.xpToNextLevel)} XP
          </span>
          <span className="font-semibold text-slate-700">累計XP: {formatNumber(profile.totalXp)} XP</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
            進捗 {percent}%
          </span>
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
            ランク: {profile.rankLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
