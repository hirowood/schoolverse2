"use client";

import { ReactNode, useState } from "react";
import { LearningChatProvider } from "./LearningChatProvider";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMain } from "./ChatMain";
import { useStreamingMessage } from "./hooks/useStreamingMessage";
import { cn } from "@/lib/cn";

export function LearningChat() {
  return (
    <LearningChatProvider>
      <LearningChatBody />
    </LearningChatProvider>
  );
}

function LearningChatBody() {
  const { error, clearError } = useStreamingMessage();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-xs font-semibold underline"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
      <div className="grid min-h-[540px] grid-cols-1 gap-4 lg:grid-cols-[320px,1fr]">
        <div className="hidden lg:block">
          <ChatSidebar />
        </div>
        <ChatMain onOpenSidebar={() => setSidebarOpen(true)} />
      </div>
      <MobileSidebarDrawer open={isSidebarOpen} onClose={() => setSidebarOpen(false)}>
        <ChatSidebar />
      </MobileSidebarDrawer>
    </div>
  );
}

// モバイルではチャット一覧をドロワー表示に切り替える
function MobileSidebarDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
      role="dialog"
      aria-label="チャットセッション一覧"
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/60 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex max-w-full transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full w-[86vw] max-w-sm flex-col overflow-y-auto bg-white px-4 py-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">チャット履歴</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              閉じる
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
