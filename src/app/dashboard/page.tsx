"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/hooks/useDashboardStore";
import {
  DashboardHeader,
  DashboardSkeleton,
  GameStatusCard,
  TodayQuestsCard,
  TodayTasksCard,
  CredoProgressCard,
  RecentAchievementsCard,
  QuickAccessGrid,
  TimeTrackerCard,
  DailyGoalCard,
} from "./_components";

export default function DashboardPage() {
  const { summary, isLoading, error, fetchSummary } = useDashboardStore();

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  if (isLoading && !summary) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <DashboardHeader userName={summary?.gameProfile.name} level={summary?.gameProfile.level} />

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <TodayQuestsCard />
          <TodayTasksCard />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <TimeTrackerCard />
          <DailyGoalCard />
        </div>
        <div className="space-y-4 lg:col-span-3">
          <GameStatusCard />
          <CredoProgressCard />
          <RecentAchievementsCard />
        </div>
      </div>

      <QuickAccessGrid />
    </main>
  );
}
