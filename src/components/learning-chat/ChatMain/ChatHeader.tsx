"use client";

import { CATEGORY_LABEL, MODE_LABEL, LearningChatSession } from "@/features/learning-chat/types";

export function ChatHeader({ session }: { session: LearningChatSession }) {
  const modeLabel = MODE_LABEL[session.mode as keyof typeof MODE_LABEL] ?? session.mode;
  const categoryLabel =
    (session.category && CATEGORY_LABEL[session.category as keyof typeof CATEGORY_LABEL]) ||
    session.category;

  return (
    <header className="flex items-start justify-between gap-6 border-b border-slate-200 px-6 py-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Learning Chat
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{session.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="rounded-full bg-slate-900 px-3 py-0.5 font-semibold text-white">
            {modeLabel}
          </span>
          {categoryLabel && (
            <span className="rounded-full bg-indigo-50 px-3 py-0.5 font-semibold text-indigo-700">
              {categoryLabel}
            </span>
          )}
          {session.contextSummary && (
            <span className="rounded-full bg-amber-50 px-3 py-0.5 text-amber-700">要約あり</span>
          )}
        </div>
        {session.contextSummary && (
          <p className="text-sm text-slate-500">概要: {session.contextSummary}</p>
        )}
      </div>
      <div className="text-right text-sm text-slate-500">
        <p>作成: {new Date(session.createdAt).toLocaleString("ja-JP")}</p>
        <p>更新: {new Date(session.updatedAt).toLocaleString("ja-JP")}</p>
      </div>
    </header>
  );
}
