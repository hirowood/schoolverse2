import type { AchievementWithProgress } from "@/types/gamification";
import { ProgressBar } from "@/components/gamification/ProgressBar";
import { getRarityStyle } from "@/lib/gamification/rarity";
import { formatNumber } from "@/lib/gamification/formatters";

type AchievementCardProps = {
  achievement: AchievementWithProgress;
  onSelect?: (achievement: AchievementWithProgress) => void;
  onClaim?: (achievementId: string) => void;
};

export function AchievementCard({ achievement, onSelect, onClaim }: AchievementCardProps) {
  const rarity = getRarityStyle(achievement.rarity);
  const showProgress = !achievement.isCompleted;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(achievement)}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.(achievement)}
      className={`flex flex-col gap-3 rounded-xl border ${rarity.border} ${rarity.bg} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{achievement.icon}</span>
          <div>
            <div className="text-sm font-semibold text-slate-800">{achievement.name}</div>
            <div className="text-xs text-slate-600">{achievement.description}</div>
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
          <div className="flex items-center justify-between text-xs text-slate-600">
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
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-slate-600">
              {new Date(achievement.completedAt).toLocaleDateString("ja-JP")}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-700">
        <span>報酬: +{formatNumber(achievement.xpReward)} XP / {formatNumber(achievement.coinReward)} コイン</span>
        {achievement.titleReward && <span className="text-amber-700">🏷️ {achievement.titleReward}</span>}
      </div>

      {achievement.isCompleted && !achievement.isRewardClaimed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClaim?.(achievement.id);
          }}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
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
