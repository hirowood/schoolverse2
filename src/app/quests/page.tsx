"use client";

import { useEffect, useMemo } from "react";
import { useQuestStore } from "@/hooks/useQuestStore";
import { QuestCompleteModal } from "@/components/quests/QuestCompleteModal";
import { QuestRegenerateModal } from "@/components/quests/QuestRegenerateModal";
import {
  QuestHeader,
  QuestFilterBar,
  QuestList,
  QuestSidebar,
  EmptyState,
} from "./_components";
import { XpToastContainer } from "@/components/gamification/XpToastContainer";

const formatDateLabel = () => {
  const now = new Date();
  const weekday = now.toLocaleDateString("ja-JP", { weekday: "short" });
  const date = now.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${date} (${weekday})`;
};

export default function QuestsPage() {
  const {
    quests,
    filter,
    isLoading,
    error,
    canRegenerate,
    regenerateRemaining,
    showCompleteModal,
    showRegenerateModal,
    selectedQuestId,
    fetchTodayQuests,
    setFilter,
    regenerateQuests,
    completeQuest,
    closeCompleteModal,
    openRegenerateModal,
    closeRegenerateModal,
  } = useQuestStore();

  useEffect(() => {
    void fetchTodayQuests();
  }, [fetchTodayQuests]);

  const counts = useMemo(
    () => ({
      all: quests.length,
      in_progress: quests.filter((q) => q.status === "in_progress").length,
      completed: quests.filter((q) => q.status === "completed").length,
      skipped: quests.filter((q) => q.status === "skipped").length,
    }),
    [quests],
  );

  const selectedQuest = quests.find((q) => q.id === selectedQuestId);

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
      <QuestHeader
        dateLabel={formatDateLabel()}
        canRegenerate={canRegenerate}
        regenerateRemaining={regenerateRemaining}
        onRegenerate={openRegenerateModal}
        isRegenerating={isLoading}
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-100">
          {error}
        </div>
      )}

      <QuestFilterBar filter={filter} onChange={setFilter} counts={counts} />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {isLoading && quests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              読み込み中...
            </div>
          ) : quests.length > 0 ? (
            <QuestList />
          ) : (
            <EmptyState
              canGenerate={canRegenerate}
              regenerateRemaining={regenerateRemaining}
              isGenerating={isLoading}
              onGenerate={() => void regenerateQuests()}
            />
          )}
        </div>
        <div className="lg:col-span-4">
          <QuestSidebar />
        </div>
      </div>

      <QuestCompleteModal
        quest={selectedQuest}
        open={showCompleteModal}
        onClose={closeCompleteModal}
        onSubmit={(data) => {
          if (selectedQuestId) void completeQuest(selectedQuestId, data);
        }}
      />

      <QuestRegenerateModal
        open={showRegenerateModal}
        regenerateRemaining={regenerateRemaining}
        onClose={closeRegenerateModal}
        onRegenerate={(opts) => void regenerateQuests(opts)}
      />

      <XpToastContainer />
    </main>
  );
}
