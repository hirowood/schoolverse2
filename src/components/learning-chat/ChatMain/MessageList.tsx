"use client";

import { useEffect, useRef } from "react";
import { LearningChatMessage } from "@/features/learning-chat/types";
import { MessageItem } from "./MessageItem";

type Props = {
  messages: LearningChatMessage[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

export function MessageList({ messages, isLoading = false, hasMore = false, onLoadMore }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !onLoadMore) return;

    const handleScroll = () => {
      if (el.scrollTop < 40 && hasMore) {
        onLoadMore();
      }
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, onLoadMore]);

  return (
    <div
      ref={listRef}
      className="flex h-full flex-col gap-2 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-3"
    >
      {isLoading && messages.length === 0 ? (
        <p className="text-center text-sm text-slate-500">読み込み中...</p>
      ) : null}
      {!isLoading && messages.length === 0 ? (
        <p className="text-center text-sm text-slate-500">まだメッセージがありません。最初の質問を送ってみてください。</p>
      ) : null}
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="mx-auto text-[11px] font-semibold text-slate-500 underline"
        >
          履歴をもっと見る
        </button>
      )}
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
