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

  if (!profile || !stats) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-slate-600">ロード中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">マイステータス</h1>
          <p className="text-sm text-slate-600">レベル・XP・通貨・統計をまとめて確認</p>
        </div>
        {isLoading && <span className="text-xs text-slate-500">更新中...</span>}
      </div>

      <ProfileHeader profile={profile} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LevelProgressSection profile={profile} />
        </div>
        <CurrencyCards coins={profile.coins} gems={profile.gems} />
      </div>

      <StatsSummary stats={stats} />

      <RecentXpList items={recentXp.slice(0, 5)} />
    </div>
  );
}
