"use client";

import { LearningChatSession, MODE_LABEL } from "@/features/learning-chat/types";
import { SessionItem } from "./SessionItem";
import { cardClassName } from "@/components/ui/Card";

type Props = {
  title: string;
  sessions: LearningChatSession[];
  emptyText?: string;
  onSelect: (id: string) => Promise<void>;
};

export function SessionList({ title, sessions, onSelect, emptyText = "まだ登録がありません" }: Props) {
  const isEmpty = sessions.length === 0;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between text-slate-600">
        <p className="text-sm font-semibold">{title}</p>
        {!isEmpty && <span className="text-xs text-slate-400">{sessions.length}件</span>}
      </div>
      {isEmpty ? (
        <p
          className={cardClassName({
            variant: "subtle",
            padding: "sm",
            radius: "lg",
            className: "border-dashed text-sm text-slate-500",
          })}
        >
          {emptyText}
        </p>
      ) : (
        <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "260px" }}>
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              onClick={() => onSelect(session.id)}
              modeLabel={MODE_LABEL[session.mode as keyof typeof MODE_LABEL] ?? session.mode}
            />
          ))}
        </div>
      )}
    </section>
  );
}
