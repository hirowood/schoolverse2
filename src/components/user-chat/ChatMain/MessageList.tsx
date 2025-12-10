import { useEffect, useMemo, useRef } from "react";
import type { ChatRoomMessage } from "@/features/user-chat/types";
import { DateSeparator } from "./DateSeparator";
import { MessageItem } from "./MessageItem";

type Props = {
  messages: ChatRoomMessage[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  currentUserId?: string | null;
};

export function MessageList({ messages, isLoading, hasMore, onLoadMore, currentUserId }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !onLoadMore) return;
    const handler = () => {
      if (el.scrollTop < 20 && hasMore) onLoadMore();
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [hasMore, onLoadMore]);

  const itemsWithSeparators = useMemo(() => {
    const output: Array<{ type: "date"; date: Date } | { type: "message"; message: ChatRoomMessage }> = [];
    let lastDate: string | null = null;
    messages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (dateKey !== lastDate) {
        output.push({ type: "date", date: new Date(msg.createdAt) });
        lastDate = dateKey;
      }
      output.push({ type: "message", message: msg });
    });
    return output;
  }, [messages]);

  return (
    <div
      ref={listRef}
      className="flex h-full flex-col gap-2 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-3"
    >
      {isLoading && messages.length === 0 ? (
        <p className="text-center text-sm text-slate-500">読み込み中...</p>
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

      {itemsWithSeparators.map((item, idx) => {
        if (item.type === "date") {
          return <DateSeparator key={`date-${idx}`} date={item.date} />;
        }
        return <MessageItem key={item.message.id} message={item.message} currentUserId={currentUserId} />;
      })}
    </div>
  );
}
