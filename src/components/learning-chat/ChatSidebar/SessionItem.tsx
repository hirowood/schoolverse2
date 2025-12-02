"use client";

import { CATEGORY_LABEL, LearningChatSession } from "@/features/learning-chat/types";

export function SessionItem({
  session,
  onClick,
  modeLabel,
}: {
  session: LearningChatSession;
  onClick: () => void;
  modeLabel: string;
}) {
  const categoryLabel =
    (session.category && CATEGORY_LABEL[session.category as keyof typeof CATEGORY_LABEL]) ||
    session.category;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="line-clamp-1 text-sm font-semibold text-slate-900">{session.title}</p>
        {session.isPinned && <span className="text-[11px] text-amber-500">📌</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
          {modeLabel}
        </span>
        {categoryLabel && (
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
            {categoryLabel}
          </span>
        )}
        <span className="text-slate-400">
          {new Date(session.createdAt).toLocaleDateString("ja-JP")}
        </span>
      </div>
    </button>
  );
}
