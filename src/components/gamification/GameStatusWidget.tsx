import type { GameProfile } from "@/types/gamification";
import { ProgressBar } from "@/components/gamification/ProgressBar";
import { formatNumber } from "@/lib/gamification/formatters";

type GameStatusWidgetProps = {
  profile: GameProfile;
  todayXp: number;
  streak: number;
};

export function GameStatusWidget({ profile, todayXp, streak }: GameStatusWidgetProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">🎮 ゲームステータス</div>
        <span className="text-xs font-semibold text-slate-500">Lv.{profile.level}</span>
      </div>
      <div className="mt-3 space-y-2">
        <div className="text-xs text-slate-600">
          {formatNumber(profile.currentXp)} / {formatNumber(profile.xpToNextLevel)} XP
        </div>
        <ProgressBar value={profile.currentXp} max={profile.xpToNextLevel} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-700">
        <span>今日: +{formatNumber(todayXp)} XP</span>
        <span>🔥 {streak} 日連続</span>
      </div>
      <a
        href="/profile"
        className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:underline"
      >
        詳細を見る →
      </a>
    </div>
  );
}
