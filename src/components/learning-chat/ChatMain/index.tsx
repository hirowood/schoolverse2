"use client";

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { useChatSession } from "../hooks/useChatSession";
import { useChatMessages } from "../hooks/useChatMessages";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";

type ChatMainProps = {
  onOpenSidebar?: () => void;
};

export function ChatMain({ onOpenSidebar }: ChatMainProps) {
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
      <section
        className={cardClassName({
          className: "flex h-full flex-col items-center justify-center text-center",
          padding: "lg",
          radius: "xl",
        })}
      >
        <p className="text-base font-semibold text-slate-900">まだ相談がありません</p>
        <p className="mt-1 text-sm text-slate-600">
          新しいチャットを作成するか、履歴から選択してください。
        </p>
        <div className="mt-5 flex w-full max-w-xs flex-col gap-3">
          <Button variant="solid" color="slate" size="tap" onClick={() => createSession()}>
            新しいチャットを始める
          </Button>
          {onOpenSidebar && (
            <Button
              variant="outline"
              size="tap"
              onClick={onOpenSidebar}
              className="w-full text-slate-700"
            >
              過去のチャットを見る
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cardClassName({
        className: "flex h-full flex-col",
        padding: "none",
        radius: "xl",
      })}
    >
      <div className="border-b border-slate-200">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
              Learning Chat
            </p>
            <p className="text-lg font-semibold text-slate-900">{currentSession.title}</p>
            <p className="text-sm text-slate-500">{currentSession.contextSummary ?? "現在の相談"}</p>
          </div>
          {onOpenSidebar && (
            <Button
              size="tap"
              variant="outline"
              className="whitespace-nowrap rounded-full px-4"
              onClick={onOpenSidebar}
            >
              履歴一覧
            </Button>
          )}
        </div>
        <div className="hidden lg:block">
          <ChatHeader session={currentSession} />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoadingMessages}
          onLoadMore={loadMoreMessages}
          hasMore={hasMoreMessages}
        />
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
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
