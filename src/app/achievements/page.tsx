"use client";

import { useEffect, useMemo, useState } from "react";
import { AchievementSummary } from "@/components/gamification/AchievementSummary";
import { CategoryTabs } from "@/components/gamification/CategoryTabs";
import { UnclaimedRewardsBanner } from "@/components/gamification/UnclaimedRewardsBanner";
import { AchievementSection } from "@/components/gamification/AchievementSection";
import { AchievementDetailModal } from "@/components/gamification/AchievementDetailModal";
import { useGameStore } from "@/hooks/useGameStore";
import type { AchievementWithProgress } from "@/types/gamification";

export default function AchievementsPage() {
  const {
    achievements,
    achievementsSummary,
    filters,
    fetchAchievements,
    claimReward,
    claimAllRewards,
    isLoading,
  } = useGameStore();
  const [selected, setSelected] = useState<AchievementWithProgress | null>(null);

  useEffect(() => {
    void fetchAchievements();
  }, [fetchAchievements]);

  const inProgress = useMemo(
    () => achievements.filter((a) => !a.isCompleted && a.progressPercent > 0),
    [achievements]
  );
  const completed = useMemo(() => achievements.filter((a) => a.isCompleted), [achievements]);
  const locked = useMemo(
    () => achievements.filter((a) => !a.isCompleted && a.progressPercent <= 0),
    [achievements]
  );

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-purple-50 via-white to-indigo-50 px-5 py-4 shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 dark:ring-slate-700 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700 dark:text-indigo-200">
              実績
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">成果と報酬</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">カテゴリ別の進捗と報酬をまとめてチェック</p>
          </div>
          {isLoading && (
            <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              更新中…
            </span>
          )}
        </div>
      </header>

      {achievementsSummary && <AchievementSummary summary={achievementsSummary} />}

      <CategoryTabs
        category={filters.category}
        status={filters.status}
        onCategoryChange={(value) => void fetchAchievements({ category: value })}
        onStatusChange={(value) => void fetchAchievements({ status: value })}
      />

      <UnclaimedRewardsBanner
        count={achievementsSummary?.unclaimed ?? 0}
        onClaimAll={() => void claimAllRewards()}
      />

      <div className="space-y-8">
        <AchievementSection
          title="進捗中"
          achievements={inProgress}
          onSelect={setSelected}
          onClaim={(id) => void claimReward(id)}
        />
        <AchievementSection
          title="達成済み"
          achievements={completed}
          onSelect={setSelected}
          onClaim={(id) => void claimReward(id)}
        />
        <AchievementSection
          title="未達成（ヒント付き）"
          achievements={locked}
          onSelect={setSelected}
          onClaim={(id) => void claimReward(id)}
        />
      </div>

      <AchievementDetailModal
        achievement={selected}
        onClose={() => setSelected(null)}
        onClaim={(id) => {
          void claimReward(id);
          setSelected(null);
        }}
      />
    </main>
  );
}
