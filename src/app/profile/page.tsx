"use client";

import { useEffect } from "react";
import { ProfileHeader } from "@/components/gamification/ProfileHeader";
import { LevelProgressSection } from "@/components/gamification/LevelProgressSection";
import { CurrencyCards } from "@/components/gamification/CurrencyCards";
import { StatsSummary } from "@/components/gamification/StatsSummary";
import { RecentXpList } from "@/components/gamification/RecentXpList";
import { useGameStore } from "@/hooks/useGameStore";

export default function ProfilePage() {
  const { profile, stats, recentXp, fetchProfile, refreshXpHistory, isLoading } = useGameStore();

  useEffect(() => {
    void fetchProfile();
    void refreshXpHistory();
  }, [fetchProfile, refreshXpHistory]);

  const showSkeleton = !profile || !stats;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">マイステータス</p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">成長のダッシュボード</h1>
          <p className="text-sm text-slate-600">レベル・XP・通貨・統計をまとめて確認</p>
        </div>
        {isLoading && <span className="text-xs font-semibold text-slate-500">更新中...</span>}
      </div>

      {showSkeleton ? (
        <div className="space-y-4">
          <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/80" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/80 lg:col-span-2" />
            <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/80" />
          </div>
          <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800/80" />
          <div className="h-52 rounded-2xl bg-slate-100 dark:bg-slate-800/80" />
        </div>
      ) : (
        <>
          <ProfileHeader profile={profile} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LevelProgressSection profile={profile} />
            </div>
            <CurrencyCards coins={profile.coins} gems={profile.gems} />
          </div>

          <StatsSummary stats={stats} />

          <RecentXpList items={recentXp.slice(0, 5)} />
        </>
      )}
    </main>
  );
}
