import type { AchievementWithProgress } from "@/types/gamification";
import { getRarityStyle } from "@/lib/gamification/rarity";
import { ProgressBar } from "@/components/gamification/ProgressBar";
import { formatNumber } from "@/lib/gamification/formatters";

type AchievementDetailModalProps = {
  achievement?: AchievementWithProgress | null;
  onClose: () => void;
  onClaim?: (id: string) => void;
};

export function AchievementDetailModal({ achievement, onClose, onClaim }: AchievementDetailModalProps) {
  if (!achievement) return null;
  const rarity = getRarityStyle(achievement.rarity);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">{achievement.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{achievement.name}</h3>
              <div
                className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ color: rarity.color, border: `1px solid ${rarity.color}` }}
              >
                {rarity.label}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-700">{achievement.description}</p>

        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4">
          <div className="text-xs font-semibold text-slate-600">
            進捗: {achievement.currentProgress} / {achievement.conditionValue}
          </div>
          <ProgressBar value={achievement.currentProgress} max={achievement.conditionValue} showLabel />
        </div>

        <div className="mt-4 rounded-xl bg-white p-4 shadow-inner">
          <div className="text-xs font-semibold text-slate-500">報酬</div>
          <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-slate-800">
            <span>💫 +{formatNumber(achievement.xpReward)} XP</span>
            <span>💰 +{formatNumber(achievement.coinReward)} コイン</span>
            {achievement.titleReward && <span>🏷️ {achievement.titleReward}</span>}
          </div>
        </div>

        {achievement.hint && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 shadow-inner">
            💡 ヒント: {achievement.hint}
          </div>
        )}

        {achievement.isCompleted && !achievement.isRewardClaimed && (
          <button
            type="button"
            onClick={() => onClaim?.(achievement.id)}
            className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            報酬を受け取る
          </button>
        )}
        {achievement.isCompleted && achievement.isRewardClaimed && (
          <div className="mt-6 text-center text-sm font-semibold text-emerald-700">報酬受取済み</div>
        )}
      </div>
    </div>
  );
}
