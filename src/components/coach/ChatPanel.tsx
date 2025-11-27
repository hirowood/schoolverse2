// src/components/coach/ChatPanel.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useCoachChat } from "@/hooks/useCoachChat";
import { MessageBubble } from "./MessageBubble";

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

  // メッセージ追加時に自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    clearError();
    await sendMessage(text);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            <span className="ml-2 text-sm text-slate-500">読み込み中...</span>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">
              まだメッセージがありません。
            </p>
            <p className="mt-1 text-xs text-slate-400">
              例: 「英語の勉強のコツは？」「今日やる気が出ない」
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="border-t border-slate-200 bg-red-50 px-4 py-2">
          <p className="text-sm text-red-600">
            {error}
            {retryAfter !== null && retryAfter > 0 && (
              <span className="ml-1">（{retryAfter}秒後に再試行可能）</span>
            )}
          </p>
        </div>
      )}

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50 disabled:text-slate-400"
            rows={2}
            maxLength={500}
            placeholder="例: 数学の苦手をどう克服すればいい？ / 今日の気分は少しだるい"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending || (retryAfter !== null && retryAfter > 0)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim() || (retryAfter !== null && retryAfter > 0)}
            className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? (
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                送信中
              </span>
            ) : (
              "送信"
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Shift + Enter で改行、Enter で送信
        </p>
      </form>
    </div>
  );
}
