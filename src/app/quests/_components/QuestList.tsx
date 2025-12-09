"use client";

import { useMemo } from "react";
import { QuestCard } from "@/components/quests/QuestCard";
import { useQuestStore } from "@/hooks/useQuestStore";

export function QuestList() {
  const { quests, filter, acceptQuest, startQuest, skipQuest, openCompleteModal } = useQuestStore();

  const filtered = useMemo(() => {
    switch (filter) {
      case "in_progress":
        return quests.filter((q) => q.status === "in_progress");
      case "completed":
        return quests.filter((q) => q.status === "completed");
      case "skipped":
        return quests.filter((q) => q.status === "skipped");
      case "all":
      default:
        return quests;
    }
  }, [quests, filter]);

  return (
    <div className="space-y-3">
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
      {filtered.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-300">クエストがありません。</p>}
    </div>
  );
}
