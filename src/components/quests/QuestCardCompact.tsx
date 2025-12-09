"use client";

import type { TodayQuest } from "@/types/quest";
import { formatXp } from "@/lib/quests/formatters";

type Props = {
  quest: TodayQuest;
  onClick?: (id: string) => void;
};

export function QuestCardCompact({ quest, onClick }: Props) {
  const statusLabel =
    quest.status === "completed"
      ? "完了"
      : quest.status === "in_progress"
        ? "進行中"
        : quest.status === "skipped"
          ? "スキップ"
          : "未開始";

  return (
    <button
      type="button"
      onClick={() => onClick?.(quest.id)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow"
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">{quest.categoryIcon}</span>
          <span className="font-semibold text-slate-900">{quest.title}</span>
        </div>
        <span className="text-xs font-semibold text-slate-500">{formatXp(quest.xpReward)}</span>
      </div>
      <div className="mt-1 text-[11px] text-slate-600">{statusLabel}</div>
    </button>
  );
}
