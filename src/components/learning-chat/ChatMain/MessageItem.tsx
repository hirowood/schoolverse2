"use client";

import { LearningChatMessage } from "@/features/learning-chat/types";
import { CodeBlock } from "./CodeBlock";

export function MessageItem({ message }: { message: LearningChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm sm:max-w-[75%] ${
          isUser
            ? "rounded-br-md bg-slate-900 text-white"
            : "rounded-bl-md border border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <span className="font-semibold">{isUser ? "あなた" : "AIコーチ"}</span>
          <span>
            {new Date(message.createdAt).toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div
          className={`mt-2 whitespace-pre-wrap text-[15px] leading-7 ${
            isUser ? "text-white" : "text-slate-900"
          }`}
        >
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
