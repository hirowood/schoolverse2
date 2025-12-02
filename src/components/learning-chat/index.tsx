"use client";

import { LearningChatProvider } from "./LearningChatProvider";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMain } from "./ChatMain";
import { useStreamingMessage } from "./hooks/useStreamingMessage";

export function LearningChat() {
  return (
    <LearningChatProvider>
      <LearningChatBody />
    </LearningChatProvider>
  );
}

function LearningChatBody() {
  const { error, clearError } = useStreamingMessage();

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <div className="flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-[11px] font-semibold text-red-700 underline"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
      <div className="grid min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-[320px,1fr]">
        <ChatSidebar />
        <ChatMain />
      </div>
    </div>
  );
}
