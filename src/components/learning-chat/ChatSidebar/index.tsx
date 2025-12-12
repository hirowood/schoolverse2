"use client";

import { useMemo } from "react";
import { useChatSession } from "../hooks/useChatSession";
import { ModeFilter } from "./ModeFilter";
import { NewChatButton } from "./NewChatButton";
import { SessionList } from "./SessionList";
import { cardClassName } from "@/components/ui/Card";

export function ChatSidebar() {
  const { sessions, selectSession, createSession, modeFilter, setModeFilter } = useChatSession();

  const { pinned, recent } = useMemo(() => {
    const pinnedSessions = sessions.filter((s) => s.isPinned);
    const recentSessions = sessions.filter((s) => !s.isPinned);
    return { pinned: pinnedSessions, recent: recentSessions };
  }, [sessions]);

  return (
    <aside
      className={cardClassName({
        className: "flex h-full w-full flex-col gap-5",
        radius: "xl",
      })}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            Learning Chat
          </p>
          <h2 className="text-xl font-semibold text-slate-900">学習チャット</h2>
          <p className="mt-1 text-sm text-slate-500">モードとカテゴリで整理された相談履歴</p>
        </div>
        <NewChatButton onCreate={createSession} />
      </div>

      <ModeFilter mode={modeFilter} onChange={setModeFilter} />

      <div className="flex-1 space-y-5 overflow-hidden">
        <SessionList title="📌 固定" sessions={pinned} onSelect={selectSession} emptyText="ピン留めなし" />
        <SessionList title="🕒 最近" sessions={recent} onSelect={selectSession} emptyText="まだ相談がありません" />
      </div>
    </aside>
  );
}
