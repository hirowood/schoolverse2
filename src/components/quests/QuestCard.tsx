"use client";

import type { MouseEvent } from "react";
import { QuestCategoryBadge } from "@/components/quests/QuestCategoryBadge";
import { QuestDifficultyStars } from "@/components/quests/QuestDifficultyStars";
import { QuestProgressBar } from "@/components/quests/QuestProgressBar";
import { CATEGORY_META, formatMinutes, formatXp } from "@/lib/quests/formatters";
import type { QuestCategory, TodayQuest } from "@/types/quest";

type Props = {
  quest: TodayQuest;
  onAccept?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onSkip?: (id: string) => void;
  onSelect?: (id: string) => void;
};

const baseButton =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500";
const primaryButton = `${baseButton} bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500`;
const successButton = `${baseButton} bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300`;
const secondaryButton = `${baseButton} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700`;
const ghostButton = `${baseButton} border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700`;

export function QuestCard({ quest, onAccept, onStart, onComplete, onSkip, onSelect }: Props) {
  const categoryKey = (quest.category as QuestCategory) ?? "learning";
  const category = CATEGORY_META[categoryKey] ?? CATEGORY_META.learning;

  const handleCardSelect = () => {
    onSelect?.(quest.id);
  };

  const handleAction = (cb?: (id: string) => void) => (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    cb?.(quest.id);
  };

  const renderActions = () => {
    if (quest.status === "completed") {
      return <span className="text-sm font-semibold text-emerald-700">✓ 完了済み</span>;
    }
    if (quest.status === "skipped") {
      return <span className="text-sm font-semibold text-slate-500 line-through">スキップ済み</span>;
    }
    if (quest.status === "in_progress") {
      return (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleAction(onComplete)} className={successButton}>
            完了する
          </button>
          <button type="button" onClick={handleAction(onSkip)} className={secondaryButton}>
            スキップ
          </button>
        </div>
      );
    }
    if (quest.status === "accepted" || quest.status === "pending") {
      return (
        <div className="flex flex-wrap gap-2">
          {quest.status === "pending" && (
            <button type="button" onClick={handleAction(onAccept)} className={secondaryButton}>
              受諾する
            </button>
          )}
          <button type="button" onClick={handleAction(onStart)} className={primaryButton}>
            {quest.status === "accepted" ? "開始する" : "今すぐ取り組む"}
          </button>
          <button type="button" onClick={handleAction(onSkip)} className={ghostButton}>
            スキップ
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardSelect}
      onKeyDown={(event) => event.key === "Enter" && handleCardSelect()}
      className={`flex flex-col gap-3 rounded-2xl border ${category.border} bg-white/95 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-200 dark:bg-slate-800/90 sm:px-5 sm:py-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-700">
            {category.icon || "📌"}
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">{quest.title}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 sm:text-sm">{quest.description}</div>
          </div>
        </div>
        <QuestDifficultyStars difficulty={quest.difficulty} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
        <QuestCategoryBadge category={quest.category} label={quest.categoryLabel} />
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-800 dark:bg-slate-700 dark:text-white">
          {formatMinutes(quest.estimatedMinutes)}
        </span>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100">
          {formatXp(quest.xpReward)}
        </span>
      </div>

      {quest.tips && (
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-700/60 dark:text-slate-100 sm:text-sm">
          <span className="font-semibold">ヒント:</span> {quest.tips}
        </div>
      )}
      {quest.reason && (
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-700/60 dark:text-slate-100 sm:text-sm">
          <span className="font-semibold">理由:</span> {quest.reason}
        </div>
      )}

      {quest.status === "in_progress" && quest.progressPercent !== undefined && (
        <QuestProgressBar value={quest.progressPercent} max={100} />
      )}
      {quest.status === "completed" && quest.completedAt && (
        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          完了 ({new Date(quest.completedAt).toLocaleTimeString()})
        </div>
      )}

      <div className="pt-2">{renderActions()}</div>
    </div>
  );
}
