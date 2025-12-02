"use client";

import { LearningChatSession, MODE_LABEL } from "@/features/learning-chat/types";
import { SessionItem } from "./SessionItem";

type Props = {
  title: string;
  sessions: LearningChatSession[];
  emptyText?: string;
  onSelect: (id: string) => Promise<void>;
};

export function SessionList({ title, sessions, onSelect, emptyText = "なし" }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">{title}</p>
        {sessions.length > 0 && (
          <span className="text-[11px] text-slate-400">{sessions.length}件</span>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-1 overflow-y-auto pr-1" style={{ maxHeight: "240px" }}>
          {sessions.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              onClick={() => onSelect(s.id)}
              modeLabel={MODE_LABEL[s.mode as keyof typeof MODE_LABEL] ?? s.mode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
