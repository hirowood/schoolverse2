// src/components/coach/MessageBubble.tsx
"use client";

import type { ChatMessage } from "@/hooks/useCoachChat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
          isUser
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-900"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.message}</p>
        <p
          className={`mt-1 text-xs ${
            isUser ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
