"use client";

import Link from "next/link";
import { useDashboardStore } from "@/hooks/useDashboardStore";
import { QuestCategoryBadge } from "@/components/quests/QuestCategoryBadge";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";

export function TodayQuestsCard() {
  const summary = useDashboardStore((state) => state.summary);
  const completeQuest = useDashboardStore((state) => state.completeQuest);

  if (!summary?.todayQuests) return null;

  const { quests, total, completed } = summary.todayQuests;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">今日のクエスト</h2>
          <p className="text-xs text-slate-600">
            完了: {completed}/{total} ({progress}%)
          </p>
        </div>
        <Link href="/quests" className="text-xs font-semibold text-indigo-600 hover:underline">
          すべて見る →
        </Link>
      </div>

      <div className="mb-3">
        <QuestProgressBar value={progress} max={100} />
      </div>

      <div className="space-y-3">
        {quests.map((quest) => (
          <div key={quest.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{quest.title}</span>
                  <QuestCategoryBadge category={quest.category as any} label={quest.category} />
                </div>
                <div className="text-[11px] text-slate-600">XP: {quest.xpReward}</div>
              </div>
              {quest.status === "completed" ? (
                <span className="text-xs font-semibold text-emerald-700">✅ 完了</span>
              ) : quest.status === "in_progress" ? (
                <button
                  type="button"
                  onClick={() => completeQuest(quest.id)}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  完了する
                </button>
              ) : (
                <span className="text-xs font-semibold text-slate-500">未開始</span>
              )}
            </div>
            {quest.status !== "completed" && quest.progressPercent !== undefined && (
              <div className="mt-2">
                <QuestProgressBar value={quest.progressPercent} max={100} />
              </div>
            )}
          </div>
        ))}
        {quests.length === 0 && <p className="text-sm text-slate-500">本日のクエストはありません。</p>}
      </div>
    </section>
  );
}
