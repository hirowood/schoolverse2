import { useCallback, useEffect, useState } from "react";
import type { AchievementWithProgress } from "@/types/gamification";
import { formatNumber } from "@/lib/gamification/formatters";

type AchievementToastProps = {
  achievement: AchievementWithProgress;
  onClaim: () => void;
  onDismiss: () => void;
};

export function AchievementToast({ achievement, onClaim, onDismiss }: AchievementToastProps) {
  const [exiting, setExiting] = useState(false);

  const close = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onDismiss, 200);
  }, [exiting, onDismiss]);

  useEffect(() => {
    const timer = setTimeout(close, 10_000);
    return () => clearTimeout(timer);
  }, [close]);

  return (
    <div
      className={`w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl transition ${
        exiting ? "animate-slide-out-right" : "animate-slide-in-right"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="text-sm font-semibold text-slate-900">🎉 実績解除！</div>
        <button
          type="button"
          onClick={close}
          className="text-xs text-slate-500 hover:text-slate-700"
          aria-label="閉じる"
        >
          ×
        </button>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
          {achievement.icon}
        </div>
        <div className="space-y-0.5">
          <div className="text-sm font-semibold text-slate-900">{achievement.name}</div>
          <div className="text-xs text-slate-600">{achievement.description}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800">
        <span>+{formatNumber(achievement.xpReward)} XP</span>
        <span>+{formatNumber(achievement.coinReward)} コイン</span>
        {achievement.titleReward && <span className="text-amber-700">🏷️ {achievement.titleReward}</span>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onClaim();
            close();
          }}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
        >
          報酬を受け取る
        </button>
        <button
          type="button"
          onClick={close}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          後で
        </button>
      </div>
    </div>
  );
}
