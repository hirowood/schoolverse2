"use client";

import { useMemo } from "react";
import { useChatSession } from "../hooks/useChatSession";
import { ModeFilter } from "./ModeFilter";
import { NewChatButton } from "./NewChatButton";
import { SessionList } from "./SessionList";

export function ChatSidebar() {
  const { sessions, selectSession, createSession, modeFilter, setModeFilter } = useChatSession();

  const { pinned, recent } = useMemo(() => {
    const pinnedSessions = sessions.filter((s) => s.isPinned);
    const recentSessions = sessions.filter((s) => !s.isPinned);
    return { pinned: pinnedSessions, recent: recentSessions };
  }, [sessions]);

  return (
    <aside className="flex h-full w-full flex-col gap-4 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Learning Chat
          </p>
          <h2 className="text-lg font-semibold text-slate-900">学習チャット</h2>
        </div>
        <NewChatButton onCreate={createSession} />
      </div>

      <ModeFilter mode={modeFilter} onChange={setModeFilter} />

      <div className="flex-1 space-y-3 overflow-hidden">
        <SessionList title="📌 固定" sessions={pinned} onSelect={selectSession} emptyText="ピン留めなし" />
        <SessionList title="🕒 最近" sessions={recent} onSelect={selectSession} emptyText="まだ相談がありません" />
      </div>
    </aside>
  );
}
