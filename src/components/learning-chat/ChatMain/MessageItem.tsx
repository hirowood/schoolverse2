"use client";

import { LearningChatMessage } from "@/features/learning-chat/types";
import { CodeBlock } from "./CodeBlock";

export function MessageItem({ message }: { message: LearningChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 shadow-sm ${
          isUser
            ? "bg-slate-900 text-white rounded-br-sm"
            : "bg-white border border-slate-200 rounded-bl-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
          <span className="font-semibold">{isUser ? "あなた" : "AIコーチ"}</span>
          <span>{new Date(message.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>
        {message.codeBlocks?.blocks?.length ? (
          <div className="mt-2 space-y-2">
            {message.codeBlocks.blocks.map((block, idx) => (
              <CodeBlock key={`${block.language}-${idx}`} language={block.language} code={block.code} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
