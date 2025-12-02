"use client";

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { useChatSession } from "../hooks/useChatSession";
import { useChatMessages } from "../hooks/useChatMessages";

export function ChatMain() {
  const { currentSession, createSession } = useChatSession();
  const {
    messages,
    sendMessage,
    isLoadingMessages,
    isStreaming,
    hasMoreMessages,
    loadMoreMessages,
    selectedCategory,
    setSelectedCategory,
  } = useChatMessages();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text, selectedCategory ?? undefined);
  };

  if (!currentSession) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-center shadow-sm">
        <p className="text-sm text-slate-600">まだ相談がありません</p>
        <button
          type="button"
          onClick={() => createSession()}
          className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          新しいチャットを始める
        </button>
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-white shadow-sm">
      <ChatHeader session={currentSession} />
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoadingMessages}
          onLoadMore={loadMoreMessages}
          hasMore={hasMoreMessages}
        />
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        {isStreaming && <TypingIndicator />}
        <MessageInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          category={selectedCategory}
          setCategory={setSelectedCategory}
          disabled={isStreaming}
        />
      </div>
    </section>
  );
}
