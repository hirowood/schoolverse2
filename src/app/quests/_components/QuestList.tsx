"use client";

import { useMemo } from "react";
import { QuestCard } from "@/components/quests/QuestCard";
import { useQuestStore } from "@/hooks/useQuestStore";
import type { QuestFilter } from "@/types/quest";

const EMPTY_TEXT: Record<QuestFilter, string> = {
  all: "今日のクエストはまだありません。",
  in_progress: "進行中のクエストはありません。",
  completed: "完了済みのクエストはありません。",
  skipped: "スキップしたクエストはありません。",
};

export function QuestList() {
  const { quests, filter, acceptQuest, startQuest, skipQuest, openCompleteModal } = useQuestStore();

  const filtered = useMemo(() => {
    switch (filter) {
      case "in_progress":
        return quests.filter((quest) => quest.status === "in_progress");
      case "completed":
        return quests.filter((quest) => quest.status === "completed");
      case "skipped":
        return quests.filter((quest) => quest.status === "skipped");
      case "all":
      default:
        return quests;
    }
  }, [quests, filter]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {filtered.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onAccept={(id) => void acceptQuest(id)}
          onStart={(id) => void startQuest(id)}
          onComplete={(id) => openCompleteModal(id)}
          onSkip={(id) => void skipQuest(id)}
        />
      ))}

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
          {EMPTY_TEXT[filter]}
        </p>
      )}
    </div>
  );
}
