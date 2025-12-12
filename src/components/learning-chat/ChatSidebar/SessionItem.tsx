"use client";

import { CATEGORY_LABEL, LearningChatSession } from "@/features/learning-chat/types";
import { cardClassName } from "@/components/ui/Card";

type Props = {
  session: LearningChatSession;
  onClick: () => void;
  modeLabel: string;
};

export function SessionItem({ session, onClick, modeLabel }: Props) {
  const categoryLabel =
    (session.category && CATEGORY_LABEL[session.category as keyof typeof CATEGORY_LABEL]) ||
    session.category ||
    "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cardClassName({
        padding: "sm",
        radius: "lg",
        shadow: "sm",
        className:
          "w-full text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
      })}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="line-clamp-2 text-base font-semibold text-slate-900">{session.title}</p>
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-white">{modeLabel}</span>
            {categoryLabel && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                {categoryLabel}
              </span>
            )}
            <span className="text-slate-400">
              {new Date(session.createdAt).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
        {session.isPinned && <span className="text-lg text-amber-500" aria-label="pinned">📌</span>}
      </div>
      {session.contextSummary && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{session.contextSummary}</p>
      )}
    </button>
  );
}
