"use client";

import dynamic from "next/dynamic";
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

const Canvas3D = dynamic(
  () => import("@/components/virtual-classroom/Room3D/Canvas3D").then((m) => m.Canvas3D),
  { ssr: false, loading: () => <div className="h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-inner" /> },
);

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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Virtual Classroom</p>
            <h2 className="text-lg font-bold text-slate-900">教室の3Dプレビュー</h2>
            <p className="text-sm text-slate-600">ログイン直後に教室の雰囲気を確認できます。</p>
          </div>
        </div>
        <Canvas3D />
      </section>

      <QuickAccessGrid />
    </main>
  );
}
