"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useCoachChat } from "@/hooks/useCoachChat";
import { ChatInputForm } from "./ChatInputForm";
import { ChatMessageList } from "./ChatMessageList";

export function ChatPanel() {
  const {
    messages,
    isLoading,
    isSending,
    error,
    retryAfter,
    sendMessage,
    clearError,
  } = useCoachChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    clearError();
    await sendMessage(text);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <ChatMessageList messages={messages} isLoading={isLoading} bottomRef={bottomRef} />

      {error && (
        <div className="border-t border-slate-200 bg-red-50 px-4 py-2">
          <p className="text-sm text-red-600">
            {error}
            {retryAfter !== null && retryAfter > 0 && (
              <span className="ml-1">あと{retryAfter}秒後に再送信できます</span>
            )}
          </p>
        </div>
      )}

      <ChatInputForm
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        isSending={isSending}
        disabled={isSending || (retryAfter !== null && retryAfter > 0)}
      />
    </div>
  );
}
