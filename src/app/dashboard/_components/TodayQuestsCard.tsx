"use client";

import Link from "next/link";
import { QUEST_CATEGORIES, type QuestCategory } from "@/lib/constants/quest-categories";
import { useDashboardStore } from "@/hooks/useDashboardStore";

const statusLabel: Record<string, string> = {
  pending: "未開始",
  accepted: "受諾済み",
  in_progress: "進行中",
  completed: "完了",
  skipped: "スキップ",
};

export function TodayQuestsCard() {
  const { summary } = useDashboardStore();
  const quests = summary?.todayQuests.quests ?? [];

  const completed = summary?.todayQuests.completed ?? 0;
  const total = summary?.todayQuests.total ?? 0;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const topQuests = quests.slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <div>
            <div className="text-base font-semibold text-slate-900">今日のクエスト</div>
            <div className="text-xs text-slate-500">完了 {completed}/{total}</div>
          </div>
        </div>
        <Link href="/quests" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          すべて見る →
        </Link>
      </div>

      <div className="mb-4 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {topQuests.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          今日のクエストはまだありません。
          <Link href="/quests" className="ml-2 font-semibold text-indigo-600 hover:text-indigo-700">
            生成する
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {topQuests.map((quest) => {
          const categoryKey = (quest.category as QuestCategory) ?? "learning";
          const category = QUEST_CATEGORIES[categoryKey];
          return (
            <div
              key={quest.id}
              className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg">
                  {category?.icon ?? "🎯"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{quest.title}</div>
                  <div className="text-xs text-slate-500">{statusLabel[quest.status] ?? quest.status}</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-indigo-700">+{quest.xpReward ?? 0} XP</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
