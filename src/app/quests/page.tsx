"use client";

import { useEffect, useMemo } from "react";
import { QuestCompleteModal } from "@/components/quests/QuestCompleteModal";
import { QuestRegenerateModal } from "@/components/quests/QuestRegenerateModal";
import { XpToastContainer } from "@/components/gamification/XpToastContainer";
import { useQuestStore } from "@/hooks/useQuestStore";
import { QuestFilterBar, QuestHeader, QuestList, QuestSidebar, EmptyState } from "./_components";

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
      in_progress: quests.filter((quest) => quest.status === "in_progress").length,
      completed: quests.filter((quest) => quest.status === "completed").length,
      skipped: quests.filter((quest) => quest.status === "skipped").length,
    }),
    [quests],
  );

  const selectedQuest = quests.find((quest) => quest.id === selectedQuestId);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 px-4 pb-16 pt-6 sm:gap-6 sm:px-6">
      <QuestHeader
        dateLabel={formatDateLabel()}
        canRegenerate={canRegenerate}
        regenerateRemaining={regenerateRemaining}
        onRegenerate={openRegenerateModal}
        isRegenerating={isLoading}
      />

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm dark:border-red-800 dark:bg-red-900/30 dark:text-red-100"
        >
          {error}
        </div>
      )}

      <QuestFilterBar filter={filter} onChange={setFilter} counts={counts} />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {isLoading && quests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
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
        onRegenerate={(options) => void regenerateQuests(options)}
      />

      <XpToastContainer />
    </main>
  );
}
