"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
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
  NotificationsCard,
} from "./_components";

const Canvas3D = dynamic(
  () => import("@/components/virtual-classroom/Room3D/Canvas3D").then((m) => m.Canvas3D),
  { ssr: false, loading: () => <div className="h-[520px] w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-inner" /> },
);

export default function DashboardPage() {
  const { summary, isLoading, error, fetchSummary } = useDashboardStore();
  const currentCurriculum = summary?.currentCurriculum;

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
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Now Learning</p>
                <h2 className="text-lg font-bold text-slate-900">進行中のカリキュラム</h2>
              </div>
              <Link href="/curriculum" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                一覧へ
              </Link>
            </div>
            {currentCurriculum ? (
              <Link
                href={`/curriculum/${currentCurriculum.lineId}/${currentCurriculum.slug}`}
                className="mt-3 block rounded-xl border border-slate-100 bg-emerald-50/60 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <p className="text-xs font-semibold text-emerald-700">{currentCurriculum.lineTitle}</p>
                <p className="text-base font-bold text-slate-900">{currentCurriculum.lessonTitle}</p>
                <div className="mt-3 h-2 rounded-full bg-white/70 ring-1 ring-emerald-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, Math.max(0, currentCurriculum.progressPercent))}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  進捗 {Math.round(currentCurriculum.progressPercent)}%
                </p>
              </Link>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                進行中のカリキュラムはありません。{" "}
                <Link href="/curriculum" className="font-semibold text-emerald-600 hover:text-emerald-700">
                  カリキュラム一覧
                </Link>{" "}
                から開始してください。
              </div>
            )}
          </section>
          <TodayQuestsCard />
          <TodayTasksCard />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <TimeTrackerCard />
          <DailyGoalCard />
        </div>
        <div className="space-y-4 lg:col-span-3">
          <NotificationsCard />
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
