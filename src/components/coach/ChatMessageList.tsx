"use client";

import type { ChatMessage } from "@/hooks/useCoachChat";
import { MessageBubble } from "./MessageBubble";

type Props = {
  messages: ChatMessage[];
  isLoading: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

export const ChatMessageList = ({ messages, isLoading, bottomRef }: Props) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
    {isLoading && (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        <span className="mt-2 text-sm text-slate-500">ロード中...</span>
      </div>
    )}

    {!isLoading && messages.length === 0 && (
      <div className="py-8 text-center">
        <p className="text-sm text-slate-500">チャット履歴がありません</p>
        <p className="mt-1 text-xs text-slate-400">例: 週間振り返りや気になることを入力してみましょう</p>
      </div>
    )}

    {messages.map((msg) => (
      <MessageBubble key={msg.id} message={msg} />
    ))}

    <div ref={bottomRef} />
  </div>
);
