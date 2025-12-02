"use client";

export function TypingIndicator() {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs text-slate-600">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      <span>AIが回答を作成しています...</span>
    </div>
  );
}
