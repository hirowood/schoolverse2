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
  }, []);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">実績</h1>
          <p className="text-sm text-slate-600">カテゴリ別に進捗と報酬を確認</p>
        </div>
        {isLoading && <span className="text-xs text-slate-500">更新中...</span>}
      </div>

      {achievementsSummary && <AchievementSummary summary={achievementsSummary} />}

      <CategoryTabs
        category={filters.category}
        status={filters.status}
        onCategoryChange={(value) => void fetchAchievements({ category: value })}
        onStatusChange={(value) => void fetchAchievements({ status: value })}
      />

      <UnclaimedRewardsBanner count={achievementsSummary?.unclaimed ?? 0} onClaimAll={() => void claimAllRewards()} />

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
    </div>
  );
}
