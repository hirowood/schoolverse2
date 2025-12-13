import type { AchievementWithProgress } from "@/types/gamification";
import { ProgressBar } from "@/components/gamification/ProgressBar";
import { getRarityStyle } from "@/lib/gamification/rarity";
import { formatNumber } from "@/lib/gamification/formatters";

interface AchievementCardProps {
  achievement: AchievementWithProgress;
  onSelect?: (achievement: AchievementWithProgress) => void;
  onClaim?: (achievementId: string) => void;
}

export function AchievementCard({ achievement, onSelect, onClaim }: AchievementCardProps) {
  const rarity = getRarityStyle(achievement.rarity);
  const showProgress = !achievement.isCompleted;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(achievement)}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.(achievement)}
      className={`flex flex-col gap-3 rounded-xl border ${rarity.border} ${rarity.bg} p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:ring-slate-700`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{achievement.icon}</span>
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-50">{achievement.name}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">{achievement.description}</div>
          </div>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ color: rarity.color, border: `1px solid ${rarity.color}` }}
        >
          {achievement.rarityLabel}
        </span>
      </div>

      {showProgress ? (
        <div className="space-y-2">
          <ProgressBar value={achievement.currentProgress} max={achievement.conditionValue} />
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>
              {achievement.currentProgress} / {achievement.conditionValue}
            </span>
            <span className="font-semibold">{achievement.progressPercent}%</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          ✅ 達成済み
          {achievement.completedAt && (
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
              {new Date(achievement.completedAt).toLocaleDateString("ja-JP")}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1 text-xs text-slate-700 dark:text-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <span>報酬: +{formatNumber(achievement.xpReward)} XP / {formatNumber(achievement.coinReward)} コイン</span>
        {achievement.titleReward && <span className="text-amber-700 dark:text-amber-200">🎖 {achievement.titleReward}</span>}
      </div>

      {achievement.isCompleted && !achievement.isRewardClaimed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClaim?.(achievement.id);
          }}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:scale-[0.99]"
        >
          報酬を受け取る
        </button>
      )}
      {achievement.isCompleted && achievement.isRewardClaimed && (
        <div className="text-xs font-semibold text-emerald-700">報酬受取済み</div>
      )}
    </div>
  );
}
