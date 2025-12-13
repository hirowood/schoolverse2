"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";
import { useDashboardStore } from "@/hooks/useDashboardStore";
import {
  DashboardHeader,
  DashboardSectionHeader,
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
import { cardClassName } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const Canvas3D = dynamic(
  () => import("@/components/virtual-classroom/Room3D/Canvas3D").then((m) => m.Canvas3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] w-full rounded-2xl border border-slate-200 bg-slate-100 shadow-inner sm:h-[520px]" />
    ),
  },
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
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <section className={cardClassName({ radius: "2xl", className: "space-y-3" })}>
            <DashboardSectionHeader
              eyebrow="Now Learning"
              title="進行中のカリキュラム"
              action={{ href: "/curriculum", label: "一覧へ" }}
            />
            {currentCurriculum ? (
              <Link
                href={`/curriculum/${currentCurriculum.lineId}/${currentCurriculum.slug}`}
                className={cn(
                  "block rounded-2xl border border-slate-100 bg-emerald-50/60 p-4 transition hover:-translate-y-0.5 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
                )}
              >
                <p className="text-sm font-semibold text-emerald-700">{currentCurriculum.lineTitle}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{currentCurriculum.lessonTitle}</p>
                <div className="mt-4 h-2.5 rounded-full bg-white/70 ring-1 ring-emerald-100">
                  <div
                    className="h-2.5 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, Math.max(0, currentCurriculum.progressPercent))}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  進捗 {Math.round(currentCurriculum.progressPercent)}%
                </p>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-base text-slate-700">
                進行中のカリキュラムはありません。
                <div className="mt-3">
                  <Link
                    href="/curriculum"
                    className={buttonClassName({ variant: "solid", color: "emerald", rounded: "full", size: "tap" })}
                  >
                    カリキュラム一覧から開始
                  </Link>
                </div>
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

      <section className={cardClassName({ radius: "2xl" })}>
        <DashboardSectionHeader
          eyebrow="Virtual Classroom"
          title="教室の3Dプレビュー"
          description="ログイン直後に教室の雰囲気を確認できます。"
        />
        <div className="mt-4">
          <Canvas3D />
        </div>
      </section>

      <QuickAccessGrid />
    </main>
  );
}
