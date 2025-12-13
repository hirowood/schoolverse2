"use client";

import { Button } from "@/components/ui/Button";

interface Props {
  userName?: string;
  level?: number;
  onShowOnboarding?: () => void;
}

export function DashboardHeader({ userName, level, onShowOnboarding }: Props) {
  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">ダッシュボード</h1>
          <p className="text-base text-slate-600">
            今日は何をすべきかをひと目で把握できます。クエスト・タスク・実績をここから確認しましょう。
          </p>
        </div>
        {onShowOnboarding && (
          <Button variant="outline" size="tap" rounded="full" onClick={onShowOnboarding}>
            Onboarding再表示
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-700">
        {userName && <span className="font-semibold">{userName}</span>}
        {level !== undefined && (
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Lv.{level}</span>
        )}
      </div>
    </header>
  );
}
