"use client";

import { QuestCategoryBadge } from "@/components/quests/QuestCategoryBadge";
import { QuestDifficultyStars } from "@/components/quests/QuestDifficultyStars";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";
import { CATEGORY_META, DIFFICULTY_META, formatMinutes, formatXp } from "@/lib/quests/formatters";
import type { TodayQuest } from "@/types/quest";

type Props = {
  quest: TodayQuest;
  onAccept?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onSkip?: (id: string) => void;
  onSelect?: (id: string) => void;
};

export function QuestCard({ quest, onAccept, onStart, onComplete, onSkip, onSelect }: Props) {
  const category = CATEGORY_META[quest.category];
  const difficulty = DIFFICULTY_META[quest.difficulty];

  const actions = () => {
    if (quest.status === "completed") {
      return <span className="text-xs font-semibold text-emerald-700">✅ 完了済み</span>;
    }
    if (quest.status === "skipped") {
      return <span className="text-xs font-semibold text-slate-500 line-through">スキップ</span>;
    }
    if (quest.status === "in_progress") {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onComplete?.(quest.id)}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            完了する ✓
          </button>
          <button
            type="button"
            onClick={() => onSkip?.(quest.id)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            スキップ
          </button>
        </div>
      );
    }
    if (quest.status === "accepted" || quest.status === "pending") {
      return (
        <div className="flex flex-wrap gap-2">
          {quest.status === "pending" && (
            <button
              type="button"
              onClick={() => onAccept?.(quest.id)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              受諾する
            </button>
          )}
          <button
            type="button"
            onClick={() => onStart?.(quest.id)}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {quest.status === "accepted" ? "開始する ▶" : "今すぐ取り組む ▶"}
          </button>
          <button
            type="button"
            onClick={() => onSkip?.(quest.id)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            スキップ
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border ${category.border} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
      onClick={() => onSelect?.(quest.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.(quest.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">{category.icon}</div>
          <div>
            <div className="text-base font-semibold text-slate-900">{quest.title}</div>
            <div className="text-xs text-slate-600">{quest.description}</div>
          </div>
        </div>
        <QuestDifficultyStars difficulty={quest.difficulty} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
        <QuestCategoryBadge category={quest.category} label={quest.categoryLabel} />
        <span className="rounded-full bg-slate-100 px-2 py-1">{formatMinutes(quest.estimatedMinutes)}</span>
        <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">{formatXp(quest.xpReward)}</span>
      </div>

      {quest.tips && (
        <div className="text-xs text-slate-700">
          💡 <span className="font-semibold">ヒント:</span> {quest.tips}
        </div>
      )}
      {quest.reason && (
        <div className="text-xs text-slate-700">
          📌 <span className="font-semibold">理由:</span> {quest.reason}
        </div>
      )}

      {quest.status === "in_progress" && quest.progressPercent !== undefined && (
        <QuestProgressBar value={quest.progressPercent} max={100} />
      )}
      {quest.status === "completed" && quest.completedAt && (
        <div className="text-xs font-semibold text-emerald-700">✅ 完了済み ({new Date(quest.completedAt).toLocaleTimeString()})</div>
      )}

      <div className="pt-2">{actions()}</div>
    </div>
  );
}
