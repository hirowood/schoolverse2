"use client";

import Link from "next/link";
import { QUEST_CATEGORIES, type QuestCategory } from "@/lib/constants/quest-categories";
import { useDashboardStore } from "@/hooks/useDashboardStore";
import { cardClassName } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

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
    <section className={cardClassName({ radius: "2xl", className: "bg-white/90" })}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden>
            🧩
          </span>
          <div>
            <div className="text-lg font-semibold text-slate-900">今日のクエスト</div>
            <div className="text-sm text-slate-500">
              完了 {completed}/{total}
            </div>
          </div>
        </div>
        <Link
          href="/quests"
          className={cn(buttonClassName({ variant: "outline", rounded: "full", size: "tapXs" }), "whitespace-nowrap")}
        >
          すべて見る →
        </Link>
      </div>

      <div className="mb-4 h-2.5 rounded-full bg-slate-100">
        <div className="h-2.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {topQuests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-base text-slate-700">
          今日のクエストはまだありません。
          <div className="mt-3">
            <Link
              href="/quests"
              className={buttonClassName({ variant: "solid", color: "blue", rounded: "full", size: "tap" })}
            >
              生成する
            </Link>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {topQuests.map((quest) => {
          const categoryKey = (quest.category as QuestCategory) ?? "learning";
          const category = QUEST_CATEGORIES[categoryKey];
          return (
            <div
              key={quest.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  {category?.icon ?? "🎯"}
                </div>
                <div>
                  <div className="text-base font-semibold text-slate-900">{quest.title}</div>
                  <div className="text-sm text-slate-500">{statusLabel[quest.status] ?? quest.status}</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-indigo-700">+{quest.xpReward ?? 0} XP</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

