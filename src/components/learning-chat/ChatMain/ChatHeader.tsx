"use client";

import { CATEGORY_LABEL, MODE_LABEL, LearningChatSession } from "@/features/learning-chat/types";

export function ChatHeader({ session }: { session: LearningChatSession }) {
  const modeLabel = MODE_LABEL[session.mode as keyof typeof MODE_LABEL] ?? session.mode;
  const categoryLabel =
    (session.category && CATEGORY_LABEL[session.category as keyof typeof CATEGORY_LABEL]) ||
    session.category;

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Learning Chat
        </p>
        <h1 className="text-xl font-semibold text-slate-900">{session.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-900 px-2 py-0.5 font-semibold text-white">
            {modeLabel}
          </span>
          {categoryLabel && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
              {categoryLabel}
            </span>
          )}
          {session.contextSummary && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
              要約あり
            </span>
          )}
        </div>
      </div>
      <div className="text-right text-[11px] text-slate-500">
        <p>作成: {new Date(session.createdAt).toLocaleString()}</p>
        <p>更新: {new Date(session.updatedAt).toLocaleString()}</p>
      </div>
    </header>
  );
}
